import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

type ExceptionResponse = {
  status?: unknown;
  statusCode?: unknown;
  message?: unknown;
  error?: unknown;
  code?: unknown;
  response?: unknown;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const exceptionResponse = this.toExceptionResponse(exception);
    const status = this.toStatus(exception, exceptionResponse);
    const responsePayload = this.toResponsePayload(exceptionResponse);
    const responseCode = typeof responsePayload.code === 'string' ? responsePayload.code : undefined;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.toMessage(exception, exceptionResponse, responsePayload),
      error: typeof exceptionResponse === 'string' ? null : responsePayload.error,
      ...(responseCode ? { code: responseCode } : {}),
    };

    // Логирование ошибки
    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }

  private toResponsePayload(response: unknown): ExceptionResponse {
    return response && typeof response === 'object' ? (response as ExceptionResponse) : {};
  }

  private toExceptionResponse(exception: unknown): unknown {
    if (exception instanceof HttpException) {
      return exception.getResponse();
    }

    const payload = this.toResponsePayload(exception);

    if (payload.response) {
      return payload.response;
    }

    return !!exception ? exception : 'Internal server error';
  }

  private toStatus(exception: unknown, response: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    const responseStatus = this.pickStatus(response);

    if (responseStatus) {
      return responseStatus;
    }

    const exceptionStatus = this.pickStatus(exception);

    return exceptionStatus ?? HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private pickStatus(value: unknown): number | undefined {
    const payload = this.toResponsePayload(value);
    const status = payload.statusCode ?? payload.status;

    return typeof status === 'number' && status >= 400 && status <= 599 ? status : undefined;
  }

  private toMessage(exception: unknown, response: unknown, payload: ExceptionResponse): unknown {
    if (typeof response === 'string') {
      return response;
    }

    if (payload.message) {
      return payload.message;
    }

    return exception instanceof Error ? exception.message : 'Internal server error';
  }
}
