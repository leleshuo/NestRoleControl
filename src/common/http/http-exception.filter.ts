import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { HttpErrorType } from './http-error-type';
import { ErrorType } from '../enums';
import { Response } from 'express';

@Catch(HttpException)
/**
 * exception 参数代表被抛出并未被捕获的异常
 * host 参数是类型为 ArgumentsHost 的对象。ArgumentsHost 是一个用于处理当前处理程序执行上下文的辅助类，它封装了请求和响应对象（在 HTTP 框架中）。使用 switchToHttp() 方法，可以获取 Request 和 Response 对象。
 */
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    let { errorType, message } = exception.getResponse() as {
      errorType: ErrorType | string;
      message: string | string[];
    };

    if (!errorType) {
      errorType = HttpErrorType[status];
      errorType = errorType ?? 'UNEXPECTED_ERROR';
    }
    response.status(status).json({
      data: {
        statusCode: status,
        errorType,
        message,
        timestamp: new Date().getTime(),
      },
    });
  }
}
