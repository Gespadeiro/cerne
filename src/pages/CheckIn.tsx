
import { useState } from "react";
import { Objective } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";

const CheckIn = () => {
  // Temporary sample data to verify table display
  const [objectives] = useState<Objective[]>([
    {
      id: "1",
      name: "Sample Objective 1",
      description: "Sample Description",
      startDate: new Date(),
      endDate: new Date(),
      deleted: false,
      checkInFrequency: 7,
      keyResults: [
        {
          id: "kr1",
          name: "Sample Key Result 1",
          description: "KR Description",
          objectiveId: "1",
          startDate: new Date(),
          endDate: new Date(),
          startingValue: 0,
          goalValue: 100,
          deleted: false
        }
      ],
      initiatives: [
        {
          id: "i1",
          name: "Sample Initiative 1",
          description: "Initiative Description",
          objectiveId: "1",
          startDate: new Date(),
          endDate: new Date(),
          deleted: false,
          completed: false
        }
      ]
    }
  ]);

  return (
    <div className="w-full p-6 min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-12 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-4">Progress Check-in</h1>
          <p className="text-muted-foreground max-w-2xl">
            Track your journey, celebrate progress, and stay committed to your goals.
            Regular check-ins help maintain momentum and ensure success.
          </p>
        </div>
        
        <div className="glass-card p-6">
          <Tabs defaultValue="key-results" className="mt-2">
            <TabsList className="w-full flex justify-center mb-6">
              <TabsTrigger value="key-results" className="px-8">Key Results</TabsTrigger>
              <TabsTrigger value="initiatives" className="px-8">Initiatives</TabsTrigger>
            </TabsList>

            <TabsContent value="key-results" className="space-y-8">
              {objectives
                .filter(obj => !obj.deleted)
                .map(objective => (
                  <div key={objective.id} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 gradient-text">{objective.name}</h2>
                    <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold">Key Result</TableHead>
                            <TableHead className="font-semibold">Starting Value</TableHead>
                            <TableHead className="font-semibold">Goal Value</TableHead>
                            <TableHead className="font-semibold">Current Value</TableHead>
                            <TableHead className="font-semibold">Confidence Level</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {objective.keyResults
                            .filter(kr => !kr.deleted)
                            .map(kr => (
                              <TableRow key={kr.id}>
                                <TableCell className="font-medium">{kr.name}</TableCell>
                                <TableCell>{kr.startingValue}</TableCell>
                                <TableCell>{kr.goalValue}</TableCell>
                                <TableCell>
                                  <Input 
                                    type="text" 
                                    placeholder="Enter current value" 
                                    className="w-full bg-background/50"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select>
                                    <SelectTrigger className="w-[100px]">
                                      <SelectValue placeholder="1-9" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(value => (
                                        <SelectItem key={value} value={value.toString()}>
                                          {value}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
              ))}
            </TabsContent>

            <TabsContent value="initiatives" className="space-y-8">
              {objectives
                .filter(obj => !obj.deleted)
                .map(objective => (
                  <div key={objective.id} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 gradient-text">{objective.name}</h2>
                    <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold">Initiative</TableHead>
                            <TableHead className="font-semibold">Progress</TableHead>
                            <TableHead className="font-semibold">Confidence Level</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {objective.initiatives
                            .filter(initiative => !initiative.deleted)
                            .map(initiative => (
                              <TableRow key={initiative.id}>
                                <TableCell className="font-medium">{initiative.name}</TableCell>
                                <TableCell>
                                  <Select>
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="Select progress" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not-started">Not Started</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="blocked">Blocked</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Select>
                                    <SelectTrigger className="w-[100px]">
                                      <SelectValue placeholder="1-9" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(value => (
                                        <SelectItem key={value} value={value.toString()}>
                                          {value}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
