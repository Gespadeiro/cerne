
import React from "react";
import { Objective } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { AISuggestionsButton } from "./ai-suggestions/ai-suggestions-button";

interface ObjectiveCardProps {
  objective: Objective;
  onAddKeyResult: () => void;
  onAddInitiative: () => void;
  onAddKeyResults: (keyResults: any[]) => void;
  onAddInitiatives: (initiatives: any[]) => void;
}

export function ObjectiveCard({ 
  objective, 
  onAddKeyResult, 
  onAddInitiative,
  onAddKeyResults,
  onAddInitiatives
}: ObjectiveCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{objective.name}</CardTitle>
            <CardDescription className="mt-2">
              {objective.description || "No description provided"}
            </CardDescription>
          </div>
          <AISuggestionsButton 
            objective={objective} 
            onAddKeyResults={onAddKeyResults}
            onAddInitiatives={onAddInitiatives}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Start Date:</span>
            <span>{format(new Date(objective.startDate), "PPP")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">End Date:</span>
            <span>{format(new Date(objective.endDate), "PPP")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Check-in Frequency:</span>
            <span>{objective.checkInFrequency} {objective.checkInFrequency === 1 ? 'day' : 'days'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={onAddKeyResult}>
          <Plus className="h-4 w-4" />
          Add Key Result
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={onAddInitiative}>
          <Plus className="h-4 w-4" />
          Add Initiative
        </Button>
      </CardFooter>
    </Card>
  );
}
