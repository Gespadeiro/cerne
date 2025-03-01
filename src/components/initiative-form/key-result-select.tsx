
import React from "react";
import { Objective } from "@/lib/types";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { InitiativeFormValues } from "@/lib/schemas/initiative-schema";

interface KeyResultSelectProps {
  form: UseFormReturn<InitiativeFormValues>;
  selectedObjectiveId: string;
  objectives: Objective[];
}

export function KeyResultSelect({ form, selectedObjectiveId, objectives }: KeyResultSelectProps) {
  // Find the selected objective safely
  const selectedObjective = objectives.find(obj => obj.id === selectedObjectiveId);
  
  // Get key results only if the objective exists
  const keyResults = selectedObjective?.keyResults?.filter(kr => !kr.deleted) || [];
  
  if (!selectedObjectiveId) {
    return null;
  }
  
  return (
    <FormField
      control={form.control}
      name="keyResultId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Key Result (optional)</FormLabel>
          <FormControl>
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a key result" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="">None</SelectItem>
                {keyResults.map((kr) => (
                  <SelectItem key={kr.id} value={kr.id}>
                    {kr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
