
import { useState } from "react";
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

// Temporary type for check-in data
type KeyResultCheckIn = {
  date: string;
  value: number;
  confidence: number;
  notes?: string;
}

const KeyResultDetails = () => {
  const { id } = useParams();
  
  // Temporary mock data - replace with actual data fetching
  const [keyResult] = useState<KeyResult>({
    id: "1",
    name: "Sample Key Result",
    description: "This is a sample key result description",
    objectiveId: "obj1",
    startDate: new Date(),
    endDate: new Date(),
    startingValue: 0,
    goalValue: 100,
    deleted: false
  });

  const [checkIns] = useState<KeyResultCheckIn[]>([
    { date: "2024-01-01", value: 0, confidence: 5, notes: "Starting point" },
    { date: "2024-01-08", value: 25, confidence: 7, notes: "Good progress" },
    { date: "2024-01-15", value: 45, confidence: 6, notes: "Slight delay" },
    { date: "2024-01-22", value: 70, confidence: 8, notes: "Back on track" },
    { date: "2024-01-29", value: 90, confidence: 9, notes: "Almost there" },
  ]);

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">{keyResult.name}</h1>
        <p className="text-muted-foreground max-w-2xl">{keyResult.description}</p>
      </div>

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
            {checkIns.map((checkIn, index) => (
              <TableRow key={index}>
                <TableCell>{checkIn.date}</TableCell>
                <TableCell>{checkIn.value}</TableCell>
                <TableCell>{checkIn.confidence}</TableCell>
                <TableCell>{checkIn.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default KeyResultDetails;
