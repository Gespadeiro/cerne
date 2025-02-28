import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Lightbulb } from "lucide-react";
import { Objective } from "@/lib/types";
import { AddSuggestionsButton } from "./ai-suggestions/add-suggestions-button";

const checkInFrequencyOptions = [
  { label: "Weekly", value: "weekly" },
  { label: "Biweekly", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
];

const formSchema = z.object({
  name: z.string().min(1, "Objective name is required"),
  description: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }).refine(date => date > new Date(), {
    message: "End date must be in the future",
  }),
  checkInFrequency: z.string({
    required_error: "Check-in frequency is required",
  }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type FormData = z.infer<typeof formSchema>;

interface ObjectiveFormProps {
  onSubmit: (data: FormData) => Promise<void> | void;
  onSuggestionsCreated?: (type: string, items: any[]) => ((data: FormData) => Promise<void> | void) | undefined;
  objective?: Objective;
  submitButtonText?: string;
}

export function ObjectiveForm({
  onSubmit,
  onSuggestionsCreated,
  objective,
  submitButtonText = "Create Objective",
}: ObjectiveFormProps) {
  const [suggestionsTab, setSuggestionsTab] = useState<"keyResults" | "initiatives" | null>(null);
  const [pendingSuggestions, setPendingSuggestions] = useState<{ type: string, items: any[] } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: objective
      ? {
          name: objective.name,
          description: objective.description,
          startDate: objective.startDate,
          endDate: objective.endDate,
          checkInFrequency: objective.checkInFrequency,
        }
      : {
          name: "",
          description: "",
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
          checkInFrequency: "monthly",
        },
  });

  const handleFormSubmit = (data: FormData) => {
    // If we have pending suggestions and a handler for them, use that handler
    if (pendingSuggestions && onSuggestionsCreated) {
      const alternativeSubmitHandler = onSuggestionsCreated(
        pendingSuggestions.type, 
        pendingSuggestions.items
      );
      
      if (alternativeSubmitHandler) {
        return alternativeSubmitHandler(data);
      }
    }
    
    // Otherwise use the default handler
    return onSubmit(data);
  };

  // Reset suggestions when unmounting
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            {!objective && (
              <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objective Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Increase customer satisfaction" {...field} />
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
                    <Textarea
                      placeholder="Improve our customer satisfaction scores through better support and product quality"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setDate(new Date().getDate() - 1))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setDate(new Date().getDate() - 1))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                  <FormLabel>Check-in Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {checkInFrequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {!objective && (
            <TabsContent value="suggestions" className="pt-4">
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  After creating your objective, use AI to generate suggestions for key results and initiatives.
                </div>
                
                <div className="grid gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      AI-Generated Key Results
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate measurable outcomes to track success
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSuggestionsTab("keyResults")}
                      type="button"
                      className="w-full"
                    >
                      Generate Key Results
                    </Button>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      AI-Generated Initiatives
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate actionable activities to help achieve the objective
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSuggestionsTab("initiatives")}
                      type="button"
                      className="w-full"
                    >
                      Generate Initiatives
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
