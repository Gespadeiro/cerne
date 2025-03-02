
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

const Auth = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [loginValues, setLoginValues] = useState({ email: "", password: "" });

  // Parse URL query params to check for tab parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam === "signup") {
      setActiveTab("signup");
    }
  }, [location]);

  const handleSignupSuccess = (email: string, password: string) => {
    setLoginValues({ email, password });
    setActiveTab("login");
  };

  return (
    <AuthLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <LoginForm initialValues={loginValues} />
        </TabsContent>
        
        <TabsContent value="signup">
          <SignupForm onSuccess={handleSignupSuccess} />
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
};

export default Auth;
