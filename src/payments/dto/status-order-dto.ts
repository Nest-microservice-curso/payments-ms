import { IsEnum } from 'class-validator';
import { OrderStatus, OrderStatusList } from './enum/ordes.enum';

export class StatusOrderDto {
  @IsEnum(OrderStatusList, {
    message: `status must be a valid enum value: ${OrderStatusList}`,
  })
  status: OrderStatus;
}
