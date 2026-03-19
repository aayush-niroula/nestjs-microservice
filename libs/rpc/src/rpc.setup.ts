import { INestMicroservice, ValidationPipe } from "@nestjs/common";
import { RpcAllExceptioFilter } from "./rpc-exception.filter";

export function applyToMicroServiceLayer(app:INestMicroservice){
app.useGlobalPipes(
    new ValidationPipe({
        whitelist:true,
        forbidNonWhitelisted:true,
        transform:true
    })
)

app.useGlobalFilters(new RpcAllExceptioFilter())
}

