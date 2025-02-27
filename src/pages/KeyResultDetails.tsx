
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { KeyResult } from "@/lib/types";
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
  const [isLoading, setIsLoading] = useState(true);
  const [keyResult, setKeyResult] = useState<KeyResult | null>(null);
  const [checkIns, setCheckIns] = useState<KeyResultCheckIn[]>([]);
  
  useEffect(() => {
    if (id) {
      fetchKeyResultDetails(id);
    }
  }, [id]);

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading key result details...</div>
      </div>
    );
  }

  if (!keyResult) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Key Result not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">{keyResult.name}</h1>
        <p className="text-muted-foreground max-w-2xl">{keyResult.description}</p>
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
    </div>
  );
};

export default KeyResultDetails;
