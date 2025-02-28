
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const body = await req.json();
    const { type } = body;

    if (type === 'checkApiKey') {
      if (!openAIApiKey) {
        throw new Error('OpenAI API key not found');
      }
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Handle different request types
    if (type === 'keyResults') {
      return await generateKeyResultSuggestions(body, corsHeaders);
    } else if (type === 'initiatives') {
      return await generateInitiativeSuggestions(body, corsHeaders);
    } else if (type === 'chat') {
      return await handleChatRequest(body, corsHeaders);
    } else {
      throw new Error('Invalid suggestion type');
    }
  } catch (error) {
    console.error('Error in generate-suggestions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateKeyResultSuggestions(body: any, corsHeaders: any) {
  const { objective } = body;

  if (!objective) {
    throw new Error('Objective information is required');
  }

  const systemPrompt = 'You are an expert in OKRs (Objectives and Key Results) helping to create measurable key results for objectives.';
  const userPrompt = `Based on the following objective, suggest 3-5 measurable key results that would help achieve this objective. 
    For each key result, provide:
    1. Name (brief, clear title)
    2. Description (1-2 sentences explaining the key result)
    3. Starting value (a numeric value where the metric begins)
    4. Goal value (the target numeric value)
    
    Format your response as a valid JSON array with objects containing these fields: name, description, startingValue, goalValue
    
    Objective name: ${objective.name}
    Objective description: ${objective.description || 'No description provided'}
    Objective timeframe: ${objective.startDate} to ${objective.endDate}`;

  const suggestions = await callOpenAI(systemPrompt, userPrompt);
  return new Response(JSON.stringify({ suggestions }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateInitiativeSuggestions(body: any, corsHeaders: any) {
  const { objective } = body;

  if (!objective) {
    throw new Error('Objective information is required');
  }

  const systemPrompt = 'You are an expert in OKRs (Objectives and Key Results) helping to create actionable initiatives to support objectives.';
  const userPrompt = `Based on the following objective, suggest 3-5 actionable initiatives that would help achieve this objective.
    For each initiative, provide:
    1. Name (brief, clear title)
    2. Description (2-3 sentences explaining what the initiative involves and how it contributes to the objective)
    
    Format your response as a valid JSON array with objects containing these fields: name, description
    
    Objective name: ${objective.name}
    Objective description: ${objective.description || 'No description provided'}
    Objective timeframe: ${objective.startDate} to ${objective.endDate}`;

  const suggestions = await callOpenAI(systemPrompt, userPrompt);
  return new Response(JSON.stringify({ suggestions }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleChatRequest(body: any, corsHeaders: any) {
  const { message } = body;

  if (!message) {
    throw new Error('Message is required');
  }

  const systemPrompt = `You are an OKR (Objectives and Key Results) expert assistant. 
  You provide helpful, accurate, and concise guidance about:
  - Creating effective objectives
  - Designing measurable key results
  - Planning strategic initiatives
  - Implementing OKR best practices
  - Setting up tracking systems
  - Handling OKR challenges
  
  You are encouraging but honest about what makes a good OKR system.`;

  const suggestions = await callOpenAI(systemPrompt, message, false);
  return new Response(JSON.stringify({ suggestions }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function callOpenAI(systemPrompt: string, userPrompt: string, parseJSON = true) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Error calling OpenAI API');
  }

  const generatedContent = data.choices[0].message.content;
  
  // If we don't need to parse JSON, just return the raw content
  if (!parseJSON) {
    return generatedContent;
  }
  
  // Try to parse the response as JSON
  try {
    return JSON.parse(generatedContent);
  } catch (e) {
    console.error("Failed to parse OpenAI response as JSON:", e);
    // Extract JSON from markdown if necessary
    const jsonPattern = /```json\n([\s\S]*?)\n```/;
    const match = generatedContent.match(jsonPattern);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    } else {
      throw new Error('Could not parse AI suggestions into a usable format');
    }
  }
}
