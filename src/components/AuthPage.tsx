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
    <div className="flex min-h-dvh w-full items-center justify-center overflow-auto bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a0a0f] p-3 sm:p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      <Card className="relative z-10 w-full max-w-[min(24rem,calc(100vw-1.5rem))] bg-card/80 p-4 shadow-xl backdrop-blur-xl border-border sm:p-6 md:max-w-md md:p-8">
        <div className="mb-6 flex flex-col items-center sm:mb-8">
          <h1 className="text-center text-lg text-white sm:text-xl">Galaxy Chat Hub</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
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
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
            className="w-full cursor-pointer rounded bg-primary p-3 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2"
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
            className="cursor-pointer text-sm text-primary hover:text-primary/80"
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
