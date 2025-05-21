// File: functions/stripe-webhooks/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=denonext';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY')!, { apiVersion: '2024-11-20' });
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  const sig = req.headers.get('Stripe-Signature')!;
  const bodyText = await req.text();
  let event: Stripe.Event;
  try {
    // Verify the webhook signature (requires raw body, see Stripe docs)
    event = await stripe.webhooks.constructEventAsync(
      bodyText, sig, Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!, undefined, cryptoProvider
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(err.message, { status: 400 });
  }
  console.log(`Received Stripe event: ${event.type}`);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!, 
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Handle subscription events
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    const planId = subscription.items.data[0].price.id;
    // Find user by stripe_customer_id
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();
    if (userProfile) {
      // Update the user's plan info in the database
      await supabase.from('profiles')
        .update({
          stripe_subscription_id: subscription.id,
          plan: planId,
          subscription_status: subscription.status
        })
        .eq('id', userProfile.id);
    }
  }
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();
    if (userProfile) {
      // Clear the subscription info
      await supabase.from('profiles')
        .update({ plan: null, subscription_status: 'canceled' })
        .eq('id', userProfile.id);
    }
  }
  // (Handle other event types as needed)
  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
