import { useState } from "react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { API_URL } from "../config";

interface AuthPageProps {
  onLogin: (username: string, email: string) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setFirstName("");
    setLastName("");
    setConfirmPassword("");
    setError(null);
    setSuccessMessage(null);
  };

  // Toggle between login and registration
  const [isLogin, setIsLogin] = useState(true);

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration states
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const AUTH_URL = `${API_URL}/api/auth`;

    try {
      if (isLogin) {
        // Handle Login
        const response = await fetch(`${AUTH_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Store token
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        // Notify parent
        onLogin(data.data.user.username, data.data.user.email);
      } else {
        // Handle Registration
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match!");
        }

        const response = await fetch(`${AUTH_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            email,
            password,
            firstName,
            lastName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }
        setIsLogin(true);
        resetForm();
        setSuccessMessage("Account created successfully. You can now log in.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a0a0f] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]"></div>
      </div>

      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-xl border-border relative z-10">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-white">Galaxy Chat Hub</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded mb-4 text-sm text-center">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Conditional form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin ? (
            <>
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input-background border-input text-white placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-input-background border-input text-white placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-input-background border-input text-white placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input-background border-input text-white placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input-background border-input text-white placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-input-background border-input text-white placeholder:text-muted-foreground"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input-background border-input text-white placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input-background border-input text-white placeholder:text-muted-foreground"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              resetForm();
            }}
            className="text-sm text-primary hover:text-primary/80 cursor-pointer"
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </Card>
    </div>
  );
}
