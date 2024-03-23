import { Inject, Injectable, Logger } from '@nestjs/common';
import { NATS_SERVICES, envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  constructor(@Inject(NATS_SERVICES) private readonly client: ClientProxy) {}

  private readonly stripe = new Stripe(envs.stripeSecretKey);
  private logger = new Logger('Payments.service.ts');

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { orderId, currency, items } = paymentSessionDto;
    const lineItems = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
          // description: 'add new channel',
        },
        unit_amount: item.price * 100,
      },
      quantity: 2,
    }));
    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId: orderId,
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });

    return {
      cancelUrl: session.cancel_url,
      succesUrl: session.success_url,
      url: session.url,
    };
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    // const endpointSecret: string =
    //   'whsec_06fe71182bfa0a9ce8809563207dab8962b6e2cb6619225599c299d77abc9ed1';
    const endpointSecret: string = envs.stripeEndpointSecret;
    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case 'charge.succeeded':
        const objectWebhook = event.data.object;
        this.logger.warn(
          `Pago realizado correctamente, orderId: ${objectWebhook.metadata.orderId}`,
        );
        // const status = {
        //   status: 'CONFIRMED',
        //   id: objectWebhook.metadata.orderId,
        // };

        const payload = {
          stripePaymentId: objectWebhook.id,
          orderId: objectWebhook.metadata.orderId,
          receiptUrl: objectWebhook.receipt_url,
        };
        console.log(payload);
        this.client.emit('order.payment.succed', payload);

        break;
      default:
    }
    return res.status(200).json({ sig });
  }
}
