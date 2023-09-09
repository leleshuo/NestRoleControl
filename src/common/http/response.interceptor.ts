import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ResponseDto } from '../dtos/response.dto';
import { map } from 'rxjs/operators'; // 异步操作符
import { Observable } from 'rxjs'; // 异步操作

@Injectable()
export class HttpResponseInterceptor<T> implements NestInterceptor<T> {
  /**
   * Intercept the request and add the timestamp
   * @param context {ExecutionContext}
   * @param next {CallHandler}
   * @returns { data:Response<T>, timestamp: string }
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseDto<T>> {
    const timestamp = new Date().getTime();
    return next.handle().pipe(
      map((data) => {
        return { data, timestamp, statusCode: 200 };
      }),
    );
  }
}
