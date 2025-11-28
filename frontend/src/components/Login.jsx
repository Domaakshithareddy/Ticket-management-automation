import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, User, Shield, Sparkles } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Toggle for Sign In / Sign Up
    const [isSignup, setIsSignup] = useState(false);
    const [selectedRole, setSelectedRole] = useState('user'); // 'user' or 'admin'

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Validation
        if (isSignup && !name.trim()) {
            setError(`${selectedRole === 'admin' ? 'Admin Name' : 'User Name'} is required.`);
            setIsSubmitting(false);
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            setIsSubmitting(false);
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters long and include uppercase, number, and special char.');
            setIsSubmitting(false);
            return;
        }

        try {
            if (isSignup) {
                await signup(name, email, password, selectedRole === "admin" ? "AdminCo" : "UserCo");
                alert("Account created successfully! Please sign in.");
                setIsSignup(false);
                setIsSubmitting(false);
                return;
            }

            const user = await login(email, password);

            if (user.role === "admin") navigate("/admin");
            else navigate("/");

        } catch (err) {
            setError(err.response?.data?.detail || "Authentication failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-900">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-500/20 rounded-full blur-[100px] animate-pulse delay-2000"></div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8 text-center relative overflow-hidden">
                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${selectedRole === 'admin' ? 'from-purple-600 to-pink-600' : 'from-blue-600 to-cyan-600'}`}></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20 shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            {selectedRole === 'admin' ? (
                                <Shield className="w-10 h-10 text-white drop-shadow-lg" />
                            ) : (
                                <Sparkles className="w-10 h-10 text-white drop-shadow-lg" />
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                            {isSignup ? 'Join the Future' : 'Welcome Back'}
                        </h2>
                        <p className="text-blue-100/80 text-sm font-medium">
                            {selectedRole === 'admin' ? 'Secure Admin Portal Access' : 'Intelligent Support Automation'}
                        </p>
                    </div>
                </div>

                <div className="p-8 bg-white/5">
                    {/* Role Toggle */}
                    <div className="flex bg-black/20 p-1.5 rounded-xl mb-8 backdrop-blur-sm">
                        <button
                            type="button"
                            onClick={() => setSelectedRole('user')}
                            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                                selectedRole === 'user'
                                    ? 'bg-white text-blue-600 shadow-lg scale-[1.02]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <User className="w-4 h-4 mr-2" />
                            User
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedRole('admin')}
                            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                                selectedRole === 'admin'
                                    ? 'bg-white text-purple-600 shadow-lg scale-[1.02]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Admin
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start backdrop-blur-md">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-200 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isSignup && (
                            <div className="space-y-2 animate-fade-in-up">
                                <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider ml-1">
                                    {selectedRole === 'admin' ? 'Admin Name' : 'User Name'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
                                isSubmitting
                                    ? 'bg-slate-600 cursor-not-allowed opacity-70'
                                    : selectedRole === 'admin'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                                        : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    Processing...
                                </div>
                            ) : (
                                <>
                                    {isSignup ? 'Create Account' : 'Sign In'}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Switch toggle */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-blue-200/60">
                            {isSignup ? 'Already have an account?' : "Don’t have an account?"}{' '}
                            <button
                                onClick={() => setIsSignup(!isSignup)}
                                className="font-bold text-white hover:underline"
                            >
                                {isSignup ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
