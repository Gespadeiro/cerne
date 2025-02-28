
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Bot, Send, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

const Chat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeySet, setApiKeySet] = useState<boolean | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initial check for API key
    checkApiKey();

    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const checkApiKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: { type: 'checkApiKey' },
      });
      
      if (error) {
        console.error("Error checking API key:", error);
        setApiKeySet(false);
      } else {
        setApiKeySet(true);
      }
    } catch (err) {
      console.error("Error checking API key:", err);
      setApiKeySet(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: { 
          type: 'chat',
          message: userMessage.content
        },
      });

      if (error) throw error;

      if (data && data.suggestions) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.suggestions,
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const welcomeMessage = `
Hello! I'm your OKR assistant. I can help you:

1. Draft objectives aligned with your goals
2. Suggest key results to measure progress
3. Recommend initiatives to achieve your objectives
4. Answer questions about OKR best practices
5. Provide guidance on setting up effective metrics

What would you like help with today?
  `;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-4rem)]">
      <Card className="flex flex-col flex-grow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot size={20} />
            OKR Assistant
          </CardTitle>
          <CardDescription>
            Get AI-powered help with your objectives, key results, and initiatives
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
          {apiKeySet === false && (
            <Alert variant="destructive" className="mx-4 mt-2">
              <AlertDescription>
                OpenAI API key is not configured. Ask your administrator to set up the OPENAI_API_KEY in Supabase Edge Function secrets.
              </AlertDescription>
            </Alert>
          )}
          
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            {messages.length === 0 && (
              <div className="flex items-start gap-3 mb-4">
                <div className="h-8 w-8 rounded-md flex items-center justify-center bg-primary/10">
                  <Bot size={18} className="text-primary" />
                </div>
                <div className="flex-1 px-4 py-2 bg-muted rounded-lg whitespace-pre-line">
                  {welcomeMessage}
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 mb-4 ${
                  message.role === "assistant" ? "" : "justify-end"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-md flex items-center justify-center bg-primary/10">
                    <Bot size={18} className="text-primary" />
                  </div>
                )}
                
                <div
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    message.role === "assistant"
                      ? "bg-muted"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.content}
                </div>
                
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-md flex items-center justify-center bg-primary">
                    <User size={18} className="text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3 mb-4">
                <div className="h-8 w-8 rounded-md flex items-center justify-center bg-primary/10">
                  <Bot size={18} className="text-primary" />
                </div>
                <div className="flex-1 px-4 py-2 bg-muted rounded-lg flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="pt-4">
          <form onSubmit={sendMessage} className="w-full flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow min-h-[60px] max-h-[120px]"
              disabled={isLoading || apiKeySet === false}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-auto" 
              disabled={isLoading || !input.trim() || apiKeySet === false}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Chat;
