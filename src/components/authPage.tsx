import { useState } from 'react';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface AuthPageProps {
    onLogin: (username: string, email: string) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
    // Toggle between login and registration 
    const [isLogin, setIsLogin] = useState(true);
    
    // Login states 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // Registration states 
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) { // Handle login 
            // Just log in immediately with whatever was typed 
            // Will need to be changed when dealing with auth with backend
            onLogin(email.split("@")[0] || "User", email);
            console.log("Login with:", { email, password });
        } else { // Handle registration 
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
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
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                    >
                        {isLogin ? "Login" : "Register"}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-primary hover:text-primary/80"
                    >
                        {isLogin
                            ? "Don't have an account? Register"
                            : "Already have an account? Login"}
                    </button>
                </div>
            </Card>
        </div>
    )
}