import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
 ping(){
    return {
      ok:true,
      service:'media',
      new:new Date().toLocaleDateString()
    }
  }
}
