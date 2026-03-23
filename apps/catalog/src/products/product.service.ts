import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product, ProductDocument, ProductStatus } from "./product.schema";
import { isValidObjectId, Model } from "mongoose";
import { rpcBadRequest, rpcNotFound } from "@app/rpc";

@Injectable()
export class ProductService{

    constructor(
        @InjectModel(Product.name)
        private readonly productModel:Model<ProductDocument>,
    ){}

    async createNewProduct(input:{
        name:string;
        description:string;
        price:number;
        status?:string;
        imageUrl?:string;
        createdByClerkUserId:string
    }){

        if(!input.name || !input.description){
            throw rpcBadRequest('name and description are required ')
        }

        if(typeof input.price != "number" || Number.isNaN(input.price)|| input.price < 0){
           throw rpcBadRequest('Price must be a valid number greater than 0')
        }

        if(input.status  && input.status !== "DRAFT" && input.status !== "ACTIVE"){
          throw  rpcBadRequest("Status must be either DRAFT or Active")
        }

        const newlyCreatedProduct = await this.productModel.create({
            name:input.name,
            description:input.description,
            price:input.price,
            status:input.status,
            imageUrl:input.imageUrl,
            createdByClerkUserId:input.createdByClerkUserId
        })

        return newlyCreatedProduct

    }

    async listProduct(){
        return await this.productModel.find().sort({createdAt:-1}).exec()
    }

    async getProductById(input:{id:string}){

        if(!isValidObjectId(input.id)){
            rpcBadRequest("Invalid produt Id")
        }

        const product = await this.productModel.findById(input.id).exec()
        if(!product){
           throw rpcNotFound("Product is not found")
        }

        return product
    }

    async updateProduct(input:{
        id:string;
        name?:string;
        description?:string;
        price?:number;
        status?:string;
        imageUrl?:string;
    }){
        if(!isValidObjectId(input.id)){
            throw rpcBadRequest("Invalid product Id")
        }

        const product = await this.productModel.findById(input.id).exec()
        if(!product){
           throw rpcNotFound("Product is not found")
        }

        if(input.status && input.status !== "DRAFT" && input.status !== "ACTIVE"){
            throw rpcBadRequest("Status must be either DRAFT or ACTIVE")
        }

        if(typeof input.price !== 'undefined' && (typeof input.price !== 'number' || Number.isNaN(input.price) || input.price < 0)){
            throw rpcBadRequest("Price must be a valid number greater than 0")
        }

        const updateData: Partial<Product> = {}
        if(input.name) updateData.name = input.name
        if(input.description) updateData.description = input.description
        if(typeof input.price === 'number') updateData.price = input.price
        if(input.status) updateData.status = input.status as ProductStatus
        if(input.imageUrl) updateData.imageUrl = input.imageUrl

        const updatedProduct = await this.productModel.findByIdAndUpdate(
            input.id,
            updateData,
            { new: true }
        ).exec()

        return updatedProduct
    }

    async deleteProduct(input:{id:string}){
        if(!isValidObjectId(input.id)){
            throw rpcBadRequest("Invalid product Id")
        }

        const product = await this.productModel.findById(input.id).exec()
        if(!product){
           throw rpcNotFound("Product is not found")
        }

        await this.productModel.findByIdAndDelete(input.id).exec()
        return { success: true, message: "Product deleted successfully" }
    }
}