// File: functions/ai-image/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const { prompt } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!, 
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  // Authenticate user
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.split(' ')[1] || '';
  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  // Call OpenAI DALL·E API
  const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024'
    })
  });
  const data = await openaiRes.json();
  const imageUrl = data.data[0].url;
  // Log the generated image
  await supabase.from('images').insert({
    user_id: user.id,
    prompt: prompt,
    image_url: imageUrl
  });
  await supabase.from('usage_logs').insert({
    user_id: user.id,
    type: 'image',
    prompt_length: prompt.length
  });
  return new Response(JSON.stringify({ url: imageUrl }), { status: 200 });
});
