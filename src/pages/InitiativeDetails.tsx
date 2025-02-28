
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Initiative, Objective } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InitiativeForm } from "@/components/initiative-form";

// Type for initiative check-in data
type InitiativeCheckIn = {
  id: string;
  date: string;
  status: string;
  percentage: number;
  confidence: number;
  notes?: string;
}

const InitiativeDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [checkIns, setCheckIns] = useState<InitiativeCheckIn[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  
  useEffect(() => {
    if (id) {
      fetchInitiativeDetails(id);
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

  const fetchInitiativeDetails = async (initiativeId: string) => {
    try {
      setIsLoading(true);
      
      // Fetch initiative details
      const { data: initiativeData, error: initiativeError } = await supabase
        .from('initiatives')
        .select('*')
        .eq('id', initiativeId)
        .eq('deleted', false)
        .single();

      if (initiativeError) throw initiativeError;

      if (!initiativeData) {
        toast({
          title: "Initiative not found",
          description: "The initiative you're looking for doesn't exist or has been deleted.",
          variant: "destructive",
        });
        return;
      }

      // Fetch check-ins for this initiative
      const { data: checkInsData, error: checkInsError } = await supabase
        .from('initiative_check_ins')
        .select(`
          *,
          check_ins(date)
        `)
        .eq('initiative_id', initiativeId)
        .order('created_at', { ascending: true });

      if (checkInsError) throw checkInsError;

      // Map to our frontend types
      const mappedInitiative: Initiative = {
        id: initiativeData.id,
        name: initiativeData.name,
        description: initiativeData.description,
        objectiveId: initiativeData.objective_id,
        startDate: new Date(initiativeData.start_date),
        endDate: new Date(initiativeData.end_date),
        deleted: initiativeData.deleted,
        completed: initiativeData.completed
      };

      // Map check-ins to our frontend type
      const mappedCheckIns: InitiativeCheckIn[] = checkInsData.map(checkIn => ({
        id: checkIn.id,
        date: format(new Date((checkIn.check_ins as any).date), 'yyyy-MM-dd'),
        status: checkIn.progress_status,
        percentage: Number(checkIn.progress_percentage || 0),
        confidence: checkIn.confidence_level,
        notes: checkIn.notes || undefined
      }));

      setInitiative(mappedInitiative);
      setCheckIns(mappedCheckIns);
    } catch (error: any) {
      console.error("Error fetching initiative details:", error);
      toast({
        title: "Error fetching data",
        description: error.message || "An error occurred while fetching the initiative details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initiative) return;
    
    try {
      const { error } = await supabase
        .from('initiatives')
        .update({ deleted: true })
        .eq('id', initiative.id);

      if (error) throw error;

      toast({
        title: "Initiative archived",
        description: "The initiative has been moved to the archive.",
      });

      navigate('/archive');
    } catch (error: any) {
      console.error("Error archiving initiative:", error);
      toast({
        title: "Error",
        description: "Failed to archive initiative",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (data: any) => {
    if (!initiative) return;

    try {
      const { error } = await supabase
        .from('initiatives')
        .update({
          name: data.name,
          description: data.description,
          objective_id: data.objectiveId,
          start_date: new Date(data.startDate).toISOString(),
          end_date: new Date(data.endDate).toISOString(),
        })
        .eq('id', initiative.id);

      if (error) throw error;

      // Update the local state
      setInitiative({
        ...initiative,
        name: data.name,
        description: data.description,
        objectiveId: data.objectiveId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });

      setIsEditDialogOpen(false);
      
      toast({
        title: "Initiative updated",
        description: "Your initiative has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating initiative:", error);
      toast({
        title: "Error updating initiative",
        description: error.message || "An error occurred while updating the initiative.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading initiative details...</div>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="w-full p-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Initiative not found</div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-4">{initiative.name}</h1>
          <p className="text-muted-foreground max-w-2xl mb-4">{initiative.description}</p>
          <div className="grid grid-cols-2 gap-8 mb-4 w-full max-w-2xl">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Start Date</h3>
              <p>{format(initiative.startDate, "MMM d, yyyy")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">End Date</h3>
              <p>{format(initiative.endDate, "MMM d, yyyy")}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
              <p>{initiative.completed ? "Completed" : "In Progress"}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => setIsEditDialogOpen(true)}>
              Edit Initiative
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Archive Initiative
            </Button>
          </div>
        </div>
      </div>

      {checkIns.length > 0 ? (
        <>
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
                  <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Progress Percentage</h2>
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
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percentage" stroke="#4ade80" strokeWidth={2} />
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
                  <TableHead>Status</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell>{checkIn.date}</TableCell>
                    <TableCell>{checkIn.status}</TableCell>
                    <TableCell>{checkIn.percentage}%</TableCell>
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
            This initiative doesn't have any check-ins yet. Go to the Check-in page to add progress updates.
          </p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Initiative</DialogTitle>
          </DialogHeader>
          <InitiativeForm 
            objectives={objectives}
            onSubmit={handleEdit}
            initiative={initiative}
            submitButtonText="Update Initiative"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InitiativeDetails;
