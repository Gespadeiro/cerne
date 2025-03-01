
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
    const { objectiveName, objectiveDescription, type } = await req.json();

    if (!objectiveName) {
      throw new Error('Objective name is required');
    }

    let promptText = '';
    if (type === 'key-result') {
      promptText = `Generate 5 SMART Key Results for the following objective: "${objectiveName}". ${objectiveDescription ? `Objective description: "${objectiveDescription}"` : ''}

Key Results should be specific, measurable, achievable, relevant, and time-bound. Format your response as a JSON array of objects with the following structure:
[
  {
    "name": "Key Result name",
    "description": "Detailed description explaining the key result"
  }
]
Focus on measurable outcomes with clear numerical targets when possible.`;
    } else if (type === 'initiative') {
      promptText = `Generate 5 actionable Initiatives for the following objective: "${objectiveName}". ${objectiveDescription ? `Objective description: "${objectiveDescription}"` : ''}

Initiatives should be specific, actionable projects or tasks that will help achieve the objective. Format your response as a JSON array of objects with the following structure:
[
  {
    "name": "Initiative name",
    "description": "Detailed description explaining what the initiative involves and how it contributes to the objective"
  }
]
Focus on concrete actions that can be implemented and tracked.`;
    } else {
      throw new Error('Invalid suggestion type');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a strategic planning assistant that helps create OKRs (Objectives and Key Results) and initiatives.' },
          { role: 'user', content: promptText }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const content = data.choices[0].message.content;
    let suggestions = [];
    
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from response');
      }
    } catch (error) {
      console.error('Error parsing suggestions:', error);
      throw new Error('Failed to parse suggestions from AI response');
    }

    // Add IDs and selected property to each suggestion
    const processedSuggestions = suggestions.map((suggestion: any, index: number) => ({
      id: crypto.randomUUID(),
      type: type,
      name: suggestion.name,
      description: suggestion.description,
      selected: false
    }));

    return new Response(JSON.stringify({ suggestions: processedSuggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
