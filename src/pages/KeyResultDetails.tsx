
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { KeyResult } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const KeyResultDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [keyResult, setKeyResult] = useState<KeyResult | null>(null);
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
      
      const { data, error } = await supabase
        .from('key_results')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setKeyResult({
        id: data.id,
        name: data.name,
        description: data.description,
        objectiveId: data.objective_id,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        startingValue: Number(data.starting_value),
        goalValue: Number(data.goal_value),
        deleted: data.deleted
      });
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

  if (isLoading) {
    return <div>Loading key result details...</div>;
  }

  if (!keyResult) {
    return <div>Key result not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{keyResult.name}</h1>
      </div>

      <div className="grid gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground">{keyResult.description || "No description provided."}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Timeline</h2>
          <p className="text-muted-foreground">
            {new Date(keyResult.startDate).toLocaleDateString()} - {new Date(keyResult.endDate).toLocaleDateString()}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Values</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Starting Value</p>
              <p className="text-lg font-medium">{keyResult.startingValue}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Goal Value</p>
              <p className="text-lg font-medium">{keyResult.goalValue}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-lg font-medium">{keyResult.currentValue || "Not set"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyResultDetails;
