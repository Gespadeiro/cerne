
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Initiative, InitiativeCheckIn } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { format } from "date-fns";

const InitiativeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [checkIns, setCheckIns] = useState<InitiativeCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
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

  const getProgressStatusLabel = (status: string) => {
    switch(status) {
      case 'not-started': return 'Not Started';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'blocked': return 'Blocked';
      default: return status;
    }
  };

  const getProgressStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'not-started': return 'secondary';
      case 'in-progress': return 'default';
      case 'completed': return 'success';
      case 'blocked': return 'destructive';
      default: return 'default';
    }
  };

  const getChartData = () => {
    if (!checkIns.length) return [];

    // Sort check-ins by date (ascending)
    const sortedCheckIns = [...checkIns].sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    );

    // Create chart data points
    return sortedCheckIns.map(checkIn => ({
      date: format(checkIn.date, "MMM d"),
      progress: checkIn.progress || 0,
      confidence: checkIn.confidenceLevel
    }));
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Details card */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p>{initiative.description || "No description provided."}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
              <p>
                {format(initiative.startDate, "MMM d, yyyy")} - {format(initiative.endDate, "MMM d, yyyy")}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <Badge variant={initiative.completed ? "success" : "secondary"}>
                {initiative.completed ? "Completed" : "In Progress"}
              </Badge>
            </div>

            {initiative.progress !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Progress</h3>
                <p className="text-lg font-medium">{initiative.progress}%</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress chart card */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {checkIns.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="progress" 
                    name="Progress (%)" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="confidence" 
                    name="Confidence" 
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No check-in data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Check-ins history table */}
      <Card>
        <CardHeader>
          <CardTitle>Check-in History</CardTitle>
        </CardHeader>
        <CardContent>
          {checkIns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell>{format(checkIn.date, "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={getProgressStatusBadgeVariant(checkIn.progressStatus)}>
                        {getProgressStatusLabel(checkIn.progressStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>{checkIn.progress !== undefined ? `${checkIn.progress}%` : "-"}</TableCell>
                    <TableCell>{checkIn.confidenceLevel}/10</TableCell>
                    <TableCell>{checkIn.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No check-in history available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InitiativeDetails;
