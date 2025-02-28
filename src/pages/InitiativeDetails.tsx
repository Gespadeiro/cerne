
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Initiative } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const InitiativeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
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
      
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setInitiative({
        id: data.id,
        name: data.name,
        description: data.description,
        objectiveId: data.objective_id,
        keyResultId: data.key_result_id || undefined,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        completed: data.completed,
        deleted: data.deleted
      });
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

  if (isLoading) {
    return <div>Loading initiative details...</div>;
  }

  if (!initiative) {
    return <div>Initiative not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{initiative.name}</h1>
      </div>

      <div className="grid gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground">{initiative.description || "No description provided."}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Timeline</h2>
          <p className="text-muted-foreground">
            {new Date(initiative.startDate).toLocaleDateString()} - {new Date(initiative.endDate).toLocaleDateString()}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Status</h2>
          <Badge variant={initiative.completed ? "success" : "secondary"}>
            {initiative.completed ? "Completed" : "In Progress"}
          </Badge>
        </div>

        {initiative.progress !== undefined && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Progress</h2>
            <p className="text-lg font-medium">{initiative.progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InitiativeDetails;
