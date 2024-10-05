import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { error } from 'console';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // Check if it's a validation error and format it
    if (Array.isArray(exceptionResponse.message)) {
      const firstErrorMessage = exceptionResponse.message[0];
      return response.status(status).json({
        statusCode: status,
        message: firstErrorMessage,
        error: 'Bad Request',
      });
    }

    // Default handling for other BadRequestExceptions
    return response.status(status).json({
      statusCode: status,
      error: exceptionResponse.message,
    });
  }
}
