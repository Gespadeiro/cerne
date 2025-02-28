
import { z } from "zod";
import { Objective } from "@/lib/types";

// Create a type-safe schema with context
export const createInitiativeSchema = (objectives: Objective[]) => z.object({
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

export type InitiativeFormValues = z.infer<ReturnType<typeof createInitiativeSchema>>;
