
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { isToday } from "date-fns";
import { Objective } from "@/lib/types";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  // This is temporary - in a real app we'd get this from a shared state or backend
  const [objectives] = useState<Objective[]>([]);

  const activeObjectives = objectives.filter(obj => !obj.deleted);
  const totalInitiatives = activeObjectives.reduce((acc, obj) => 
    acc + obj.initiatives.filter(i => !i.deleted && !i.completed).length, 0
  );
  const activeKeyResults = activeObjectives.reduce((acc, obj) => 
    acc + obj.keyResults.filter(kr => !kr.deleted).length, 0
  );
  const completedObjectives = objectives.filter(obj => obj.deleted);

  const checkInsToday = objectives.filter(obj => {
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - obj.startDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceStart % obj.checkInFrequency === 0 && isToday(today);
  }).length;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Welcome to Cerne</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card 
          className="cursor-pointer" 
          onClick={() => navigate("/check-in")}
        >
          <CardHeader>
            <CardTitle>Today's Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{checkInsToday}</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer" 
          onClick={() => navigate("/dashboard")}
        >
          <CardHeader>
            <CardTitle>Active OKR's</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeObjectives.length}</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer" 
          onClick={() => navigate("/dashboard")}
        >
          <CardHeader>
            <CardTitle>Active Key Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeKeyResults}</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer" 
          onClick={() => navigate("/dashboard")}
        >
          <CardHeader>
            <CardTitle>Active Initiatives</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalInitiatives}</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer" 
          onClick={() => navigate("/archive")}
        >
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedObjectives.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
