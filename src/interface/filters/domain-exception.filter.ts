import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { InsufficientStockException } from '../../domain/product/exceptions/insufficient-stock.exception';
import { DuplicateSkuException } from '../../domain/product/exceptions/duplicate-sku.exception';
import { InvalidOrderQuantityException } from '../../domain/product/exceptions/invalid-order-quantity.exception';
import { InvalidOrderStateException } from '../../domain/product/exceptions/invalid-order-state.exception';
import { AlertAlreadyExistsException } from '../../domain/product/exceptions/alert-already-exists.exception';
import { ProductNotFoundException } from '../../domain/product/exceptions/product-not-found.exception';
import { OrderNotFoundException } from '../../domain/product/exceptions/order-not-found.exception';
import { CategoryNotFoundException } from '../../domain/category/exceptions/category-not-found.exception';
import { DuplicateCategoryException } from '../../domain/category/exceptions/duplicate-category.exception';

@Catch(
  InsufficientStockException,
  DuplicateSkuException,
  InvalidOrderQuantityException,
  InvalidOrderStateException,
  AlertAlreadyExistsException,
  CategoryNotFoundException,
  DuplicateCategoryException,
  ProductNotFoundException,
  OrderNotFoundException,
)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body = {
      statusCode: this.getStatusCode(exception),
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    };

    this.logger.error(
      `${request.method} ${request.url} ${body.statusCode}: ${exception.message}`,
    );

    response.status(body.statusCode).json(body);
  }

  private getStatusCode(exception: Error): number {
    switch (exception.constructor) {
      case InsufficientStockException:
        return 400;
      case DuplicateSkuException:
        return 409;
      case InvalidOrderQuantityException:
        return 400;
      case InvalidOrderStateException:
        return 400;
      case AlertAlreadyExistsException:
        return 409;
      case CategoryNotFoundException:
        return 404;
      case DuplicateCategoryException:
        return 409;
      case ProductNotFoundException:
        return 404;
      case OrderNotFoundException:
        return 404;
      default:
        return 400;
    }
  }
}
