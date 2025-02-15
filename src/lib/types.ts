
export interface Objective {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  deleted: boolean;
  initiatives: Initiative[];
  keyResults: KeyResult[];
  checkInFrequency: number;
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

export interface KeyResult {
  id: string;
  name: string;
  description: string;
  objectiveId: string;
  startDate: Date;
  endDate: Date;
  startingValue: number;
  goalValue: number;
  deleted: boolean;
}
