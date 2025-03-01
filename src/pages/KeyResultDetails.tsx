import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { KeyResult, KeyResultCheckIn } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { format } from "date-fns";

const KeyResultDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [keyResult, setKeyResult] = useState<KeyResult | null>(null);
  const [checkIns, setCheckIns] = useState<KeyResultCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
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

  const getChartData = () => {
    if (!checkIns.length) return [];

    // Sort check-ins by date (ascending)
    const sortedCheckIns = [...checkIns].sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    );

    // Start with initial value
    const chartData = keyResult?.startingValue !== undefined ? [
      {
        date: format(keyResult.startDate, "MMM d"),
        value: keyResult.startingValue,
        confidence: null
      }
    ] : [];

    // Add check-in data points
    sortedCheckIns.forEach(checkIn => {
      chartData.push({
        date: format(checkIn.date, "MMM d"),
        value: checkIn.currentValue,
        confidence: checkIn.confidenceLevel
      });
    });

    return chartData;
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
        <h1 className="text-3xl font-bold">{keyResult?.name}</h1>
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
              <p>{keyResult?.description || "No description provided."}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
              <p>
                {keyResult && format(keyResult.startDate, "MMM d, yyyy")} - {keyResult && format(keyResult.endDate, "MMM d, yyyy")}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Starting Value</h3>
                <p className="text-lg font-medium">{keyResult?.startingValue}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Goal Value</h3>
                <p className="text-lg font-medium">{keyResult?.goalValue}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Value</h3>
                <p className="text-lg font-medium">
                  {keyResult?.currentValue !== undefined ? keyResult.currentValue : "Not set"}
                </p>
              </div>
            </div>
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
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="value" 
                    name="Value" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="confidence" 
                    name="Confidence" 
                    stroke="#82ca9d" 
                    connectNulls
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
                  <TableHead>Value</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell>{format(checkIn.date, "MMM d, yyyy")}</TableCell>
                    <TableCell>{checkIn.currentValue}</TableCell>
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

export default KeyResultDetails;
