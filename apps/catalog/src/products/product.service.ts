import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product, ProductDocument } from "./product.schema";
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
            rpcBadRequest('name and description are required ')
        }

        if(typeof input.price != "number" || Number.isNaN(input.price)|| input.price < 0){
            rpcBadRequest('Price must be a valid number greater than 0')
        }

        if(input.status  && input.status !== "DRAFT" && input.status !== "ACTIVE"){
            rpcBadRequest("Status must be either DRAFT or Active")
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
            rpcNotFound("Product is not found")
        }

        return product
    }
}