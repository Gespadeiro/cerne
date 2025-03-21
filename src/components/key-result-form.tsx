
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
import { Objective, KeyResult } from "@/lib/types";
import { format } from "date-fns";

// Create a type-safe schema with context
const createKeyResultSchema = (objectives: Objective[]) => z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  objectiveId: z.string().min(1, "Objective is required"),
  startDate: z.string(),
  endDate: z.string(),
  startingValue: z.number(),
  goalValue: z.number(),
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

type KeyResultFormProps = {
  objectives: Objective[];
  onSubmit: (data: z.infer<ReturnType<typeof createKeyResultSchema>>) => void;
  keyResult?: KeyResult;
  submitButtonText?: string;
};

export function KeyResultForm({ objectives, onSubmit, keyResult, submitButtonText = "Create Key Result" }: KeyResultFormProps) {
  const keyResultSchema = createKeyResultSchema(objectives);
  
  // Format dates for the form
  const formatDateForInput = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };
  
  const form = useForm({
    resolver: zodResolver(keyResultSchema),
    defaultValues: keyResult ? {
      name: keyResult.name,
      description: keyResult.description,
      objectiveId: keyResult.objectiveId,
      startDate: formatDateForInput(keyResult.startDate),
      endDate: formatDateForInput(keyResult.endDate),
      startingValue: keyResult.startingValue,
      goalValue: keyResult.goalValue,
    } : {
      name: "",
      description: "",
      objectiveId: "",
      startDate: "",
      endDate: "",
      startingValue: 0,
      goalValue: 0,
    },
  });

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
                <select
                  className="w-full border rounded-md p-2 bg-background text-foreground hover:bg-muted/50"
                  {...field}
                >
                  <option value="" className="bg-background text-foreground">Select an objective</option>
                  {objectives
                    .filter((obj) => !obj.deleted)
                    .map((obj) => (
                      <option key={obj.id} value={obj.id} className="bg-background text-foreground">
                        {obj.name}
                      </option>
                    ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Date fields side by side */}
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
        {/* Value fields side by side */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startingValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Starting Value</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="goalValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Value</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
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
