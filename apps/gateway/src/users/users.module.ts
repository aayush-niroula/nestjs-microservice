import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./users.schema";
import { UsersService } from "./users.service";


@Module({
    imports:[
     //register the user model for the dependency injection 
      MongooseModule.forFeature([{name:User.name,schema:UserSchema}])  
    ],
    providers:[
      UsersService  
    ],
    exports:[UsersService]
})

export class UserModule{}