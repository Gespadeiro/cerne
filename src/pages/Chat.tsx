
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SendIcon, Loader2 } from "lucide-react";

const Chat = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("chat-with-gpt", {
        body: { prompt },
      });

      if (error) throw error;

      setResponse(data.generatedText);
    } catch (error: any) {
      console.error("Error calling GPT:", error);
      toast({
        title: "Error getting response",
        description: error.message || "An error occurred while fetching AI response.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">AI Assistant</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ask AI Assistant</CardTitle>
            <CardDescription>
              Get help with OKR planning, goal tracking, and strategy alignment
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <Textarea
                placeholder="Ask me about OKRs, goal setting, or how to track your initiatives..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading || !prompt.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <SendIcon className="mr-2 h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
            <CardDescription>
              Here's what the AI assistant has to say
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] bg-muted/50 p-4 rounded-md">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : response ? (
                <div className="whitespace-pre-wrap">{response}</div>
              ) : (
                <div className="text-muted-foreground flex items-center justify-center h-full">
                  Ask a question to get a response
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
