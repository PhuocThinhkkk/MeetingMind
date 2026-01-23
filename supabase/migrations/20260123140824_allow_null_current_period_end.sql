-- Allow Stripe checkout-created subscriptions to exist
-- before billing period is finalized

alter table public.subscriptions
alter column current_period_end drop not null;
