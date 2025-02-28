
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { Objective } from "@/lib/types";
import { SuggestionsDialog } from "./suggestions-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddSuggestionsButtonProps {
  objective: Objective;
  type: "keyResults" | "initiatives";
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  onSuggestionsAdded?: () => void;
}

export function AddSuggestionsButton({
  objective,
  type,
  variant = "outline",
  size = "sm",
  onSuggestionsAdded
}: AddSuggestionsButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const handleAddItems = async (items: any[]) => {
    try {
      if (type === "keyResults") {
        const insertPromises = items.map(async (kr) => {
          return supabase
            .from('key_results')
            .insert({
              name: kr.name,
              description: kr.description,
              objective_id: objective.id,
              start_date: new Date().toISOString(),
              end_date: objective.endDate.toISOString(),
              starting_value: kr.startingValue,
              goal_value: kr.goalValue,
            });
        });
        
        await Promise.all(insertPromises);
      } else {
        const insertPromises = items.map(async (initiative) => {
          return supabase
            .from('initiatives')
            .insert({
              name: initiative.name,
              description: initiative.description,
              objective_id: objective.id,
              start_date: new Date().toISOString(),
              end_date: objective.endDate.toISOString(),
            });
        });
        
        await Promise.all(insertPromises);
      }
      
      toast({
        title: `${type === "keyResults" ? "Key Results" : "Initiatives"} added`,
        description: `${items.length} ${type === "keyResults" ? "key results" : "initiatives"} have been added to your objective.`,
      });
      
      if (onSuggestionsAdded) {
        onSuggestionsAdded();
      }
    } catch (error: any) {
      toast({
        title: `Error adding ${type === "keyResults" ? "key results" : "initiatives"}`,
        description: error.message || `An error occurred while adding ${type}.`,
        variant: "destructive",
      });
      console.error(`Error adding ${type}:`, error);
    }
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        onClick={() => setShowDialog(true)}
        className="gap-1"
      >
        <Lightbulb className="h-4 w-4" />
        {type === "keyResults" ? "Generate Key Results" : "Generate Initiatives"}
      </Button>
      
      <SuggestionsDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        objective={objective}
        type={type}
        onAddItems={handleAddItems}
      />
    </>
  );
}
