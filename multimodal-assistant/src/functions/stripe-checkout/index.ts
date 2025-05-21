// File: functions/stripe-checkout/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=denonext';

Deno.serve(async (req) => {
  try {
    const { priceId } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    // Authenticate the user from the Supabase JWT in the Authorization header
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthenticated' }), { status: 401 });
    }
    // Ensure Stripe customer exists
    let { data: profile } = await supabase
      .from('profiles').select('stripe_customer_id').eq('id', user.id).single();
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      // Create a new Stripe customer and save the ID
      const customer = await Stripe(Deno.env.get('STRIPE_API_KEY')!).customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      await supabase.from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }
    // Create Checkout Session for subscription
    const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY')!, { apiVersion: '2024-11-20' });
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId,
      success_url: `${Deno.env.get('FRONTEND_URL')}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('FRONTEND_URL')}/?canceled=true`
    });
    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (err: any) {
    console.error('stripe-checkout error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
