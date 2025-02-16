
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
import { format, isValid } from "date-fns";
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
  // This is temporary - in a real app we'd get this from a shared state or backend
  const [objectives] = useState<Objective[]>([]);

  const formatDate = (date: Date) => {
    if (!isValid(date)) return "Invalid date";
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="container mx-auto p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Check-in</h1>
      </div>
      
      <Tabs defaultValue="key-results" className="mt-6">
        <TabsList>
          <TabsTrigger value="key-results">Key Results</TabsTrigger>
          <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
        </TabsList>

        <TabsContent value="key-results" className="space-y-8">
          {objectives
            .filter(obj => !obj.deleted)
            .map(objective => (
              <div key={objective.id} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{objective.name}</h2>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key Result</TableHead>
                        <TableHead>Starting Value</TableHead>
                        <TableHead>Goal Value</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Confidence Level</TableHead>
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
                                className="w-full"
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
                <h2 className="text-2xl font-bold mb-4">{objective.name}</h2>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Initiative</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Confidence Level</TableHead>
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
  );
};

export default CheckIn;
