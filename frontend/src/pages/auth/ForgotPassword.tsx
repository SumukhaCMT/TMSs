import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/axios/axios";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
 
    const res = await api.post("/auth/forgot-password", { email }).catch(err => err.response);
    
    setLoading(false);

    if (res?.status === 200) {
      setSent(true); 
      toast.success("Reset link sent to your email");
    } else {
      toast.error(res?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-gray-50/50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border">
        {sent ? (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-green-600">Check your inbox</h1>
            <p className="text-muted-foreground">
              We have sent a password reset link to <strong>{email}</strong>.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              Try another email
            </Button>
            <Link to="/login" className="block text-sm text-primary hover:underline mt-4">
              Back to Login
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <Button className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                  <ArrowLeft className="mr-2 h-3 w-3" /> Back to login
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}