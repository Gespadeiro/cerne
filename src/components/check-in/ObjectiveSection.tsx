import React from "react";
import type { Objective } from "@/lib/types";
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
  activeTab: string;
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
  activeTab
}) => {
  return <tr className="bg-muted/30">
      <td colSpan={activeTab === "key-results" ? 7 : 6} className="px-6 py-4">
        <h2 className="gradient-text font-semibold text-xl">{objective.name}</h2>
      </td>
    </tr>;
};