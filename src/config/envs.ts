import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PAYMENT_MS_PORT: number;
  NATS_SERVERS: string[];
  STRIPE_SECRET_KEY: string;
  STRIPE_ENDPOINT_SECRET: string;
  STRIPE_SUCCESS_URL: string;
  STRIPE_CANCEL_URL: string;
}

const envVarsSchema = joi
  .object({
    PAYMENT_MS_PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    STRIPE_SECRET_KEY: joi.string().required(),
    STRIPE_ENDPOINT_SECRET: joi.string().required(),
    STRIPE_SUCCESS_URL: joi.string().required(),
    STRIPE_CANCEL_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envVarsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  paymentsPort: envVars.PAYMENT_MS_PORT,
  stripeSecretKey: envVars.STRIPE_SECRET_KEY,
  natsServers: envVars.NATS_SERVERS,
  stripeEndpointSecret: envVars.STRIPE_ENDPOINT_SECRET,
  stripeSuccessUrl: envVars.STRIPE_SUCCESS_URL,
  stripeCancelUrl: envVars.STRIPE_CANCEL_URL,
};
