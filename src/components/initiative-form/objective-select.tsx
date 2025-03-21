
import React from "react";
import { Objective } from "@/lib/types";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { InitiativeFormValues } from "@/lib/schemas/initiative-schema";

interface ObjectiveSelectProps {
  form: UseFormReturn<InitiativeFormValues>;
  objectives: Objective[];
}

export function ObjectiveSelect({ form, objectives }: ObjectiveSelectProps) {
  // Filter non-deleted objectives
  const activeObjectives = objectives.filter(obj => !obj.deleted);
  
  return (
    <FormField
      control={form.control}
      name="objectiveId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Objective</FormLabel>
          <FormControl>
            <Select 
              value={field.value || ""} 
              onValueChange={(value) => {
                // Set objective ID
                field.onChange(value);
                // Reset keyResultId when objective changes
                form.setValue("keyResultId", "");
              }}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select an objective" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {activeObjectives.map((obj) => (
                  <SelectItem key={obj.id} value={obj.id}>
                    {obj.name}
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
