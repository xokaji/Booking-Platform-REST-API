import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';

/**
 * Wraps every successful controller return value into a consistent
 * { success, message, data } envelope, so consumers never have to guess
 * the response shape.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: (data && data.message) || 'Request successful',
        data: data && data.message !== undefined && data.data !== undefined ? data.data : data,
      })),
    );
  }
}
