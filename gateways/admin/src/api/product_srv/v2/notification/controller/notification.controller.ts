import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  @EventPattern('product.updated')
  async handleProductCreated(@Payload() data: any) {
    console.log('Product created', data);
    return data;
  }
}
