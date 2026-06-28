/// <reference types="jest" />

import { Logger, UnauthorizedException } from '@nestjs/common';

import { AllExceptionsFilter } from './all-exception.filter';

describe('AllExceptionsFilter', () => {
  const loggerError = jest.spyOn(Logger.prototype, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    loggerError.mockRestore();
  });

  it('keeps auth error codes from HttpException responses', () => {
    const filter = new AllExceptionsFilter();
    const response = createResponse();

    filter.catch(new UnauthorizedException({ code: 'expired' }), createHost(response));

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        path: '/v1/auth/profile',
        method: 'GET',
        message: expect.any(String),
        code: 'expired',
      }),
    );
  });

  it('keeps status code from rpc error payloads', () => {
    const filter = new AllExceptionsFilter();
    const response = createResponse();

    filter.catch(
      {
        statusCode: 409,
        message: 'Product was changed by another request',
        error: 'Conflict',
      },
      createHost(response),
    );

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: 'Product was changed by another request',
        error: 'Conflict',
      }),
    );
  });

  it('keeps status code from nested rpc error responses', () => {
    const filter = new AllExceptionsFilter();
    const response = createResponse();

    filter.catch(
      {
        response: {
          statusCode: 409,
          message: 'Product was changed by another request',
          error: 'Conflict',
        },
      },
      createHost(response),
    );

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: 'Product was changed by another request',
        error: 'Conflict',
      }),
    );
  });

  function createHost(response: ReturnType<typeof createResponse>) {
    return {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({
          url: '/v1/auth/profile',
          method: 'GET',
        }),
      }),
    } as never;
  }

  function createResponse() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  }
});
