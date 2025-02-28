
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import OpenAI from "https://esm.sh/openai@4.10.0";

interface OkrRequestBody {
  type: string;
  objective?: {
    name: string;
    description: string;
  };
  message?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });

    // Get request data
    const requestData: OkrRequestBody = await req.json();

    if (requestData.type === 'checkApiKey') {
      // Just check if the API key exists and return success
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (requestData.type === 'chat') {
      // Handle generic chat request
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an OKR assistant that helps users draft objectives, key results, and initiatives. Keep your responses concise and focused on OKR best practices. If you're unsure about something, be honest about your limitations."
          },
          {
            role: "user",
            content: requestData.message || "Hello"
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const suggestions = chatCompletion.choices[0].message.content || "Sorry, I couldn't generate a response.";

      return new Response(
        JSON.stringify({ suggestions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!requestData.objective && (requestData.type === 'keyResults' || requestData.type === 'initiatives')) {
      return new Response(
        JSON.stringify({ error: "Objective data is required for generating suggestions" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    let prompt;
    if (requestData.type === 'keyResults') {
      prompt = `Generate 3-5 meaningful key results for the following objective:
      
Objective: ${requestData.objective?.name}
Description: ${requestData.objective?.description}

For each key result, include:
1. A name (concise, specific, and measurable)
2. A brief description
3. Starting value (a number, typically 0)
4. Goal value (the target number to reach)

Format your response as a valid JSON array with objects having 'name', 'description', 'startingValue', and 'goalValue' fields.`;
    } else if (requestData.type === 'initiatives') {
      prompt = `Generate 3-5 practical initiatives for the following objective:
      
Objective: ${requestData.objective?.name}
Description: ${requestData.objective?.description}

For each initiative, include:
1. A name (action-oriented and specific)
2. A description explaining how it will contribute to the objective

Format your response as a valid JSON array with objects having 'name' and 'description' fields.`;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid suggestion type" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Call OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an OKR assistant that helps draft objectives, key results, and initiatives."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const resultText = chatCompletion.choices[0].message.content || "";
    
    // Extract JSON from the response
    let jsonString = resultText;
    // If response contains markdown code blocks, extract just the JSON
    const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }
    
    let suggestions;
    try {
      suggestions = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON from OpenAI response", e);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse suggestions", 
          rawResponse: resultText 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
