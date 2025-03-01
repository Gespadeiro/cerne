
import React from "react";
import type { Objective } from "@/lib/types";
import { KeyResultsTable } from "./KeyResultsTable";
import { InitiativesTable } from "./InitiativesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LastCheckInValues {
  [keyResultId: string]: number;
}

interface LastInitiativeValues {
  [initiativeId: string]: {
    status: string;
    percentage: number;
  };
}

interface ObjectiveSectionProps {
  objective: Objective;
  keyResultValues: Record<string, string>;
  setKeyResultValues: (values: Record<string, string>) => void;
  keyResultConfidence: Record<string, string>;
  setKeyResultConfidence: (values: Record<string, string>) => void;
  keyResultNotes: Record<string, string>;
  setKeyResultNotes: (values: Record<string, string>) => void;
  initiativeStatus: Record<string, string>;
  setInitiativeStatus: (values: Record<string, string>) => void;
  initiativeConfidence: Record<string, string>;
  setInitiativeConfidence: (values: Record<string, string>) => void;
  initiativePercentage: Record<string, string>;
  setInitiativePercentage: (values: Record<string, string>) => void;
  initiativeNotes: Record<string, string>;
  setInitiativeNotes: (values: Record<string, string>) => void;
  lastKeyResultValues: LastCheckInValues;
  lastInitiativeValues: LastInitiativeValues;
}

export const ObjectiveSection: React.FC<ObjectiveSectionProps> = ({
  objective,
  keyResultValues,
  setKeyResultValues,
  keyResultConfidence,
  setKeyResultConfidence,
  keyResultNotes,
  setKeyResultNotes,
  initiativeStatus,
  setInitiativeStatus,
  initiativeConfidence,
  setInitiativeConfidence,
  initiativePercentage,
  setInitiativePercentage,
  initiativeNotes,
  setInitiativeNotes,
  lastKeyResultValues,
  lastInitiativeValues,
}) => {
  return (
    <div key={objective.id} className="mb-8 w-full">
      <h2 className="text-2xl font-bold mb-4 gradient-text">{objective.name}</h2>
      <Tabs defaultValue="key-results" className="mt-2 w-full">
        <TabsList className="w-full flex justify-center mb-6">
          <TabsTrigger value="key-results" className="px-8">Key Results</TabsTrigger>
          <TabsTrigger value="initiatives" className="px-8">Initiatives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="key-results" className="space-y-8 w-full">
          <KeyResultsTable
            objective={objective}
            keyResultValues={keyResultValues}
            setKeyResultValues={setKeyResultValues}
            keyResultConfidence={keyResultConfidence}
            setKeyResultConfidence={setKeyResultConfidence}
            keyResultNotes={keyResultNotes}
            setKeyResultNotes={setKeyResultNotes}
            lastKeyResultValues={lastKeyResultValues}
          />
        </TabsContent>
        
        <TabsContent value="initiatives" className="space-y-8 w-full">
          <InitiativesTable
            objective={objective}
            initiativeStatus={initiativeStatus}
            setInitiativeStatus={setInitiativeStatus}
            initiativeConfidence={initiativeConfidence}
            setInitiativeConfidence={setInitiativeConfidence}
            initiativePercentage={initiativePercentage}
            setInitiativePercentage={setInitiativePercentage}
            initiativeNotes={initiativeNotes}
            setInitiativeNotes={setInitiativeNotes}
            lastInitiativeValues={lastInitiativeValues}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
