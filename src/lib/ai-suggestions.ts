
import { supabase } from "@/integrations/supabase/client";
import { AISuggestion } from "./types";

export async function generateSuggestions(
  objectiveName: string,
  objectiveDescription: string | undefined,
  type: 'key-result' | 'initiative'
): Promise<AISuggestion[]> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-suggestions', {
      body: {
        objectiveName,
        objectiveDescription,
        type
      }
    });

    if (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    }

    return data.suggestions;
  } catch (error) {
    console.error('Error calling generate-suggestions function:', error);
    throw error;
  }
}
