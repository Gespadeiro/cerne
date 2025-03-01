
import React from "react";
import { format } from "date-fns";
import { InitiativeCheckIn } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface InitiativeProgressChartProps {
  checkIns: InitiativeCheckIn[];
}

export const InitiativeProgressChart: React.FC<InitiativeProgressChartProps> = ({ checkIns }) => {
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

  return (
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
  );
};
