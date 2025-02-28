
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { KeyResult, Objective } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KeyResultForm } from "@/components/key-result-form";

// Type for key result check-in data
type KeyResultCheckIn = {
  id: string;
  date: string;
  value: number;
  confidence: number;
  notes?: string;
}

const KeyResultDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [keyResult, setKeyResult] = useState<KeyResult | null>(null);
  const [checkIns, setCheckIns] = useState<KeyResultCheckIn[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  
  useEffect(() => {
    if (id) {
      fetchKeyResultDetails(id);
      fetchObjectives();
    }
  }, [id]);

  const fetchObjectives = async () => {
    try {
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('deleted', false);

      if (error) throw error;

      const mappedObjectives: Objective[] = data.map(obj => ({
        id: obj.id,
        name: obj.name,
        description: obj.description || "",
        startDate: new Date(obj.start_date),
        endDate: new Date(obj.end_date),
        checkInFrequency: obj.check_in_frequency,
        deleted: obj.deleted,
        initiatives: [],
        keyResults: [],
        userId: obj.user_id
      }));

      setObjectives(mappedObjectives);
    } catch (error: any) {
      console.error("Error fetching objectives:", error);
    }
  };

  const fetchKeyResultDetails = async (keyResultId: string) => {
    try {
      setIsLoading(true);
      
      // Fetch key result details
      const { data: keyResultData, error: keyResultError } = await supabase
        .from('key_results')
        .select('*')
        .eq('id', keyResultId)
        .eq('deleted', false)
        .single();

      if (keyResultError) throw keyResultError;

      if (!keyResultData) {
        toast({
          title: "Key Result not found",
          description: "The key result you're looking for doesn't exist or has been deleted.",
          variant: "destructive",
        });
        return;
      }

      // Fetch check-ins for this key result
      const { data: checkInsData, error: checkInsError } = await supabase
        .from('key_result_check_ins')
        .select(`
          *,
          check_ins(date)
        `)
        .eq('key_result_id', keyResultId)
        .order('created_at', { ascending: true });

      if (checkInsError) throw checkInsError;

      // Map to our frontend types
      const mappedKeyResult: KeyResult = {
        id: keyResultData.id,
        name: keyResultData.name,
        description: keyResultData.description,
        objectiveId: keyResultData.objective_id,
        startDate: new Date(keyResultData.start_date),
        endDate: new Date(keyResultData.end_date),
        startingValue: Number(keyResultData.starting_value),
        goalValue: Number(keyResultData.goal_value),
        deleted: keyResultData.deleted
      };

      // Map check-ins to our frontend type
      const mappedCheckIns: KeyResultCheckIn[] = checkInsData.map(checkIn => ({
        id: checkIn.id,
        date: format(new Date((checkIn.check_ins as any).date), 'yyyy-MM-dd'),
        value: Number(checkIn.current_value),
        confidence: checkIn.confidence_level,
        notes: checkIn.notes || undefined
      }));

      setKeyResult(mappedKeyResult);
      setCheckIns(mappedCheckIns);
    } catch (error: any) {
      console.error("Error fetching key result details:", error);
      toast({
        title: "Error fetching data",
        description: error.message || "An error occurred while fetching the key result details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!keyResult) return;
    
    try {
      const { error } = await supabase
        .from('key_results')
        .update({ deleted: true })
        .eq('id', keyResult.id);

      if (error) throw error;

      toast({
        title: "Key Result archived",
        description: "The key result has been moved to the archive.",
      });

      navigate('/archive');
    } catch (error: any) {
      console.error("Error archiving key result:", error);
      toast({
        title: "Error",
        description: "Failed to archive key result",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (data: any) => {
    if (!keyResult) return;

    try {
      const { error } = await supabase
        .from('key_results')
        .update({
          name: data.name,
          description: data.description,
          objective_id: data.objectiveId,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
          starting_value: data.startingValue,
          goal_value: data.goalValue,
        })
        .eq('id', keyResult.id);

      if (error) throw error;

      // Update the local state
      setKeyResult({
        ...keyResult,
        name: data.name,
        description: data.description,
        objectiveId: data.objectiveId,
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
      console.error("Error updating key result:", error);
      toast({
        title: "Error updating key result",
        description: error.message || "An error occurred while updating the key result.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading key result details...</div>
      </div>
    );
  }

  if (!keyResult) {
    return (
      <div className="w-full p-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Key Result not found</div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-4">{keyResult?.name}</h1>
          <p className="text-muted-foreground max-w-2xl mb-4">{keyResult?.description}</p>
          <div className="grid grid-cols-2 gap-8 mb-4 w-full max-w-2xl">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Start Date</h3>
              <p>{format(keyResult.startDate, "MMM d, yyyy")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">End Date</h3>
              <p>{format(keyResult.endDate, "MMM d, yyyy")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Starting Value</h3>
              <p>{keyResult.startingValue}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Goal Value</h3>
              <p>{keyResult.goalValue}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => setIsEditDialogOpen(true)}>
              Edit Key Result
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Archive Key Result
            </Button>
          </div>
        </div>
      </div>

      {checkIns.length > 0 ? (
        <>
          <div className="glass-card p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Progress Evolution</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={checkIns}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, Math.max(keyResult.goalValue, ...checkIns.map(c => c.value))]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Confidence Evolution</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={checkIns}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="confidence" stroke="#4ade80" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-6">Check-in History</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell>{checkIn.date}</TableCell>
                    <TableCell>{checkIn.value}</TableCell>
                    <TableCell>{checkIn.confidence}</TableCell>
                    <TableCell>{checkIn.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="glass-card p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">No Check-ins Yet</h2>
          <p className="text-muted-foreground">
            This key result doesn't have any check-ins yet. Go to the Check-in page to add progress updates.
          </p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Key Result</DialogTitle>
          </DialogHeader>
          <KeyResultForm 
            objectives={objectives}
            onSubmit={handleEdit}
            keyResult={keyResult}
            submitButtonText="Update Key Result"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KeyResultDetails;
