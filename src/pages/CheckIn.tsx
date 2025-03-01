import React, { useState } from "react";
import type { Objective, CheckIn as CheckInType, KeyResultCheckIn, InitiativeCheckIn } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Import the components
import { DataFetcher } from "@/components/check-in/DataFetcher";
import { CheckInHeader } from "@/components/check-in/CheckInHeader";
import { NoObjectivesMessage } from "@/components/check-in/NoObjectivesMessage";
import { ObjectiveSection } from "@/components/check-in/ObjectiveSection";
import { KeyResultRow } from "@/components/check-in/KeyResultRow";
import { InitiativeRow } from "@/components/check-in/InitiativeRow";
const CheckIn = () => {
  const [keyResultValues, setKeyResultValues] = useState<Record<string, string>>({});
  const [keyResultConfidence, setKeyResultConfidence] = useState<Record<string, string>>({});
  const [keyResultNotes, setKeyResultNotes] = useState<Record<string, string>>({});
  const [initiativeStatus, setInitiativeStatus] = useState<Record<string, string>>({});
  const [initiativeConfidence, setInitiativeConfidence] = useState<Record<string, string>>({});
  const [initiativePercentage, setInitiativePercentage] = useState<Record<string, string>>({});
  const [initiativeNotes, setInitiativeNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("key-results");
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const handleSubmitCheckIn = async () => {
    if (!user) return;
    try {
      // Create a new check-in
      const {
        data: checkInData,
        error: checkInError
      } = await supabase.from('check_ins').insert({
        user_id: user.id,
        date: new Date().toISOString()
      }).select().single();
      if (checkInError) throw checkInError;

      // Process key result check-ins
      const keyResultCheckIns = Object.entries(keyResultValues).filter(([keyResultId, value]) => value && keyResultConfidence[keyResultId]).map(([keyResultId, value]) => ({
        check_in_id: checkInData.id,
        key_result_id: keyResultId,
        current_value: Number(value),
        confidence_level: Number(keyResultConfidence[keyResultId] || 5),
        notes: keyResultNotes[keyResultId] || ''
      }));
      if (keyResultCheckIns.length > 0) {
        const {
          error: krCheckInError
        } = await supabase.from('key_result_check_ins').insert(keyResultCheckIns);
        if (krCheckInError) throw krCheckInError;
      }

      // Process initiative check-ins
      const initiativeCheckIns = Object.entries(initiativeStatus).filter(([initiativeId, status]) => status && initiativeConfidence[initiativeId]).map(([initiativeId, status]) => ({
        check_in_id: checkInData.id,
        initiative_id: initiativeId,
        progress_status: status,
        progress_percentage: initiativePercentage[initiativeId] ? Number(initiativePercentage[initiativeId]) : 0,
        confidence_level: Number(initiativeConfidence[initiativeId] || 5),
        notes: initiativeNotes[initiativeId] || ''
      }));
      if (initiativeCheckIns.length > 0) {
        const {
          error: initCheckInError
        } = await supabase.from('initiative_check_ins').insert(initiativeCheckIns);
        if (initCheckInError) throw initCheckInError;
      }
      toast({
        title: "Check-in submitted",
        description: "Your check-in has been recorded successfully."
      });

      // Reset the form
      setKeyResultValues({});
      setKeyResultConfidence({});
      setKeyResultNotes({});
      setInitiativeStatus({});
      setInitiativePercentage({});
      setInitiativeConfidence({});
      setInitiativeNotes({});
    } catch (error: any) {
      toast({
        title: "Error submitting check-in",
        description: error.message || "An error occurred while submitting your check-in.",
        variant: "destructive"
      });
      console.error("Error submitting check-in:", error);
    }
  };
  return <div className="w-full p-6 min-h-screen bg-gradient-to-b from-background to-accent/20">
      <CheckInHeader />
      
      <Tabs defaultValue="key-results" className="mt-2 w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full flex justify-center mb-6">
          <TabsTrigger value="key-results" className="px-8">Key Results</TabsTrigger>
          <TabsTrigger value="initiatives" className="px-8">Initiatives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="key-results">
          <DataFetcher>
            {({
            objectives,
            isLoading,
            lastKeyResultValues,
            lastInitiativeValues
          }) => {
            if (isLoading) {
              return <div className="w-full flex items-center justify-center">
                    <div className="text-xl">Loading your objectives...</div>
                  </div>;
            }
            if (objectives.length === 0) {
              return <NoObjectivesMessage />;
            }
            return <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold w-[250px]">Key Result</TableHead>
                        <TableHead className="font-semibold w-[120px]">Starting Value</TableHead>
                        <TableHead className="font-semibold w-[120px]">Current Value</TableHead>
                        <TableHead className="font-semibold w-[120px]">Goal Value</TableHead>
                        <TableHead className="font-semibold w-[150px]">Check-in Value</TableHead>
                        <TableHead className="font-semibold w-[150px]">Confidence</TableHead>
                        <TableHead className="font-semibold">Observations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {objectives.map(objective => <React.Fragment key={objective.id}>
                          <ObjectiveSection objective={objective} keyResultValues={keyResultValues} setKeyResultValues={setKeyResultValues} keyResultConfidence={keyResultConfidence} setKeyResultConfidence={setKeyResultConfidence} keyResultNotes={keyResultNotes} setKeyResultNotes={setKeyResultNotes} initiativeStatus={initiativeStatus} setInitiativeStatus={setInitiativeStatus} initiativeConfidence={initiativeConfidence} setInitiativeConfidence={setInitiativeConfidence} initiativePercentage={initiativePercentage} setInitiativePercentage={setInitiativePercentage} initiativeNotes={initiativeNotes} setInitiativeNotes={setInitiativeNotes} lastKeyResultValues={lastKeyResultValues} lastInitiativeValues={lastInitiativeValues} activeTab={activeTab} />
                          {objective.keyResults.filter(kr => !kr.deleted).map(keyResult => <KeyResultRow key={keyResult.id} keyResult={keyResult} keyResultValues={keyResultValues} setKeyResultValues={setKeyResultValues} keyResultConfidence={keyResultConfidence} setKeyResultConfidence={setKeyResultConfidence} keyResultNotes={keyResultNotes} setKeyResultNotes={setKeyResultNotes} lastKeyResultValue={lastKeyResultValues[keyResult.id]} />)}
                        </React.Fragment>)}
                    </TableBody>
                  </Table>

                  <div className="mt-8 flex justify-center">
                    <Button size="lg" onClick={handleSubmitCheckIn} disabled={Object.keys(keyResultValues).length === 0 && Object.keys(initiativeStatus).length === 0}>
                      Submit Check-in
                    </Button>
                  </div>
                </>;
          }}
          </DataFetcher>
        </TabsContent>
        
        <TabsContent value="initiatives">
          <DataFetcher>
            {({
            objectives,
            isLoading,
            lastKeyResultValues,
            lastInitiativeValues
          }) => {
            if (isLoading) {
              return <div className="w-full flex items-center justify-center">
                    <div className="text-xl">Loading your objectives...</div>
                  </div>;
            }
            if (objectives.length === 0) {
              return <NoObjectivesMessage />;
            }
            return <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold w-[25%]">Initiative</TableHead>
                        <TableHead className="font-semibold w-[15%]">Progress</TableHead>
                        <TableHead className="font-semibold w-[15%]">Current Percentage</TableHead>
                        <TableHead className="font-semibold w-[15%]">Check-in Percentage</TableHead>
                        <TableHead className="font-semibold w-[15%]">Confidence Level</TableHead>
                        <TableHead className="font-semibold">Observations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {objectives.map(objective => <React.Fragment key={objective.id}>
                          <ObjectiveSection objective={objective} keyResultValues={keyResultValues} setKeyResultValues={setKeyResultValues} keyResultConfidence={keyResultConfidence} setKeyResultConfidence={setKeyResultConfidence} keyResultNotes={keyResultNotes} setKeyResultNotes={setKeyResultNotes} initiativeStatus={initiativeStatus} setInitiativeStatus={setInitiativeStatus} initiativeConfidence={initiativeConfidence} setInitiativeConfidence={setInitiativeConfidence} initiativePercentage={initiativePercentage} setInitiativePercentage={setInitiativePercentage} initiativeNotes={initiativeNotes} setInitiativeNotes={setInitiativeNotes} lastKeyResultValues={lastKeyResultValues} lastInitiativeValues={lastInitiativeValues} activeTab={activeTab} />
                          {objective.initiatives.filter(initiative => !initiative.deleted).map(initiative => <InitiativeRow key={initiative.id} initiative={initiative} initiativeStatus={initiativeStatus} setInitiativeStatus={setInitiativeStatus} initiativeConfidence={initiativeConfidence} setInitiativeConfidence={setInitiativeConfidence} initiativePercentage={initiativePercentage} setInitiativePercentage={setInitiativePercentage} initiativeNotes={initiativeNotes} setInitiativeNotes={setInitiativeNotes} lastInitiativeValue={lastInitiativeValues[initiative.id]} />)}
                        </React.Fragment>)}
                    </TableBody>
                  </Table>

                  <div className="mt-8 flex justify-center">
                    <Button size="lg" onClick={handleSubmitCheckIn} disabled={Object.keys(keyResultValues).length === 0 && Object.keys(initiativeStatus).length === 0}>
                      Submit Check-in
                    </Button>
                  </div>
                </>;
          }}
          </DataFetcher>
        </TabsContent>
      </Tabs>
    </div>;
};
export default CheckIn;