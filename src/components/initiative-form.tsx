
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
import { Objective, Initiative, KeyResult } from "@/lib/types";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Create a type-safe schema with context
const createInitiativeSchema = (objectives: Objective[]) => z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  objectiveId: z.string(),
  keyResultId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
}).refine((data) => {
  const objective = objectives.find(obj => obj.id === data.objectiveId);
  if (!objective) return true;
  
  const startDate = new Date(data.startDate);
  const objectiveStartDate = new Date(objective.startDate);
  return startDate >= objectiveStartDate;
}, {
  message: "Start date cannot be earlier than the objective's start date",
  path: ["startDate"]
}).refine((data) => {
  const objective = objectives.find(obj => obj.id === data.objectiveId);
  if (!objective) return true;
  
  const endDate = new Date(data.endDate);
  const objectiveEndDate = new Date(objective.endDate);
  return endDate <= objectiveEndDate;
}, {
  message: "End date cannot be later than the objective's end date",
  path: ["endDate"]
});

type InitiativeFormProps = {
  objectives: Objective[];
  onSubmit: (data: z.infer<ReturnType<typeof createInitiativeSchema>>) => void;
  initiative?: Initiative;
  submitButtonText?: string;
};

export function InitiativeForm({ objectives, onSubmit, initiative, submitButtonText = "Create Initiative" }: InitiativeFormProps) {
  const initiativeSchema = createInitiativeSchema(objectives);
  
  const formatDateForInput = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };
  
  const form = useForm({
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
  const selectedObjective = objectives.find(obj => obj.id === selectedObjectiveId);
  const keyResults = selectedObjective ? selectedObjective.keyResults.filter(kr => !kr.deleted) : [];

  return (
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
        <FormField
          control={form.control}
          name="objectiveId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objective</FormLabel>
              <FormControl>
                <Select 
                  value={field.value} 
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset keyResultId when objective changes
                    form.setValue("keyResultId", "");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an objective" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {objectives
                      .filter((obj) => !obj.deleted)
                      .map((obj) => (
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
        
        {/* Key Result selection field */}
        {selectedObjectiveId && (
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
        )}
        
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
        <DialogFooter>
          <Button type="submit">{submitButtonText}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
