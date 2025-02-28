
import { useState, useEffect } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Objective } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objective: Objective;
  type: "keyResults" | "initiatives";
  onAddItems: (items: any[]) => Promise<void>;
}

export function SuggestionsDialog({
  open,
  onOpenChange,
  objective,
  type,
  onAddItems,
}: SuggestionsDialogProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeySet, setApiKeySet] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      checkApiKey();
      setSelectedItems([]);
      setSuggestions([]);
      setError(null);
    }
  }, [open]);

  const checkApiKey = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: { type: 'checkApiKey' },
      });
      
      if (error) {
        console.error("Error checking API key:", error);
        setApiKeySet(false);
      } else {
        setApiKeySet(true);
        // If API key is set, fetch suggestions
        fetchSuggestions();
      }
    } catch (err) {
      console.error("Error checking API key:", err);
      setApiKeySet(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: {
          type,
          objective: {
            name: objective.name,
            description: objective.description
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.suggestions) {
        setSuggestions(data.suggestions);
        // By default, select all suggestions
        setSelectedItems(data.suggestions);
      } else if (data && data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      console.error("Error fetching suggestions:", err);
      setError(err.message || "Failed to fetch suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (item: any) => {
    if (selectedItems.some((i) => i.name === item.name)) {
      setSelectedItems(selectedItems.filter((i) => i.name !== item.name));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleAdd = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to add.",
      });
      return;
    }

    try {
      await onAddItems(selectedItems);
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: `Error adding ${type}`,
        description: err.message || `An error occurred while adding ${type}.`,
        variant: "destructive",
      });
    }
  };

  const refreshSuggestions = () => {
    setSuggestions([]);
    setSelectedItems([]);
    fetchSuggestions();
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {type === "keyResults" ? "AI-Suggested Key Results" : "AI-Suggested Initiatives"}
        </DialogTitle>
        <DialogDescription>
          {type === "keyResults"
            ? "Select the key results you want to add to your objective."
            : "Select the initiatives you want to add to your objective."}
        </DialogDescription>
      </DialogHeader>

      {apiKeySet === false && (
        <Alert variant="destructive">
          <AlertDescription>
            OpenAI API key is not configured. Ask your administrator to set up the OPENAI_API_KEY in Supabase Edge Function secrets.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="my-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Generating suggestions...</span>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  selectedItems.some((i) => i.name === item.name)
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => toggleItem(item)}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.some((i) => i.name === item.name)}
                    onChange={() => toggleItem(item)}
                    className="mt-1"
                  />
                  <div>
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                    {type === "keyResults" && (
                      <div className="mt-2 text-sm">
                        <span className="inline-block bg-muted px-2 py-1 rounded mr-2">
                          Start: {item.startingValue}
                        </span>
                        <span className="inline-block bg-muted px-2 py-1 rounded">
                          Goal: {item.goalValue}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading &&
          !error &&
          apiKeySet && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Click "Generate" to get AI suggestions.</p>
            </div>
          )
        )}
      </div>

      <DialogFooter className="flex gap-2 sm:gap-0">
        <Button
          variant="outline"
          onClick={refreshSuggestions}
          disabled={isLoading || apiKeySet === false}
        >
          {suggestions.length > 0 ? "Regenerate" : "Generate"}
        </Button>
        <Button 
          onClick={handleAdd} 
          disabled={selectedItems.length === 0 || isLoading}
        >
          Add Selected {selectedItems.length > 0 && `(${selectedItems.length})`}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
