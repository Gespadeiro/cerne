import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { KeyResult, KeyResultCheckIn } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { KeyResultDetailsHeader } from "@/components/key-result-details/KeyResultDetailsHeader";
import { KeyResultDetailsCard } from "@/components/key-result-details/KeyResultDetailsCard";
import { KeyResultProgressChart } from "@/components/key-result-details/KeyResultProgressChart";
import { KeyResultCheckInsTable } from "@/components/key-result-details/KeyResultCheckInsTable";

const KeyResultDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [keyResult, setKeyResult] = useState<KeyResult | null>(null);
  const [checkIns, setCheckIns] = useState<KeyResultCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchKeyResult();
      fetchCheckIns();
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

      // Format the data correctly mapping from database columns to our TypeScript type
      setKeyResult({
        id: data.id,
        name: data.name,
        description: data.description,
        objectiveId: data.objective_id,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        startingValue: Number(data.starting_value),
        goalValue: Number(data.goal_value),
        currentValue: undefined, // This will be updated from check-ins if available
        confidenceLevel: undefined, // This will be updated from check-ins if available
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

  const fetchCheckIns = async () => {
    try {
      const { data, error } = await supabase
        .from('key_result_check_ins')
        .select(`
          id,
          current_value,
          confidence_level,
          notes,
          check_in_id,
          check_ins(date)
        `)
        .eq('key_result_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCheckIns = data.map((item: any) => ({
        id: item.id,
        keyResultId: id as string,
        checkInId: item.check_in_id,
        currentValue: Number(item.current_value),
        confidenceLevel: Number(item.confidence_level),
        notes: item.notes,
        date: new Date(item.check_ins?.date || new Date())
      }));

      setCheckIns(formattedCheckIns);

      // Update the current value and confidence level of the key result if we have check-ins
      if (formattedCheckIns.length > 0) {
        setKeyResult(prevState => {
          if (!prevState) return null;
          return {
            ...prevState,
            currentValue: formattedCheckIns[0].currentValue,
            confidenceLevel: formattedCheckIns[0].confidenceLevel
          };
        });
      }
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
    return <div>Loading key result details...</div>;
  }

  if (!keyResult) {
    return <div>Key result not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <KeyResultDetailsHeader name={keyResult.name} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <KeyResultDetailsCard keyResult={keyResult} />
        <KeyResultProgressChart keyResult={keyResult} checkIns={checkIns} />
      </div>

      <KeyResultCheckInsTable checkIns={checkIns} />
    </div>
  );
};

export default KeyResultDetails;
