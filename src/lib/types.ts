export interface Objective {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  deleted: boolean;
  initiatives: Initiative[];
}

export interface Initiative {
  id: string;
  name: string;
  description: string;
  objectiveId: string;
  startDate: Date;
  endDate: Date;
  deleted: boolean;
  completed: boolean;
}