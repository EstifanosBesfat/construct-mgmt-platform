import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Prisma returns `Decimal` columns as decimal.js instances, which serialize to
 * JSON strings. The frontend expects plain numbers for budgets, quantities and
 * percentages, so every Decimal in a response body is converted here rather
 * than at each individual call site.
 *
 * The values in this system (budgets up to 10^13, quantities with 3 decimal
 * places) sit comfortably inside the range JavaScript numbers represent
 * exactly, so this conversion is lossless.
 */
@Injectable()
export class DecimalSerializerInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.serialize(data)));
  }

  private serialize(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (Prisma.Decimal.isDecimal(value)) {
      return (value as Prisma.Decimal).toNumber();
    }

    if (value instanceof Date) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.serialize(item));
    }

    if (typeof value === 'object') {
      const source = value as Record<string, unknown>;
      const result: Record<string, unknown> = {};

      for (const key of Object.keys(source)) {
        result[key] = this.serialize(source[key]);
      }

      return result;
    }

    return value;
  }
}
