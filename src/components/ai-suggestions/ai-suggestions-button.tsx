
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AISuggestionsDialog } from "./ai-suggestions-dialog";
import { Objective, AISuggestion } from "@/lib/types";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";

interface AISuggestionsButtonProps {
  objective: Objective;
  onAddKeyResults: (keyResults: any[]) => void;
  onAddInitiatives: (initiatives: any[]) => void;
}

export function AISuggestionsButton({ 
  objective, 
  onAddKeyResults, 
  onAddInitiatives 
}: AISuggestionsButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleApplySuggestions = (suggestions: AISuggestion[]) => {
    const keyResults = suggestions
      .filter(s => s.type === 'key-result')
      .map(suggestion => ({
        id: uuidv4(),
        name: suggestion.name,
        description: suggestion.description,
        objectiveId: objective.id,
        startDate: objective.startDate,
        endDate: objective.endDate,
        startingValue: 0,
        goalValue: 100,
        deleted: false
      }));

    const initiatives = suggestions
      .filter(s => s.type === 'initiative')
      .map(suggestion => ({
        id: uuidv4(),
        name: suggestion.name,
        description: suggestion.description,
        objectiveId: objective.id,
        startDate: objective.startDate,
        endDate: objective.endDate,
        deleted: false,
        completed: false
      }));

    if (keyResults.length > 0) {
      onAddKeyResults(keyResults);
    }

    if (initiatives.length > 0) {
      onAddInitiatives(initiatives);
    }

    toast({
      title: "AI suggestions applied",
      description: `Added ${keyResults.length} key results and ${initiatives.length} initiatives`,
    });
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-1"
        onClick={() => setIsDialogOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
        AI Suggestions
      </Button>
      
      <AISuggestionsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        objective={objective}
        onApplySuggestions={handleApplySuggestions}
      />
    </>
  );
}
