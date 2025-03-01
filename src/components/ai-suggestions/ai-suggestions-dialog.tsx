
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Objective, AISuggestion } from "@/lib/types";
import { generateSuggestions } from "@/lib/ai-suggestions";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AISuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objective: Objective;
  onApplySuggestions: (suggestions: AISuggestion[]) => void;
}

export function AISuggestionsDialog({
  open,
  onOpenChange,
  objective,
  onApplySuggestions,
}: AISuggestionsDialogProps) {
  const [activeTab, setActiveTab] = useState<'key-result' | 'initiative'>('key-result');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const { toast } = useToast();

  const handleGenerateSuggestions = async () => {
    setIsLoading(true);
    try {
      const newSuggestions = await generateSuggestions(
        objective.name,
        objective.description,
        activeTab
      );
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Failed to generate suggestions",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSuggestionSelection = (id: string) => {
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id 
          ? { ...suggestion, selected: !suggestion.selected } 
          : suggestion
      )
    );
  };

  const handleApplySuggestions = () => {
    const selectedSuggestions = suggestions.filter(s => s.selected);
    onApplySuggestions(selectedSuggestions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Suggestions for "{objective.name}"
          </DialogTitle>
          <DialogDescription>
            Generate AI-powered suggestions for key results or initiatives based on your objective.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="key-result">Key Results</TabsTrigger>
            <TabsTrigger value="initiative">Initiatives</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex justify-center">
            <Button 
              onClick={handleGenerateSuggestions} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate {activeTab === 'key-result' ? 'Key Results' : 'Initiatives'}
                </>
              )}
            </Button>
          </div>

          <TabsContent value="key-result" className="mt-4">
            {!isLoading && suggestions.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                Click the Generate button to get AI suggestions for key results
              </div>
            )}
            {suggestions.filter(s => s.type === 'key-result').map(suggestion => (
              <Card key={suggestion.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id={suggestion.id} 
                      checked={suggestion.selected}
                      onCheckedChange={() => toggleSuggestionSelection(suggestion.id)}
                      className="mt-1"
                    />
                    <div>
                      <CardTitle className="text-base">{suggestion.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="initiative" className="mt-4">
            {!isLoading && suggestions.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                Click the Generate button to get AI suggestions for initiatives
              </div>
            )}
            {suggestions.filter(s => s.type === 'initiative').map(suggestion => (
              <Card key={suggestion.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id={suggestion.id} 
                      checked={suggestion.selected}
                      onCheckedChange={() => toggleSuggestionSelection(suggestion.id)}
                      className="mt-1"
                    />
                    <div>
                      <CardTitle className="text-base">{suggestion.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleApplySuggestions}
            disabled={!suggestions.some(s => s.selected)}
          >
            Apply Selected
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
