
import { z } from "zod";
import { Objective } from "@/lib/types";

export const createInitiativeSchema = (objectives: Objective[]) => {
  return z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    objectiveId: z.string().min(1, "Objective is required"),
    keyResultId: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  });
};

export type InitiativeFormValues = {
  name: string;
  description: string;
  objectiveId: string;
  keyResultId: string;
  startDate: string;
  endDate: string;
};
