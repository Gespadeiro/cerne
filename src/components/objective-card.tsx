import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Initiative, Objective } from "@/lib/types";

interface ObjectiveCardProps {
  objective: Objective;
  onDelete: (id: string) => void;
}

export function ObjectiveCard({ objective, onDelete }: ObjectiveCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{objective.name}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(objective.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{objective.description}</p>
        <div className="mt-4">
          <h4 className="text-sm font-medium">Initiatives</h4>
          <ul className="mt-2 space-y-2">
            {objective.initiatives.map((initiative) => (
              <li
                key={initiative.id}
                className="text-xs text-muted-foreground"
              >
                {initiative.name}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}