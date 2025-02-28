
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { KeyResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KeyResultForm } from "@/components/key-result-form";

const KeyResultDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [keyResult, setKeyResult] = useState<KeyResult | null>(null);
  const [objective, setObjective] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

      // Fetch associated objective
      const { data: objectiveData, error: objectiveError } = await supabase
        .from('objectives')
        .select('*')
        .eq('id', keyResultData.objective_id)
        .single();

      if (objectiveError) throw objectiveError;

      // Fetch check-ins for this key result
      const { data: checkInsData, error: checkInsError } = await supabase
        .from('key_result_check_ins')
        .select(`
          *,
          check_ins(*)
        `)
        .eq('key_result_id', id)
        .order('created_at', { ascending: false });

      if (checkInsError) throw checkInsError;

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

      setKeyResult(formattedKeyResult);
      setObjective(objectiveData);
      setCheckIns(checkInsData || []);
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
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
          starting_value: data.startingValue,
          goal_value: data.goalValue,
        })
        .eq('id', keyResult.id);

      if (error) throw error;

      // Update local state
      setKeyResult({
        ...keyResult,
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        startingValue: data.startingValue,
        goalValue: data.goalValue,
      });

      setIsEditDialogOpen(false);
      
      toast({
        title: "Key Result updated",
        description: "Your key result has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating key result",
        description: error.message || "An error occurred while updating the key result.",
        variant: "destructive",
      });
      console.error("Error updating key result:", error);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "PPP");
  };

  if (isLoading) {
    return <div className="p-6">Loading key result details...</div>;
  }

  if (!keyResult) {
    return <div className="p-6">Key result not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{keyResult.name}</h1>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Key Result
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Key Result Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Objective:</span> {objective?.name}
            </div>
            <div>
              <span className="font-medium">Description:</span> {keyResult.description}
            </div>
            <div>
              <span className="font-medium">Timeline:</span> {formatDate(keyResult.startDate)} - {formatDate(keyResult.endDate)}
            </div>
            <div>
              <span className="font-medium">Starting Value:</span> {keyResult.startingValue}
            </div>
            <div>
              <span className="font-medium">Goal Value:</span> {keyResult.goalValue}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Check-In History</CardTitle>
            <CardDescription>Recent check-ins for this key result</CardDescription>
          </CardHeader>
          <CardContent>
            {checkIns.length > 0 ? (
              <div className="space-y-4">
                {checkIns.map((checkIn) => (
                  <div key={checkIn.id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <p className="font-medium">
                        Value: {checkIn.current_value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(checkIn.created_at), "PPP")}
                      </p>
                    </div>
                    <p className="text-sm mt-2">
                      Confidence: {checkIn.confidence_level}/10
                    </p>
                    {checkIn.notes && (
                      <p className="text-sm mt-2 text-muted-foreground">
                        Notes: {checkIn.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No check-ins recorded yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Key Result Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Key Result</DialogTitle>
          </DialogHeader>
          {keyResult && objective && (
            <KeyResultForm
              objectives={[{
                ...objective,
                startDate: new Date(objective.start_date),
                endDate: new Date(objective.end_date),
                keyResults: [],
                initiatives: []
              }]}
              keyResult={keyResult}
              onSubmit={handleUpdate}
              submitButtonText="Update Key Result"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KeyResultDetails;
