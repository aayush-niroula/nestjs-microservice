import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Put, Delete, UseGuards } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CurrentUser } from "../auth/current-user.decorator";
import type { UserContext } from "../auth/auth.types";
import { mapRpcErrorToHttp } from "@app/rpc";
import { firstValueFrom } from "rxjs";
import { JwtAuthGuard } from "../auth/jwt-auth-guard";
import { AdminOnly } from "../auth/admin.decorator";

type Product ={
    _id:string,
    name:string,
    description:string;
    price:number;
    imageUrl:string
    status:'DRAFT' | 'ACTIVE';
    createdByClerkUserId:string;
}

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductHttpController{
    constructor(
        @Inject('CATALOG_CLIENT') private readonly catalogClient:ClientProxy
    ){}

    @Get()
    async listProducts(){
        let products:Product[]
        try {
            products = await firstValueFrom(
                this.catalogClient.send('product.list',{})
            )
        } catch (error) {
            mapRpcErrorToHttp(error)
        }
        return products
    }

    @Get(':id')
    async getProduct(
        @Param('id', ParseUUIDPipe) id:string
    ){
        let product:Product
        try {
            product = await firstValueFrom(
                this.catalogClient.send('product.getById',{id})
            )
        } catch (error) {
            mapRpcErrorToHttp(error)
        }
        return product
    }

    @Post()
    @AdminOnly()
    async createProduct(
        @CurrentUser() user :UserContext,
        @Body()
        body:{
            name:string;
            description:string;
            price:number;
            status?:string;
            imageUrl?:string;
        }
    ){

        let product:Product

        const payload={
            name:body.name,
            description:body.description,
            price:body.price,
            status:body.status,
            imageUrl:body.imageUrl || '',
            createdByClerkUserId: user.clerkUserId
        }

        try {
            product = await firstValueFrom(
                this.catalogClient.send('product.create',payload)
            )
            
        } catch (error) {
            mapRpcErrorToHttp(error)
        }
        return product

    }

    @Put(':id')
    @AdminOnly()
    async updateProduct(
        @Param('id', ParseUUIDPipe) id:string,
        @CurrentUser() user :UserContext,
        @Body()
        body:{
            name?:string;
            description?:string;
            price?:number;
            status?:string;
            imageUrl?:string;
        }
    ){

        let product:Product

        const payload={
            id,
            name:body.name,
            description:body.description,
            price:body.price,
            status:body.status,
            imageUrl:body.imageUrl
        }

        try {
            product = await firstValueFrom(
                this.catalogClient.send('product.update',payload)
            )
            
        } catch (error) {
            mapRpcErrorToHttp(error)
        }
        return product

    }

    @Delete(':id')
    @AdminOnly()
    async deleteProduct(
        @Param('id', ParseUUIDPipe) id:string
    ){

        let result:{success:boolean, message:string}

        try {
            result = await firstValueFrom(
                this.catalogClient.send('product.delete',{id})
            )
            
        } catch (error) {
            mapRpcErrorToHttp(error)
        }
        return result

    }
}
