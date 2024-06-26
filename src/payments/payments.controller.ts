import { Controller, Get, Logger, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  private logger = new Logger('payment.controller.ts');
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern('create.payment.session')
  createPaymentSession(@Payload() paymentSessionDto: PaymentSessionDto) {
    console.log(paymentSessionDto);
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('stripe-success')
  success() {
    return {
      ok: true,
      message: 'Payment Success',
    };
  }

  @Get('stripe-cancel')
  cancel() {
    return {
      ok: false,
      message: 'Payment Cancel from MS',
    };
  }

  @Post('stripe-webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebhook(req, res);
  }
}
