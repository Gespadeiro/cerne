
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Objective, Initiative } from "@/lib/types";
import { format } from "date-fns";
import { createInitiativeSchema, InitiativeFormValues } from "@/lib/schemas/initiative-schema";
import { BasicFields } from "@/components/initiative-form/basic-fields";
import { ObjectiveSelect } from "@/components/initiative-form/objective-select";
import { KeyResultSelect } from "@/components/initiative-form/key-result-select";
import { DateFields } from "@/components/initiative-form/date-fields";

type InitiativeFormProps = {
  objectives: Objective[];
  onSubmit: (data: InitiativeFormValues) => void;
  initiative?: Initiative;
  submitButtonText?: string;
};

export function InitiativeForm({ 
  objectives, 
  onSubmit, 
  initiative, 
  submitButtonText = "Create Initiative" 
}: InitiativeFormProps) {
  const initiativeSchema = createInitiativeSchema(objectives);
  
  const formatDateForInput = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };
  
  const form = useForm<InitiativeFormValues>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: initiative ? {
      name: initiative.name,
      description: initiative.description || "",
      objectiveId: initiative.objectiveId,
      keyResultId: initiative.keyResultId || "",
      startDate: formatDateForInput(initiative.startDate),
      endDate: formatDateForInput(initiative.endDate),
    } : {
      name: "",
      description: "",
      objectiveId: "",
      keyResultId: "",
      startDate: "",
      endDate: "",
    },
  });

  // Get the selected objective to display its key results
  const selectedObjectiveId = form.watch("objectiveId");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <BasicFields form={form} />
        <ObjectiveSelect form={form} objectives={objectives} />
        
        {selectedObjectiveId && (
          <KeyResultSelect 
            form={form} 
            selectedObjectiveId={selectedObjectiveId} 
            objectives={objectives} 
          />
        )}
        
        <DateFields form={form} />
        
        <DialogFooter>
          <Button type="submit">{submitButtonText}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
