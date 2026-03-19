import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import type { ProductStatus } from './product.schema';

export class CreateProductDto {
  @IsString()
  name: string;
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  status?: ProductStatus;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  createdByClerkUserId:string
}

export class GetProductByIdDto{
    @IsString()
    id:string
}