import { Injectable, Logger } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
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
        unit_amount: item.unit_amount * 100,
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

    return session;
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
        //TODO: llamar al microservicio
        break;
      // case 'payment_method.attached':
      //   const paymentMethod = event.data.object;
      // console.log('PaymentMethod was attached to a Customer!');
      // break;
      // ... handle other event types
      default:
      // console.log(`Unhandled event type ${event.type}`);
    }
    return res.status(200).json({ sig });
  }
}
