
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
};

export function ObjectiveForm({ onSubmit, objective, submitButtonText = "Create Objective" }: ObjectiveFormProps) {
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
        <DialogFooter>
          <Button type="submit">{submitButtonText}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
