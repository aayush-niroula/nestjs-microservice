import { createClerkClient, verifyToken } from "@clerk/backend";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserContext } from "./auth.types";

@Injectable()
export class AuthService{

    private readonly clerk=createClerkClient({
        secretKey:process.env.CLERK_SECRET_KEY,
        publishableKey:process.env.CLERK_PUBLISHABLE_KEY
    })

    private jwtVerfiyOptions():Record<string,any>{
        return{
          secretKey:process.env.CLERK_SECRET_KEY
        }
    }

    async verifyAndBuildContext(token:string):Promise<UserContext>{
     try {
      
        const verified:any = await verifyToken(token,this.jwtVerfiyOptions())
        

        const payload = verified?.payload ?? verified?.payload ?? verified;

        //clerk userid ==> paylod.sub

        const clerkUserId= payload?.sub ?? payload?.userId

        if(!clerkUserId){
            throw new UnauthorizedException('Token is missing user id')
        }

        const role :"user" |"admin" = "user";

        const emailFromToken = payload?.email ?? payload?.email_address ?? payload?.primaryEmailAddress ?? "" ;

        const nameFromToken = payload?.name ?? payload?.fullName ?? payload?.username ?? "";

        if(emailFromToken && nameFromToken){
            return{
                clerkUserId,
                email:emailFromToken,
                name:nameFromToken,
                role
            }
        }


    const user =await this.clerk.users.getUser(clerkUserId)

    const primaryEmail=user.emailAddresses.find((e)=>e.id === user.primaryEmailAddressId)?.emailAddress ?? user.emailAddresses[0]?.emailAddress

   const fullName = [user.firstName,user.lastName].filter(Boolean).join(' ') || user.username
|| primaryEmail || clerkUserId

return{
    clerkUserId,
    email:primaryEmail || emailFromToken,
    name:nameFromToken || fullName,
    role
}



     } catch (error) {
        console.log(error);
        throw new UnauthorizedException("Invalid or expired token")
        
     }
    }
}