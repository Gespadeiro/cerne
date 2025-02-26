
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Initiative } from "@/lib/types";
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
type InitiativeCheckIn = {
  date: string;
  status: string;
  confidence: number;
  notes?: string;
}

const InitiativeDetails = () => {
  const { id } = useParams();
  
  // Temporary mock data - replace with actual data fetching
  const [initiative] = useState<Initiative>({
    id: "1",
    name: "Sample Initiative",
    description: "This is a sample initiative description",
    objectiveId: "obj1",
    startDate: new Date(),
    endDate: new Date(),
    deleted: false,
    completed: false
  });

  const [checkIns] = useState<InitiativeCheckIn[]>([
    { date: "2024-01-01", status: "Not Started", confidence: 5, notes: "Initial planning phase" },
    { date: "2024-01-08", status: "In Progress", confidence: 7, notes: "Started implementation" },
    { date: "2024-01-15", status: "In Progress", confidence: 8, notes: "Good progress" },
    { date: "2024-01-22", status: "In Progress", confidence: 6, notes: "Some challenges" },
    { date: "2024-01-29", status: "Completed", confidence: 9, notes: "Successfully completed" },
  ]);

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">{initiative.name}</h1>
        <p className="text-muted-foreground max-w-2xl">{initiative.description}</p>
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
              <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={2} />
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
              <TableHead>Confidence</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkIns.map((checkIn, index) => (
              <TableRow key={index}>
                <TableCell>{checkIn.date}</TableCell>
                <TableCell>{checkIn.status}</TableCell>
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

export default InitiativeDetails;
