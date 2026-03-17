import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
 ping(){
    return {
      ok:true,
      service:'search',
      new:new Date().toLocaleDateString()
    }
  }
}
