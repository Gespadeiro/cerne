
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { KeyResult } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { KeyResultForm } from "@/components/key-result-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const KeyResultEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [keyResult, setKeyResult] = useState<KeyResult | null>(null);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchKeyResult();
    }
  }, [id]);

  const fetchKeyResult = async () => {
    try {
      setIsLoading(true);
      
      // Fetch key result details
      const { data: keyResultData, error: keyResultError } = await supabase
        .from('key_results')
        .select('*')
        .eq('id', id)
        .single();

      if (keyResultError) throw keyResultError;

      // Fetch all objectives for the form
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('objectives')
        .select('*')
        .eq('deleted', false);

      if (objectivesError) throw objectivesError;

      // Format the data
      const formattedKeyResult: KeyResult = {
        id: keyResultData.id,
        name: keyResultData.name,
        description: keyResultData.description,
        objectiveId: keyResultData.objective_id,
        startDate: new Date(keyResultData.start_date),
        endDate: new Date(keyResultData.end_date),
        startingValue: Number(keyResultData.starting_value),
        goalValue: Number(keyResultData.goal_value),
        deleted: keyResultData.deleted,
      };

      // Format objectives
      const formattedObjectives = objectivesData.map(obj => ({
        id: obj.id,
        name: obj.name,
        description: obj.description,
        startDate: new Date(obj.start_date),
        endDate: new Date(obj.end_date),
        checkInFrequency: obj.check_in_frequency,
        deleted: obj.deleted,
        userId: obj.user_id,
        initiatives: [],
        keyResults: []
      }));

      setKeyResult(formattedKeyResult);
      setObjectives(formattedObjectives);
    } catch (error: any) {
      console.error("Error fetching key result:", error);
      toast({
        title: "Error loading key result",
        description: error.message || "An error occurred while loading the key result.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!keyResult) return;

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
        .eq('id', keyResult.id);

      if (error) throw error;

      toast({
        title: "Key Result updated",
        description: "Your key result has been updated successfully",
      });

      // Navigate back to key result details
      navigate(`/key-results/${keyResult.id}`);
    } catch (error: any) {
      toast({
        title: "Error updating key result",
        description: error.message || "An error occurred while updating the key result.",
        variant: "destructive",
      });
      console.error("Error updating key result:", error);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading key result details...</div>;
  }

  if (!keyResult) {
    return <div className="p-6">Key result not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Key Result</h1>
      </div>

      {keyResult && objectives.length > 0 && (
        <KeyResultForm
          objectives={objectives}
          keyResult={keyResult}
          onSubmit={handleUpdate}
          submitButtonText="Update Key Result"
        />
      )}
    </div>
  );
};

export default KeyResultEdit;
