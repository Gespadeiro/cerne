
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Initiative, Objective } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { InitiativeForm } from "@/components/initiative-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const InitiativeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchInitiativeAndObjectives();
    }
  }, [id]);

  const fetchInitiativeAndObjectives = async () => {
    try {
      setIsLoading(true);
      
      // Fetch initiative
      const { data: initiativeData, error: initiativeError } = await supabase
        .from('initiatives')
        .select('*')
        .eq('id', id)
        .single();

      if (initiativeError) throw initiativeError;

      // Fetch objective
      const { data: objectiveData, error: objectiveError } = await supabase
        .from('objectives')
        .select('*')
        .eq('id', initiativeData.objective_id)
        .single();

      if (objectiveError) throw objectiveError;
      
      // Fetch key results for this objective
      const { data: keyResultsData, error: keyResultsError } = await supabase
        .from('key_results')
        .select('*')
        .eq('objective_id', objectiveData.id)
        .eq('deleted', false);

      if (keyResultsError) throw keyResultsError;
      
      // Format initiative
      const formattedInitiative: Initiative = {
        id: initiativeData.id,
        name: initiativeData.name,
        description: initiativeData.description || "",
        objectiveId: initiativeData.objective_id,
        keyResultId: initiativeData.key_result_id || undefined,
        startDate: new Date(initiativeData.start_date),
        endDate: new Date(initiativeData.end_date),
        deleted: initiativeData.deleted,
        completed: initiativeData.completed,
        progress: undefined, // Will be populated from check-ins if needed
      };

      // Format key results
      const formattedKeyResults = keyResultsData.map(kr => ({
        id: kr.id,
        name: kr.name,
        description: kr.description || "",
        objectiveId: kr.objective_id,
        startDate: new Date(kr.start_date),
        endDate: new Date(kr.end_date),
        startingValue: Number(kr.starting_value),
        goalValue: Number(kr.goal_value),
        deleted: kr.deleted,
      }));

      // Format objective for form
      const formattedObjective: Objective = {
        id: objectiveData.id,
        name: objectiveData.name,
        description: objectiveData.description || "",
        startDate: new Date(objectiveData.start_date),
        endDate: new Date(objectiveData.end_date),
        checkInFrequency: objectiveData.check_in_frequency,
        deleted: objectiveData.deleted,
        initiatives: [],
        keyResults: formattedKeyResults,
        userId: objectiveData.user_id
      };

      setInitiative(formattedInitiative);
      setObjectives([formattedObjective]);
    } catch (error: any) {
      console.error("Error fetching initiative:", error);
      toast({
        title: "Error loading initiative",
        description: error.message || "An error occurred while loading the initiative.",
        variant: "destructive",
      });
      navigate('/dashboard');
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
    return <div className="p-6">Loading initiative...</div>;
  }

  if (!initiative || objectives.length === 0) {
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

      <InitiativeForm
        objectives={objectives}
        initiative={initiative}
        onSubmit={handleUpdate}
        submitButtonText="Update Initiative"
      />
    </div>
  );
};

export default InitiativeEdit;
