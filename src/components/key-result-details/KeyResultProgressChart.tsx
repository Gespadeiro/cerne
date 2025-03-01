
import React from "react";
import { KeyResult, KeyResultCheckIn } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface KeyResultProgressChartProps {
  keyResult: KeyResult;
  checkIns: KeyResultCheckIn[];
}

export const KeyResultProgressChart: React.FC<KeyResultProgressChartProps> = ({ keyResult, checkIns }) => {
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
  );
};
