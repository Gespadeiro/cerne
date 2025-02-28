
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { KeyResult, Objective } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { KeyResultForm } from "@/components/key-result-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const KeyResultEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [keyResult, setKeyResult] = useState<KeyResult | null>(null);
  const [objective, setObjective] = useState<Objective | null>(null);
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
      
      // Fetch key result
      const { data: keyResultData, error: keyResultError } = await supabase
        .from('key_results')
        .select('*')
        .eq('id', id)
        .single();

      if (keyResultError) throw keyResultError;

      // Fetch objective
      const { data: objectiveData, error: objectiveError } = await supabase
        .from('objectives')
        .select('*')
        .eq('id', keyResultData.objective_id)
        .single();

      if (objectiveError) throw objectiveError;
      
      // Format key result
      const formattedKeyResult: KeyResult = {
        id: keyResultData.id,
        name: keyResultData.name,
        description: keyResultData.description || "",
        objectiveId: keyResultData.objective_id,
        startDate: new Date(keyResultData.start_date),
        endDate: new Date(keyResultData.end_date),
        startingValue: Number(keyResultData.starting_value),
        goalValue: Number(keyResultData.goal_value),
        deleted: keyResultData.deleted,
      };

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
        keyResults: [],
        userId: objectiveData.user_id
      };

      setKeyResult(formattedKeyResult);
      setObjective(formattedObjective);
    } catch (error: any) {
      console.error("Error fetching key result:", error);
      toast({
        title: "Error loading key result",
        description: error.message || "An error occurred while loading the key result.",
        variant: "destructive",
      });
      navigate('/dashboard');
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
    return <div className="p-6">Loading key result...</div>;
  }

  if (!keyResult || !objective) {
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

      <KeyResultForm
        objectives={[objective]}
        keyResult={keyResult}
        onSubmit={handleUpdate}
        submitButtonText="Update Key Result"
      />
    </div>
  );
};

export default KeyResultEdit;
