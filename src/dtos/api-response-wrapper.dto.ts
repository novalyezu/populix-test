import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseWrapper<T> {
  data: T; // Swagger Decorator is added in the extended class below, since that will override this one.

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  message?: string;
}

export class ApiErrorResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  requestId: string;
}

export function SwaggerApiResponseWrapper<T>(type: T) {
  class SwaggerApiResponseWrapper<T> extends ApiResponseWrapper<T> {
    @ApiProperty({ type })
    data: T;
  }

  return SwaggerApiResponseWrapper;
}
