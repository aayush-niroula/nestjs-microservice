import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CurrentUser } from "../auth/current-user.decorator";
import type { UserContext } from "../auth/auth.types";
import { mapRpcErrorToHttp } from "@app/rpc";
import { firstValueFrom } from "rxjs";

type Product ={
    _id:string,
    name:string,
    description:string;
    price:number;
    imageUrl:string
    status:'DRAFT' | 'ACTIVE';
    createdByClerkUserId:string;
}
@Controller()
export class ProductHttpController{
    constructor(
        @Inject('CATALOG_CLIENT') private readonly catalogClient:ClientProxy
    ){}

    @Post('products')
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
            imageUrl:'',
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
}