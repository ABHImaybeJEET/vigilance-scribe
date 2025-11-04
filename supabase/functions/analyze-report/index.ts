import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const categoryPrompts: Record<string, string> = {
  phishing: `You are a cybersecurity expert. Provide concise, actionable guidance (max 150 words) on:
1. Verify if this is phishing
2. Immediate protection steps
3. How to report
4. Prevention tips
Be direct and professional.`,

  ransomware: `You are a cybersecurity expert. Provide concise, actionable guidance (max 150 words) on:
1. Immediate containment steps
2. Do NOT pay ransom
3. Recovery options
4. Reporting procedures
Be direct and professional.`,

  identity_theft: `You are a cybersecurity expert. Provide concise, actionable guidance (max 150 words) on:
1. Secure accounts immediately
2. Which authorities to contact
3. Monitor for unauthorized activity
4. Protection strategies
Be direct and professional.`,

  data_breach: `You are a cybersecurity expert. Provide concise, actionable guidance (max 150 words) on:
1. Contain the breach
2. Assess compromised data
3. Legal reporting requirements
4. Remediation steps
Be direct and professional.`,

  malware: `You are a cybersecurity expert. Provide concise, actionable guidance (max 150 words) on:
1. Isolate infected systems
2. Safe removal procedures
3. System recovery
4. Prevention measures
Be direct and professional.`,

  social_engineering: `You are a cybersecurity expert. Provide concise, actionable guidance (max 150 words) on:
1. Recognize manipulation tactics
2. Mitigate damage
3. Report the incident
4. Prevention training
Be direct and professional.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, details, email } = await req.json();
    
    // Comprehensive input validation
    if (!category || !details) {
      console.error('Validation error: Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: category and details' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate category
    const validCategories = ['phishing', 'ransomware', 'identity_theft', 'data_breach', 'malware', 'social_engineering'];
    if (!validCategories.includes(category)) {
      console.error('Validation error: Invalid category', category);
      return new Response(
        JSON.stringify({ error: 'Invalid incident category' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate details length
    const sanitizedDetails = details.trim();
    if (sanitizedDetails.length < 20 || sanitizedDetails.length > 5000) {
      console.error('Validation error: Invalid details length', sanitizedDetails.length);
      return new Response(
        JSON.stringify({ error: 'Incident details must be between 20 and 5000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate email if provided
    if (email && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 255) {
        console.error('Validation error: Invalid email format');
        return new Response(
          JSON.stringify({ error: 'Invalid email address' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.log('Processing report for category:', category, '| Details length:', sanitizedDetails.length);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('AI service configuration error');
    }

    const systemPrompt = categoryPrompts[category] || categoryPrompts.phishing;
    const userMessage = `Incident details: ${details}${email ? `\nContact email: ${email}` : ''}`;

    console.log('Calling AI gateway with model: google/gemini-2.5-flash');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
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
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

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
      
      if (response.status === 503) {
        return new Response(
          JSON.stringify({ error: 'AI service temporarily unavailable. Please try again.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Invalid AI response structure:', data);
      throw new Error('Invalid response from AI service');
    }
    
    const aiResponse = data.choices[0].message.content;
    console.log('AI response generated successfully, length:', aiResponse.length);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-report function:', error);
    
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ error: 'Request timeout. Please try again.' }),
        { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new Response(
        JSON.stringify({ error: 'Network error. Please check your connection.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
