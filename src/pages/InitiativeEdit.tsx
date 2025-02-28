
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Initiative, Objective } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { InitiativeForm } from "@/components/initiative-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const InitiativeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchInitiative();
    }
  }, [id]);

  const fetchInitiative = async () => {
    try {
      setIsLoading(true);
      
      // Fetch initiative details
      const { data: initiativeData, error: initiativeError } = await supabase
        .from('initiatives')
        .select('*')
        .eq('id', id)
        .single();

      if (initiativeError) throw initiativeError;

      // Fetch all objectives for the form
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('objectives')
        .select('*')
        .eq('deleted', false);

      if (objectivesError) throw objectivesError;

      // Fetch all key results for these objectives
      const { data: keyResultsData, error: keyResultsError } = await supabase
        .from('key_results')
        .select('*')
        .eq('deleted', false)
        .in('objective_id', objectivesData.map(obj => obj.id));

      if (keyResultsError) throw keyResultsError;

      // Format the initiative data
      const formattedInitiative: Initiative = {
        id: initiativeData.id,
        name: initiativeData.name,
        description: initiativeData.description,
        objectiveId: initiativeData.objective_id,
        keyResultId: initiativeData.key_result_id || undefined,
        startDate: new Date(initiativeData.start_date),
        endDate: new Date(initiativeData.end_date),
        completed: initiativeData.completed,
        deleted: initiativeData.deleted,
      };

      // Format the objectives with their key results
      const formattedObjectives = objectivesData.map(obj => {
        const objectiveKeyResults = keyResultsData
          .filter(kr => kr.objective_id === obj.id)
          .map(kr => ({
            id: kr.id,
            name: kr.name,
            description: kr.description,
            objectiveId: kr.objective_id,
            startDate: new Date(kr.start_date),
            endDate: new Date(kr.end_date),
            startingValue: Number(kr.starting_value),
            goalValue: Number(kr.goal_value),
            deleted: kr.deleted
          }));

        return {
          id: obj.id,
          name: obj.name,
          description: obj.description,
          startDate: new Date(obj.start_date),
          endDate: new Date(obj.end_date),
          checkInFrequency: obj.check_in_frequency,
          deleted: obj.deleted,
          userId: obj.user_id,
          initiatives: [],
          keyResults: objectiveKeyResults
        };
      });

      setInitiative(formattedInitiative);
      setObjectives(formattedObjectives);
    } catch (error: any) {
      console.error("Error fetching initiative:", error);
      toast({
        title: "Error loading initiative",
        description: error.message || "An error occurred while loading the initiative.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!initiative) return;

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
        .eq('id', initiative.id);

      if (error) throw error;

      toast({
        title: "Initiative updated",
        description: "Your initiative has been updated successfully",
      });

      // Navigate back to initiative details
      navigate(`/initiatives/${initiative.id}`);
    } catch (error: any) {
      toast({
        title: "Error updating initiative",
        description: error.message || "An error occurred while updating the initiative.",
        variant: "destructive",
      });
      console.error("Error updating initiative:", error);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading initiative details...</div>;
  }

  if (!initiative) {
    return <div className="p-6">Initiative not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Initiative</h1>
      </div>

      {initiative && objectives.length > 0 && (
        <InitiativeForm
          objectives={objectives}
          initiative={initiative}
          onSubmit={handleUpdate}
          submitButtonText="Update Initiative"
        />
      )}
    </div>
  );
};

export default InitiativeEdit;
