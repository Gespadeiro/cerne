
import React, { useState } from "react";
import { Objective, KeyResult, Initiative } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { TableHeader } from "./tables/table-header";
import ObjectiveRow from "./tables/objective-row";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyResultForm } from "@/components/key-result-form";
import { InitiativeForm } from "@/components/initiative-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ObjectivesTableProps {
  objectives: Objective[];
  onDelete: (id: string) => void;
  onEdit: (objective: Objective) => void;
}

export function ObjectivesTable({ objectives, onDelete, onEdit }: ObjectivesTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isKeyResultDialogOpen, setIsKeyResultDialogOpen] = useState(false);
  const [isInitiativeDialogOpen, setIsInitiativeDialogOpen] = useState(false);
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);

  const navigateToKeyResult = (id: string) => {
    navigate(`/key-results/${id}`);
  };

  const navigateToInitiative = (id: string) => {
    navigate(`/initiatives/${id}`);
  };

  const editKeyResult = (keyResult: KeyResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedKeyResult(keyResult);
    setIsKeyResultDialogOpen(true);
  };

  const editInitiative = (initiative: Initiative, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInitiative(initiative);
    setIsInitiativeDialogOpen(true);
  };

  const deleteKeyResult = async (keyResultId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('key_results')
        .update({ deleted: true })
        .eq('id', keyResultId);

      if (error) throw error;

      toast({
        title: "Key Result deleted",
        description: "The key result has been moved to the garbage",
      });
      
      // Update local state
      // This is a simplified approach; you might want to implement a more sophisticated state update
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error deleting key result",
        description: error.message || "An error occurred while deleting the key result.",
        variant: "destructive",
      });
    }
  };

  const deleteInitiative = async (initiativeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('initiatives')
        .update({ deleted: true })
        .eq('id', initiativeId);

      if (error) throw error;

      toast({
        title: "Initiative deleted",
        description: "The initiative has been moved to the garbage",
      });
      
      // Update local state
      // This is a simplified approach; you might want to implement a more sophisticated state update
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error deleting initiative",
        description: error.message || "An error occurred while deleting the initiative.",
        variant: "destructive",
      });
    }
  };

  const handleKeyResultUpdate = async (data: any) => {
    if (!selectedKeyResult) return;
    
    try {
      const { error } = await supabase
        .from('key_results')
        .update({
          name: data.name,
          description: data.description,
          objective_id: data.objectiveId,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
          starting_value: data.startingValue,
          goal_value: data.goalValue,
        })
        .eq('id', selectedKeyResult.id);

      if (error) throw error;

      toast({
        title: "Key Result updated",
        description: "Your key result has been updated successfully",
      });
      
      setIsKeyResultDialogOpen(false);
      setSelectedKeyResult(null);
      
      // Refresh data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error updating key result",
        description: error.message || "An error occurred while updating the key result.",
        variant: "destructive",
      });
    }
  };

  const handleInitiativeUpdate = async (data: any) => {
    if (!selectedInitiative) return;
    
    try {
      const { error } = await supabase
        .from('initiatives')
        .update({
          name: data.name,
          description: data.description,
          objective_id: data.objectiveId,
          key_result_id: data.keyResultId || null,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
        })
        .eq('id', selectedInitiative.id);

      if (error) throw error;

      toast({
        title: "Initiative updated",
        description: "Your initiative has been updated successfully",
      });
      
      setIsInitiativeDialogOpen(false);
      setSelectedInitiative(null);
      
      // Refresh data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error updating initiative",
        description: error.message || "An error occurred while updating the initiative.",
        variant: "destructive",
      });
    }
  };

  // Sort objectives by end date (closest first)
  const sortedObjectives = [...objectives].sort((a, b) => 
    a.endDate.getTime() - b.endDate.getTime()
  );

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full divide-y divide-border">
          <TableHeader showStatus={true} />
          <tbody className="bg-background divide-y divide-border">
            {sortedObjectives.map((objective) => (
              <ObjectiveRow
                key={objective.id}
                objective={objective}
                onEdit={() => onEdit(objective)}
                onDelete={() => onDelete(objective.id)}
                onKeyResultClick={navigateToKeyResult}
                onKeyResultEdit={editKeyResult}
                onKeyResultDelete={deleteKeyResult}
                onInitiativeClick={navigateToInitiative}
                onInitiativeEdit={editInitiative}
                onInitiativeDelete={deleteInitiative}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Result Edit Dialog */}
      <Dialog open={isKeyResultDialogOpen} onOpenChange={setIsKeyResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Key Result</DialogTitle>
          </DialogHeader>
          {selectedKeyResult && (
            <KeyResultForm
              objectives={objectives}
              keyResult={selectedKeyResult}
              onSubmit={handleKeyResultUpdate}
              submitButtonText="Update Key Result"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Initiative Edit Dialog */}
      <Dialog open={isInitiativeDialogOpen} onOpenChange={setIsInitiativeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Initiative</DialogTitle>
          </DialogHeader>
          {selectedInitiative && (
            <InitiativeForm
              objectives={objectives}
              initiative={selectedInitiative}
              onSubmit={handleInitiativeUpdate}
              submitButtonText="Update Initiative"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
