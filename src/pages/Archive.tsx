
import { ObjectivesTable } from "@/components/objectives-table";
import { Objective, Initiative, KeyResult } from "@/lib/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Undo2, Trash2 } from "lucide-react";

const Archive = () => {
  const [archivedObjectives, setArchivedObjectives] = useState<Objective[]>([]);
  const [archivedInitiatives, setArchivedInitiatives] = useState<Initiative[]>([]);
  const [archivedKeyResults, setArchivedKeyResults] = useState<KeyResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchArchivedItems();
  }, []);

  const fetchArchivedItems = async () => {
    try {
      setIsLoading(true);
      
      // Fetch archived objectives
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('objectives')
        .select('*, initiatives (*), key_results (*)')
        .eq('deleted', true);

      if (objectivesError) throw objectivesError;

      // Fetch archived initiatives
      const { data: initiativesData, error: initiativesError } = await supabase
        .from('initiatives')
        .select('*')
        .eq('deleted', true);

      if (initiativesError) throw initiativesError;

      // Fetch archived key results
      const { data: keyResultsData, error: keyResultsError } = await supabase
        .from('key_results')
        .select('*')
        .eq('deleted', true);

      if (keyResultsError) throw keyResultsError;

      // Map data to frontend types
      const mappedObjectives: Objective[] = objectivesData.map(obj => ({
        id: obj.id,
        name: obj.name,
        description: obj.description,
        startDate: new Date(obj.start_date),
        endDate: new Date(obj.end_date),
        deleted: obj.deleted,
        checkInFrequency: obj.check_in_frequency,
        initiatives: obj.initiatives,
        keyResults: obj.key_results,
        userId: obj.user_id
      }));

      const mappedInitiatives: Initiative[] = initiativesData.map(init => ({
        id: init.id,
        name: init.name,
        description: init.description,
        objectiveId: init.objective_id,
        startDate: new Date(init.start_date),
        endDate: new Date(init.end_date),
        deleted: init.deleted,
        completed: init.completed
      }));

      const mappedKeyResults: KeyResult[] = keyResultsData.map(kr => ({
        id: kr.id,
        name: kr.name,
        description: kr.description,
        objectiveId: kr.objective_id,
        startDate: new Date(kr.start_date),
        endDate: new Date(kr.end_date),
        startingValue: Number(kr.starting_value),
        goalValue: Number(kr.goal_value),
        deleted: kr.deleted
      }));

      setArchivedObjectives(mappedObjectives);
      setArchivedInitiatives(mappedInitiatives);
      setArchivedKeyResults(mappedKeyResults);
    } catch (error: any) {
      console.error("Error fetching archived items:", error);
      toast({
        title: "Error",
        description: "Failed to load archived items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (type: 'objective' | 'initiative' | 'keyResult', id: string) => {
    try {
      const { error } = await supabase
        .from(type === 'keyResult' ? 'key_results' : type + 's')
        .update({ deleted: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Restored",
        description: `${type} has been restored successfully.`,
      });

      fetchArchivedItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to restore ${type}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (type: 'objective' | 'initiative' | 'keyResult', id: string) => {
    try {
      const { error } = await supabase
        .from(type === 'keyResult' ? 'key_results' : type + 's')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: `${type} has been permanently deleted.`,
      });

      fetchArchivedItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete ${type}`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading archived items...</div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Archive</h1>
        <Tabs defaultValue="objectives" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="objectives">Objectives</TabsTrigger>
            <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
            <TabsTrigger value="keyResults">Key Results</TabsTrigger>
          </TabsList>

          <TabsContent value="objectives">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedObjectives.map((objective) => (
                    <TableRow key={objective.id}>
                      <TableCell>{objective.name}</TableCell>
                      <TableCell>{objective.description}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore('objective', objective.id)}
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('objective', objective.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="initiatives">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedInitiatives.map((initiative) => (
                    <TableRow key={initiative.id}>
                      <TableCell>{initiative.name}</TableCell>
                      <TableCell>{initiative.description}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore('initiative', initiative.id)}
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('initiative', initiative.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="keyResults">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedKeyResults.map((keyResult) => (
                    <TableRow key={keyResult.id}>
                      <TableCell>{keyResult.name}</TableCell>
                      <TableCell>{keyResult.description}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore('keyResult', keyResult.id)}
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('keyResult', keyResult.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Archive;

