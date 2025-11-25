import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"teacher" | "student">("student");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(loginEmail, loginPassword)) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (register(registerName, registerEmail, registerPassword, registerRole)) {
      toast.success(
        registerRole === "teacher" 
          ? "Registration successful! Waiting for admin approval." 
          : "Registration successful!"
      );
      navigate("/dashboard");
    } else {
      toast.error("Email already exists. Please use a different email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Counselling Portal</CardTitle>
          <CardDescription>Connect students with teachers for academic guidance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Register
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <div className="text-sm text-muted-foreground space-y-1 pt-2">
                  <p className="font-semibold">Demo Accounts:</p>
                  <p>Admin: admin@portal.com / admin123</p>
                  <p>Teacher: sarah.j@portal.com / teacher123</p>
                  <p>Student: alice.c@student.com / student123</p>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Register as</Label>
                  <RadioGroup value={registerRole} onValueChange={(value: "teacher" | "student") => setRegisterRole(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="font-normal cursor-pointer">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="teacher" id="teacher" />
                      <Label htmlFor="teacher" className="font-normal cursor-pointer">Teacher</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full">
                  Register
                </Button>
                {registerRole === "teacher" && (
                  <p className="text-xs text-muted-foreground text-center">
                    Teacher accounts require admin approval before access is granted.
                  </p>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
