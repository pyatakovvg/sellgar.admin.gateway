import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

type ExceptionResponse = {
  message?: unknown;
  error?: unknown;
  code?: unknown;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : !!exception ? exception : 'Internal server error';
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
