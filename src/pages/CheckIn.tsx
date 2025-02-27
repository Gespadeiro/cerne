
import { useState, useEffect } from "react";
import type { Objective, CheckIn as CheckInType, KeyResultCheckIn, InitiativeCheckIn } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CheckIn = () => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyResultValues, setKeyResultValues] = useState<Record<string, string>>({});
  const [keyResultConfidence, setKeyResultConfidence] = useState<Record<string, string>>({});
  const [initiativeStatus, setInitiativeStatus] = useState<Record<string, string>>({});
  const [initiativeConfidence, setInitiativeConfidence] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchObjectives();
    }
  }, [user]);

  const fetchObjectives = async () => {
    try {
      setIsLoading(true);

      // Fetch objectives
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('objectives')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (objectivesError) throw objectivesError;

      // Fetch initiatives for these objectives
      const { data: initiativesData, error: initiativesError } = await supabase
        .from('initiatives')
        .select('*')
        .eq('deleted', false)
        .in('objective_id', objectivesData.map(obj => obj.id));

      if (initiativesError) throw initiativesError;

      // Fetch key results for these objectives
      const { data: keyResultsData, error: keyResultsError } = await supabase
        .from('key_results')
        .select('*')
        .eq('deleted', false)
        .in('objective_id', objectivesData.map(obj => obj.id));

      if (keyResultsError) throw keyResultsError;

      // Map the data to our frontend types
      const mappedObjectives = objectivesData.map(obj => {
        const objectiveInitiatives = initiativesData
          .filter(init => init.objective_id === obj.id)
          .map(init => ({
            id: init.id,
            name: init.name,
            description: init.description,
            objectiveId: init.objective_id,
            startDate: new Date(init.start_date),
            endDate: new Date(init.end_date),
            deleted: init.deleted,
            completed: init.completed
          }));

        const objectiveKeyResults = keyResultsData
          .filter(kr => kr.objective_id === obj.id)
          .map(kr => ({
            id: kr.id,
            name: kr.name,
            description: kr.description,
            objectiveId: kr.objective_id,
            startDate: new Date(kr.start_date),
            endDate: new Date(kr.end_date),
            startingValue: Number(kr.starting_value),
            goalValue: Number(kr.goal_value),
            deleted: kr.deleted
          }));

        return {
          id: obj.id,
          name: obj.name,
          description: obj.description,
          startDate: new Date(obj.start_date),
          endDate: new Date(obj.end_date),
          checkInFrequency: obj.check_in_frequency,
          deleted: obj.deleted,
          initiatives: objectiveInitiatives,
          keyResults: objectiveKeyResults,
          userId: obj.user_id
        };
      });

      setObjectives(mappedObjectives);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message || "An error occurred while fetching your objectives.",
        variant: "destructive",
      });
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCheckIn = async () => {
    if (!user) return;

    try {
      // Create a new check-in
      const { data: checkInData, error: checkInError } = await supabase
        .from('check_ins')
        .insert({
          user_id: user.id,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (checkInError) throw checkInError;

      // Process key result check-ins
      const keyResultCheckIns = Object.entries(keyResultValues)
        .filter(([keyResultId, value]) => value && keyResultConfidence[keyResultId])
        .map(([keyResultId, value]) => ({
          check_in_id: checkInData.id,
          key_result_id: keyResultId,
          current_value: Number(value),
          confidence_level: Number(keyResultConfidence[keyResultId] || 5),
          notes: ''
        }));

      if (keyResultCheckIns.length > 0) {
        const { error: krCheckInError } = await supabase
          .from('key_result_check_ins')
          .insert(keyResultCheckIns);

        if (krCheckInError) throw krCheckInError;
      }

      // Process initiative check-ins
      const initiativeCheckIns = Object.entries(initiativeStatus)
        .filter(([initiativeId, status]) => status && initiativeConfidence[initiativeId])
        .map(([initiativeId, status]) => ({
          check_in_id: checkInData.id,
          initiative_id: initiativeId,
          progress_status: status,
          confidence_level: Number(initiativeConfidence[initiativeId] || 5),
          notes: ''
        }));

      if (initiativeCheckIns.length > 0) {
        const { error: initCheckInError } = await supabase
          .from('initiative_check_ins')
          .insert(initiativeCheckIns);

        if (initCheckInError) throw initCheckInError;
      }

      toast({
        title: "Check-in submitted",
        description: "Your check-in has been recorded successfully.",
      });

      // Reset the form
      setKeyResultValues({});
      setKeyResultConfidence({});
      setInitiativeStatus({});
      setInitiativeConfidence({});
    } catch (error: any) {
      toast({
        title: "Error submitting check-in",
        description: error.message || "An error occurred while submitting your check-in.",
        variant: "destructive",
      });
      console.error("Error submitting check-in:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading your objectives...</div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="w-full">
        <div className="flex flex-col items-center mb-12 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-4">Progress Check-in</h1>
          <p className="text-muted-foreground max-w-2xl">
            Track your journey, celebrate progress, and stay committed to your goals.
            Regular check-ins help maintain momentum and ensure success.
          </p>
        </div>
        
        <div className="glass-card p-6 w-full">
          <Tabs defaultValue="key-results" className="mt-2 w-full">
            <TabsList className="w-full flex justify-center mb-6">
              <TabsTrigger value="key-results" className="px-8">Key Results</TabsTrigger>
              <TabsTrigger value="initiatives" className="px-8">Initiatives</TabsTrigger>
            </TabsList>

            <TabsContent value="key-results" className="space-y-8 w-full">
              {objectives.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-lg text-muted-foreground">You don't have any objectives yet.</p>
                  <p className="text-muted-foreground">Go to the Dashboard to create your first objective.</p>
                </div>
              ) : (
                objectives.map(objective => (
                  <div key={objective.id} className="mb-8 w-full">
                    <h2 className="text-2xl font-bold mb-4 gradient-text">{objective.name}</h2>
                    <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm w-full">
                      <div className="w-full">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-semibold w-[250px]">Key Result</TableHead>
                              <TableHead className="font-semibold w-[150px]">Starting Value</TableHead>
                              <TableHead className="font-semibold w-[150px]">Goal Value</TableHead>
                              <TableHead className="font-semibold w-[200px]">Current Value</TableHead>
                              <TableHead className="font-semibold w-[200px]">Confidence Level</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {objective.keyResults
                              .filter(kr => !kr.deleted)
                              .map(kr => (
                                <TableRow key={kr.id}>
                                  <TableCell className="font-medium">{kr.name}</TableCell>
                                  <TableCell>{kr.startingValue}</TableCell>
                                  <TableCell>{kr.goalValue}</TableCell>
                                  <TableCell>
                                    <Input 
                                      type="text" 
                                      placeholder="Enter current value"
                                      className="w-full bg-background/50"
                                      value={keyResultValues[kr.id] || ''}
                                      onChange={(e) => setKeyResultValues({
                                        ...keyResultValues,
                                        [kr.id]: e.target.value
                                      })}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={keyResultConfidence[kr.id]}
                                      onValueChange={(value) => setKeyResultConfidence({
                                        ...keyResultConfidence,
                                        [kr.id]: value
                                      })}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="1-9" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(value => (
                                          <SelectItem key={value} value={value.toString()}>
                                            {value}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
              ))
              )}
            </TabsContent>

            <TabsContent value="initiatives" className="space-y-8 w-full">
              {objectives.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-lg text-muted-foreground">You don't have any objectives yet.</p>
                  <p className="text-muted-foreground">Go to the Dashboard to create your first objective.</p>
                </div>
              ) : (
                objectives.map(objective => (
                  <div key={objective.id} className="mb-8 w-full">
                    <h2 className="text-2xl font-bold mb-4 gradient-text">{objective.name}</h2>
                    <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm w-full">
                      <div className="w-full">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-semibold w-[40%]">Initiative</TableHead>
                              <TableHead className="font-semibold w-[30%]">Progress</TableHead>
                              <TableHead className="font-semibold w-[30%]">Confidence Level</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {objective.initiatives
                              .filter(initiative => !initiative.deleted)
                              .map(initiative => (
                                <TableRow key={initiative.id}>
                                  <TableCell className="font-medium">{initiative.name}</TableCell>
                                  <TableCell>
                                    <Select
                                      value={initiativeStatus[initiative.id]}
                                      onValueChange={(value) => setInitiativeStatus({
                                        ...initiativeStatus,
                                        [initiative.id]: value
                                      })}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select progress" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="not-started">Not Started</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="blocked">Blocked</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={initiativeConfidence[initiative.id]}
                                      onValueChange={(value) => setInitiativeConfidence({
                                        ...initiativeConfidence,
                                        [initiative.id]: value
                                      })}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="1-9" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(value => (
                                          <SelectItem key={value} value={value.toString()}>
                                            {value}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
              ))
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-center">
            <Button 
              size="lg" 
              onClick={handleSubmitCheckIn}
              disabled={
                Object.keys(keyResultValues).length === 0 && 
                Object.keys(initiativeStatus).length === 0
              }
            >
              Submit Check-in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
