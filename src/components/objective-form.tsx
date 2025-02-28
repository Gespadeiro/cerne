
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Objective } from "@/lib/types";
import { format } from "date-fns";
import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { SuggestionsDialog } from "@/components/ai-suggestions/suggestions-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const objectiveSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  checkInFrequency: z.number().min(1, "Frequency must be at least 1").max(365, "Frequency cannot exceed 365"),
});

type ObjectiveFormProps = {
  onSubmit: (data: z.infer<typeof objectiveSchema>) => void;
  objective?: Objective;
  submitButtonText?: string;
  onSuggestionsCreated?: (type: string, items: any[]) => void;
};

export function ObjectiveForm({ 
  onSubmit, 
  objective, 
  submitButtonText = "Create Objective",
  onSuggestionsCreated
}: ObjectiveFormProps) {
  const [showKRSuggestions, setShowKRSuggestions] = useState(false);
  const [showInitiativeSuggestions, setShowInitiativeSuggestions] = useState(false);
  const [tempObjective, setTempObjective] = useState<Objective | null>(null);
  const { toast } = useToast();

  const formatDateForInput = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  const form = useForm({
    resolver: zodResolver(objectiveSchema),
    defaultValues: objective ? {
      name: objective.name,
      description: objective.description || "",
      startDate: formatDateForInput(objective.startDate),
      endDate: formatDateForInput(objective.endDate),
      checkInFrequency: objective.checkInFrequency,
    } : {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      checkInFrequency: 7,
    },
  });

  const prepareTempObjective = () => {
    const formValues = form.getValues();
    if (!formValues.name) {
      toast({
        title: "Missing information",
        description: "Please provide at least a name for your objective to generate suggestions",
        variant: "destructive",
      });
      return null;
    }

    return {
      id: objective?.id || "temp-id",
      name: formValues.name,
      description: formValues.description,
      startDate: formValues.startDate ? new Date(formValues.startDate) : new Date(),
      endDate: formValues.endDate ? new Date(formValues.endDate) : new Date(),
      checkInFrequency: formValues.checkInFrequency,
      deleted: false,
      initiatives: [],
      keyResults: [],
    };
  };

  const handleShowKRSuggestions = () => {
    const temp = prepareTempObjective();
    if (temp) {
      setTempObjective(temp);
      setShowKRSuggestions(true);
    }
  };

  const handleShowInitiativeSuggestions = () => {
    const temp = prepareTempObjective();
    if (temp) {
      setTempObjective(temp);
      setShowInitiativeSuggestions(true);
    }
  };

  const handleAddKeyResults = async (items: any[]) => {
    if (onSuggestionsCreated) {
      onSuggestionsCreated("keyResults", items);
    } else {
      toast({
        title: "Suggestions saved",
        description: `${items.length} key result suggestions saved. You can use them after creating the objective.`,
      });
    }
  };

  const handleAddInitiatives = async (items: any[]) => {
    if (onSuggestionsCreated) {
      onSuggestionsCreated("initiatives", items);
    } else {
      toast({
        title: "Suggestions saved",
        description: `${items.length} initiative suggestions saved. You can use them after creating the objective.`,
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} className="h-20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="checkInFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-in Frequency (days)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(Number(e.target.value))}
                    min={1}
                    max={365}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {!objective && (
            <div className="flex flex-col gap-2 my-4">
              <p className="text-sm text-muted-foreground mb-1">AI Suggestions:</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={handleShowKRSuggestions}
                >
                  <Lightbulb className="h-4 w-4" />
                  Generate Key Results
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={handleShowInitiativeSuggestions}
                >
                  <Lightbulb className="h-4 w-4" />
                  Generate Initiatives
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="submit">{submitButtonText}</Button>
          </DialogFooter>
        </form>
      </Form>

      {tempObjective && (
        <>
          <SuggestionsDialog
            open={showKRSuggestions}
            onOpenChange={setShowKRSuggestions}
            objective={tempObjective}
            type="keyResults"
            onAddItems={handleAddKeyResults}
          />
          
          <SuggestionsDialog
            open={showInitiativeSuggestions}
            onOpenChange={setShowInitiativeSuggestions}
            objective={tempObjective}
            type="initiatives"
            onAddItems={handleAddInitiatives}
          />
        </>
      )}
    </>
  );
}
