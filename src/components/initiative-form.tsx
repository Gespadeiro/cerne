
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

const initiativeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  objectiveId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
}).refine((data) => {
  const objective = window.objectives?.find(obj => obj.id === data.objectiveId);
  if (!objective) return true;
  
  const startDate = new Date(data.startDate);
  const objectiveStartDate = new Date(objective.startDate);
  return startDate >= objectiveStartDate;
}, {
  message: "Start date cannot be earlier than the objective's start date",
  path: ["startDate"]
}).refine((data) => {
  const objective = window.objectives?.find(obj => obj.id === data.objectiveId);
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
  onSubmit: (data: z.infer<typeof initiativeSchema>) => void;
};

export function InitiativeForm({ objectives, onSubmit }: InitiativeFormProps) {
  const form = useForm({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      name: "",
      description: "",
      objectiveId: "",
      startDate: "",
      endDate: "",
    },
    context: { objectives },
  });

  // Make objectives available for validation
  (window as any).objectives = objectives;

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
                <Textarea {...field} />
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
                  className="w-full border rounded-md p-2 bg-primary text-primary-foreground hover:bg-primary/90"
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
        <DialogFooter>
          <Button type="submit">Create Initiative</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
