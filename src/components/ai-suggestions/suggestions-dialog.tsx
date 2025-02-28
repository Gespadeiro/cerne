
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Objective, KeyResult, Initiative } from "@/lib/types";
import { Loader2, Check, X, Lightbulb } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type SuggestionType = "keyResults" | "initiatives";

interface KeyResultSuggestion {
  name: string;
  description: string;
  startingValue: number;
  goalValue: number;
}

interface InitiativeSuggestion {
  name: string;
  description: string;
}

interface SuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objective: Objective;
  type: SuggestionType;
  onAddItems: (items: any[]) => void;
}

export function SuggestionsDialog({
  open,
  onOpenChange,
  objective,
  type,
  onAddItems,
}: SuggestionsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<(KeyResultSuggestion | InitiativeSuggestion)[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const objectiveData = {
        name: objective.name,
        description: objective.description,
        startDate: format(objective.startDate, 'yyyy-MM-dd'),
        endDate: format(objective.endDate, 'yyyy-MM-dd'),
      };

      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: { type, objective: objectiveData },
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuggestions(data.suggestions);
    } catch (err: any) {
      console.error('Error fetching suggestions:', err);
      setError(err.message || 'Failed to fetch suggestions');
      toast({
        title: "Error",
        description: err.message || 'Failed to fetch suggestions',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleAddSelected = () => {
    const selectedItems = Array.from(selectedSuggestions).map(index => suggestions[index]);
    onAddItems(selectedItems);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            AI Suggestions for {type === "keyResults" ? "Key Results" : "Initiatives"}
          </DialogTitle>
          <DialogDescription>
            Get AI-generated suggestions for your objective: <span className="font-semibold">{objective.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Generating suggestions...</span>
            </div>
          ) : error ? (
            <div className="flex-grow flex flex-col items-center justify-center py-10 text-destructive">
              <p className="text-center mb-4">{error}</p>
              <Button onClick={fetchSuggestions}>Try Again</Button>
            </div>
          ) : suggestions.length > 0 ? (
            <ScrollArea className="flex-grow pr-4">
              <div className="space-y-3 my-4">
                {suggestions.map((suggestion, index) => (
                  <Card 
                    key={index} 
                    className={`transition-colors cursor-pointer ${
                      selectedSuggestions.has(index) ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => toggleSuggestion(index)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{suggestion.name}</CardTitle>
                        {selectedSuggestions.has(index) ? (
                          <Check className="h-5 w-5 text-primary" />
                        ) : (
                          <div className="w-5 h-5" /> // Empty space for alignment
                        )}
                      </div>
                      <CardDescription>{suggestion.description}</CardDescription>
                    </CardHeader>
                    {type === "keyResults" && (
                      <CardContent className="pb-4 pt-0">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Starting Value:</span>{" "}
                            {(suggestion as KeyResultSuggestion).startingValue}
                          </div>
                          <div>
                            <span className="font-medium">Goal Value:</span>{" "}
                            {(suggestion as KeyResultSuggestion).goalValue}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center py-10">
              <p className="text-center mb-4">
                Get AI-powered suggestions for {type === "keyResults" ? "key results" : "initiatives"} 
                based on your objective.
              </p>
              <Button onClick={fetchSuggestions}>Generate Suggestions</Button>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 flex items-center justify-between flex-row">
          <div>
            {suggestions.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedSuggestions.size} of {suggestions.length} selected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSelected} 
              disabled={selectedSuggestions.size === 0}
            >
              Add Selected
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
