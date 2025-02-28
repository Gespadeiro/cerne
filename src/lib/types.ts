
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
  userId?: string;
}

export interface Initiative {
  id: string;
  name: string;
  description: string;
  objectiveId: string;
  keyResultId?: string;
  startDate: Date;
  endDate: Date;
  deleted: boolean;
  completed: boolean;
  progress?: number;
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
  currentValue?: number;
  deleted: boolean;
}

export interface CheckIn {
  id: string;
  date: Date;
  userId: string;
}

export interface KeyResultCheckIn {
  id: string;
  checkInId: string;
  keyResultId: string;
  currentValue: number;
  confidenceLevel: number;
  notes?: string;
}

export interface InitiativeCheckIn {
  id: string;
  checkInId: string;
  initiativeId: string;
  progressStatus: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  confidenceLevel: number;
  notes?: string;
}
