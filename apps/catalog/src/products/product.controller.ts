import { Controller } from "@nestjs/common";
import { ProductService } from "./product.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateProductDto, GetProductByIdDto, UpdateProductDto, DeleteProductDto } from "./product.dto";

@Controller()
export class ProductController{
    constructor(
        private readonly productService:ProductService
    ){}

 @MessagePattern('product.create')
 create(@Payload() payload:CreateProductDto){
    return this.productService.createNewProduct(payload)
 }

 @MessagePattern('product.list')
 list(){
    return this.productService.listProduct()
 }

 @MessagePattern('product.getById')
 getById(@Payload() payload:GetProductByIdDto){
   return this.productService.getProductById(payload)
 }

 @MessagePattern('product.update')
 update(@Payload() payload:UpdateProductDto){
   return this.productService.updateProduct(payload)
 }

 @MessagePattern('product.delete')
 delete(@Payload() payload:DeleteProductDto){
   return this.productService.deleteProduct(payload)
 }
}
