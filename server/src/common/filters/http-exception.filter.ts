import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 500;
    let message = '服务器错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const obj = body as Record<string, unknown>;
        message = String(obj.message ?? obj.error ?? message);
        if (Array.isArray(obj.message)) {
          message = obj.message.join('; ');
        }
      }
      code = status;
      if (status === HttpStatus.NOT_FOUND) code = 404;
      if (status === HttpStatus.BAD_REQUEST) code = 400;
      if (status === HttpStatus.UNAUTHORIZED) code = 401;
      if (status === HttpStatus.FORBIDDEN) code = 403;
      if (status === HttpStatus.CONFLICT) code = 409;
    } else if (exception instanceof Error) {
      console.error(exception);
      message = exception.message || message;
    }

    response.status(status).json({
      code,
      message,
      data: null,
    });
  }
}
