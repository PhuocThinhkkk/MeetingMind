# Stripe

## Using stripe webhook ( stripe cli )
1. Run this cmd
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook/subscribe
   ``` 
2. copy the webhook key into STRIPE_WEBHOOK_SECRET in .env
