
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Initiative, InitiativeCheckIn } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { InitiativeDetailsHeader } from "@/components/initiative-details/InitiativeDetailsHeader";
import { InitiativeDetailsCard } from "@/components/initiative-details/InitiativeDetailsCard";
import { InitiativeProgressChart } from "@/components/initiative-details/InitiativeProgressChart";
import { InitiativeCheckInsTable } from "@/components/initiative-details/InitiativeCheckInsTable";

const InitiativeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [checkIns, setCheckIns] = useState<InitiativeCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchInitiative();
      fetchCheckIns();
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

  const fetchCheckIns = async () => {
    try {
      const { data, error } = await supabase
        .from('initiative_check_ins')
        .select(`
          id,
          progress_status,
          progress_percentage,
          confidence_level,
          notes,
          check_in_id,
          check_ins(date)
        `)
        .eq('initiative_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCheckIns = data.map((item: any) => ({
        id: item.id,
        checkInId: item.check_in_id,
        initiativeId: id as string,
        progressStatus: item.progress_status as 'not-started' | 'in-progress' | 'completed' | 'blocked',
        progress: item.progress_percentage ? Number(item.progress_percentage) : undefined,
        confidenceLevel: Number(item.confidence_level),
        notes: item.notes,
        date: new Date(item.check_ins?.date || new Date())
      }));

      setCheckIns(formattedCheckIns);
    } catch (error: any) {
      console.error("Error fetching check-ins:", error);
      toast({
        title: "Error loading check-ins",
        description: error.message || "An error occurred while loading the check-ins.",
        variant: "destructive",
      });
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
      <InitiativeDetailsHeader name={initiative.name} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Details card */}
        <InitiativeDetailsCard initiative={initiative} />

        {/* Progress chart card */}
        <InitiativeProgressChart checkIns={checkIns} />
      </div>

      {/* Check-ins history table */}
      <InitiativeCheckInsTable checkIns={checkIns} />
    </div>
  );
};

export default InitiativeDetails;
