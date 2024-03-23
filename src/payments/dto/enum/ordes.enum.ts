export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED',
}

export const OrderStatusList = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.CANCELLED,
  OrderStatus.DELIVERED,
];
