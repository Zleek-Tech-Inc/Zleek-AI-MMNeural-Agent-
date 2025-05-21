// File: functions/ai-chat/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=denonext'; // not needed here, but use Supabase auth
import OpenAI from 'npm:openai'; // Use OpenAI Node SDK (or fetch)
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from 'npm:@google/genai';

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
  // Determine user's plan from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();
  const plan = profile?.plan || 'free';
  
  const responses: string[] = [];

  // 1. OpenAI Chat (GPT)
  if (plan === 'free' || plan === 'pro' || plan === 'enterprise') {
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });
    const openaiRes = await openai.chat.completions.create({
      model: 'gpt-4', 
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    });
    responses.push(openaiRes.choices[0].message?.content || '');
  }

  // 2. Anthropic (Claude)
  if (plan === 'pro' || plan === 'enterprise') {
    const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
    const claudeRes = await client.messages.create({
      model: 'claude-3-5-100k', 
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    });
    responses.push(claudeRes.content);
  }

  // 3. Google Gemini via GenAI SDK
  if (plan === 'enterprise') {
    const ai = new GoogleGenAI({ apiKey: Deno.env.get('GEMINI_API_KEY')! });
    const geminiRes = await ai.models.generateContent({
      model: 'gemini-1.0-pro',
      contents: prompt
    });
    responses.push(geminiRes.text);
  }

  // Combine responses (simple concatenation)
  const combined = responses.join('\n\n');
  // Log conversation and usage (optional)
  await supabase.from('conversations').insert([{ user_id: user.id, prompt: prompt }]);
  await supabase.from('messages').insert([
    { user_id: user.id, content: prompt, role: 'user' },
    { user_id: user.id, content: combined, role: 'assistant' }
  ]);
  await supabase.from('usage_logs').insert({
    user_id: user.id,
    type: 'chat',
    prompt_length: prompt.length,
    tokens_used: combined.split(' ').length
  });

  return new Response(JSON.stringify({ result: combined }), { status: 200 });
});
