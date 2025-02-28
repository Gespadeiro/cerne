
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Initiative, Objective } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InitiativeForm } from "@/components/initiative-form";

const InitiativeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [objective, setObjective] = useState<any | null>(null);
  const [keyResult, setKeyResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

      // Fetch associated objective
      const { data: objectiveData, error: objectiveError } = await supabase
        .from('objectives')
        .select('*')
        .eq('id', initiativeData.objective_id)
        .single();

      if (objectiveError) throw objectiveError;

      // Fetch associated key result if any
      let keyResultData = null;
      if (initiativeData.key_result_id) {
        const { data, error } = await supabase
          .from('key_results')
          .select('*')
          .eq('id', initiativeData.key_result_id)
          .single();
        
        if (!error) {
          keyResultData = data;
        }
      }

      // Fetch check-ins for this initiative
      const { data: checkInsData, error: checkInsError } = await supabase
        .from('initiative_check_ins')
        .select(`
          *,
          check_ins(*)
        `)
        .eq('initiative_id', id)
        .order('created_at', { ascending: false });

      if (checkInsError) throw checkInsError;

      // Fetch all key results for this objective (for the edit form)
      const { data: keyResultsData, error: keyResultsError } = await supabase
        .from('key_results')
        .select('*')
        .eq('objective_id', initiativeData.objective_id)
        .eq('deleted', false);

      if (keyResultsError) throw keyResultsError;

      // Format the data
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

      // Format the objective with its key results
      const formattedObjective: Objective = {
        id: objectiveData.id,
        name: objectiveData.name,
        description: objectiveData.description,
        startDate: new Date(objectiveData.start_date),
        endDate: new Date(objectiveData.end_date),
        checkInFrequency: objectiveData.check_in_frequency,
        deleted: objectiveData.deleted,
        userId: objectiveData.user_id,
        initiatives: [],
        keyResults: keyResultsData.map(kr => ({
          id: kr.id,
          name: kr.name,
          description: kr.description,
          objectiveId: kr.objective_id,
          startDate: new Date(kr.start_date),
          endDate: new Date(kr.end_date),
          startingValue: Number(kr.starting_value),
          goalValue: Number(kr.goal_value),
          deleted: kr.deleted
        }))
      };

      setInitiative(formattedInitiative);
      setObjective(formattedObjective);
      setKeyResult(keyResultData);
      setCheckIns(checkInsData || []);
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
    if (!initiative || !objective) return;
    
    try {
      const { error } = await supabase
        .from('initiatives')
        .update({
          name: data.name,
          description: data.description,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
          key_result_id: data.keyResultId || null,
        })
        .eq('id', initiative.id);

      if (error) throw error;

      // Update local state
      setInitiative({
        ...initiative,
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        keyResultId: data.keyResultId || undefined,
      });

      // If key result changed, fetch the new one
      if (data.keyResultId !== initiative.keyResultId) {
        if (data.keyResultId) {
          const { data: newKeyResultData, error: keyResultError } = await supabase
            .from('key_results')
            .select('*')
            .eq('id', data.keyResultId)
            .single();
          
          if (!keyResultError) {
            setKeyResult(newKeyResultData);
          }
        } else {
          setKeyResult(null);
        }
      }

      setIsEditDialogOpen(false);
      
      toast({
        title: "Initiative updated",
        description: "Your initiative has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating initiative",
        description: error.message || "An error occurred while updating the initiative.",
        variant: "destructive",
      });
      console.error("Error updating initiative:", error);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "PPP");
  };

  if (isLoading) {
    return <div className="p-6">Loading initiative details...</div>;
  }

  if (!initiative || !objective) {
    return <div className="p-6">Initiative not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{initiative.name}</h1>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Initiative
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Initiative Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Objective:</span> {objective.name}
            </div>
            {keyResult && (
              <div>
                <span className="font-medium">Key Result:</span> {keyResult.name}
              </div>
            )}
            <div>
              <span className="font-medium">Description:</span> {initiative.description}
            </div>
            <div>
              <span className="font-medium">Timeline:</span> {formatDate(initiative.startDate)} - {formatDate(initiative.endDate)}
            </div>
            <div>
              <span className="font-medium">Status:</span> {initiative.completed ? "Completed" : "In Progress"}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Check-In History</CardTitle>
            <CardDescription>Recent check-ins for this initiative</CardDescription>
          </CardHeader>
          <CardContent>
            {checkIns.length > 0 ? (
              <div className="space-y-4">
                {checkIns.map((checkIn) => (
                  <div key={checkIn.id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <p className="font-medium">
                        Status: {checkIn.progress_status}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(checkIn.created_at), "PPP")}
                      </p>
                    </div>
                    {checkIn.progress_percentage !== null && (
                      <p className="text-sm mt-2">
                        Progress: {checkIn.progress_percentage}%
                      </p>
                    )}
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

      {/* Edit Initiative Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Initiative</DialogTitle>
          </DialogHeader>
          {objective && initiative && (
            <InitiativeForm
              objectives={[objective]}
              initiative={initiative}
              onSubmit={handleUpdate}
              submitButtonText="Update Initiative"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InitiativeDetails;
