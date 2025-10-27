import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const categoryPrompts: Record<string, string> = {
  phishing: `You are a cybersecurity expert specializing in phishing attacks. Provide comprehensive guidance on:
1. How to verify if this is indeed a phishing attempt
2. Immediate steps to take to protect themselves
3. How to report the incident to relevant authorities
4. Preventive measures for the future
Be specific, actionable, and empathetic.`,

  ransomware: `You are a cybersecurity expert specializing in ransomware incidents. Provide comprehensive guidance on:
1. Immediate containment steps to prevent further damage
2. Whether to pay the ransom (generally advise against)
3. Data recovery options
4. Steps to report to authorities and cybersecurity organizations
5. Future prevention strategies
Be specific, actionable, and professional.`,

  identity_theft: `You are a cybersecurity expert specializing in identity theft. Provide comprehensive guidance on:
1. Immediate steps to secure accounts and credit
2. Which authorities and organizations to contact
3. How to monitor for further unauthorized activity
4. Documentation steps for legal protection
5. Long-term identity protection strategies
Be specific, actionable, and supportive.`,

  data_breach: `You are a cybersecurity expert specializing in data breaches. Provide comprehensive guidance on:
1. Immediate steps to contain the breach
2. How to assess the scope of compromised data
3. Legal and regulatory reporting requirements
4. Notification procedures for affected parties
5. Remediation and security hardening steps
Be specific, actionable, and professional.`,

  malware: `You are a cybersecurity expert specializing in malware incidents. Provide comprehensive guidance on:
1. Immediate isolation and containment steps
2. Safe malware removal procedures
3. System recovery and data restoration
4. How to identify the infection vector
5. Future prevention and security measures
Be specific, actionable, and clear.`,

  social_engineering: `You are a cybersecurity expert specializing in social engineering attacks. Provide comprehensive guidance on:
1. How to recognize the manipulation tactics used
2. Steps to mitigate any damage already done
3. How to report the incident
4. Training and awareness for future prevention
5. Organizational security improvements
Be specific, actionable, and educational.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, details, email } = await req.json();
    console.log('Processing report for category:', category);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = categoryPrompts[category] || categoryPrompts.phishing;
    const userMessage = `Incident details: ${details}${email ? `\nContact email: ${email}` : ''}`;

    console.log('Calling AI gateway...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-report function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
