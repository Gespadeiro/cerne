
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Initiative } from "@/lib/types";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { InitiativeDetails as Details } from "@/components/initiative-details";
import { AddSuggestionsButton } from "@/components/ai-suggestions/add-suggestions-button";

const InitiativeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parentObjective, setParentObjective] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        setIsLoading(true);
        // Fetch the initiative data
        const { data: initiativeData, error: initiativeError } = await supabase
          .from('initiatives')
          .select('*')
          .eq('id', id)
          .single();

        if (initiativeError) throw initiativeError;

        // Fetch the parent objective
        const { data: objectiveData, error: objectiveError } = await supabase
          .from('objectives')
          .select('*')
          .eq('id', initiativeData.objective_id)
          .single();

        if (objectiveError) throw objectiveError;

        // Format the initiative data
        const formattedInitiative: Initiative = {
          id: initiativeData.id,
          name: initiativeData.name,
          description: initiativeData.description,
          objectiveId: initiativeData.objective_id,
          keyResultId: initiativeData.key_result_id || undefined,
          startDate: new Date(initiativeData.start_date),
          endDate: new Date(initiativeData.end_date),
          deleted: initiativeData.deleted,
          completed: initiativeData.completed,
        };

        // Format the objective data
        const formattedObjective = {
          id: objectiveData.id,
          name: objectiveData.name,
          description: objectiveData.description,
          startDate: new Date(objectiveData.start_date),
          endDate: new Date(objectiveData.end_date),
          checkInFrequency: objectiveData.check_in_frequency,
          deleted: objectiveData.deleted,
        };

        setInitiative(formattedInitiative);
        setParentObjective(formattedObjective);
      } catch (error: any) {
        toast({
          title: "Error fetching data",
          description: error.message || "An error occurred while fetching the initiative details.",
          variant: "destructive",
        });
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  const handleRefresh = () => {
    if (id) {
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading initiative details...</div>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="w-full p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl">Initiative not found</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{initiative.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Objective</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{parentObjective?.name || "Not assigned"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              {format(initiative.startDate, "MMM d, yyyy")} -{" "}
              {format(initiative.endDate, "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{initiative.completed ? "Completed" : "In Progress"}</div>
          </CardContent>
        </Card>
      </div>

      {parentObjective && (
        <div className="mb-6 flex justify-end space-x-2">
          <AddSuggestionsButton
            objective={parentObjective}
            type="keyResults"
            onSuggestionsAdded={handleRefresh}
          />
          <AddSuggestionsButton
            objective={parentObjective}
            type="initiatives"
            onSuggestionsAdded={handleRefresh}
          />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="text-muted-foreground whitespace-pre-line">
          {initiative.description || "No description provided."}
        </p>
      </div>

      <Details initiative={initiative} />
    </div>
  );
};

export default InitiativeDetails;
