import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseRpcExceptionFilter, RpcException } from "@nestjs/microservices";
import { RpcErrorPayload } from "./rpc.types";


@Catch()
export class RpcAllExceptioFilter extends BaseRpcExceptionFilter{

    catch(exception: any, host: ArgumentsHost) {
        
        if(exception instanceof RpcException){
            return super.catch(exception,host)
        }
    
        const status =exception.getStatus();
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if(status ==400){
            const payload:RpcErrorPayload={
                code:'VALIDATION_ERROR',
                message:"Validation failed",
                details:response

            }
            return super.catch(new RpcException(payload),host)
        }

        const payload :RpcErrorPayload={
            code:'INTERNAL',
            message:"Internal error occured",
           
        }
        return super.catch(new RpcException(payload),host)
    }

}