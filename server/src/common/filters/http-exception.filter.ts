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
    let code = 50000;
    let message = '服务器错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      let bizCode: number | undefined;
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const obj = body as Record<string, unknown>;
        if (typeof obj.code === 'number') bizCode = obj.code;
        if (Array.isArray(obj.message)) {
          message = obj.message.join('; ');
        } else {
          message = String(obj.message ?? obj.error ?? message);
        }
      }
      if (bizCode != null) {
        code = bizCode;
      } else if (status === HttpStatus.NOT_FOUND) {
        code = 404;
      } else if (status === HttpStatus.BAD_REQUEST) {
        code = 40001;
      } else if (status >= 500) {
        code = 50000;
      } else {
        code = status;
      }
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
