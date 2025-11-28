import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, LogOut, User } from 'lucide-react';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

const Navigation = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Don't show navigation on login page
    if (location.pathname === '/login') return null;

    return (
        <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    ST
                </div>
                <span className="font-bold text-xl text-gray-900">SmartTicketing</span>
            </div>

            {user && (
                <div className="flex items-center space-x-6">
                    {user.role === 'user' && (
                        <Link
                            to="/"
                            className={`flex items-center space-x-2 text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <Ticket className="w-4 h-4" />
                            <span>My Dashboard</span>
                        </Link>
                    )}

                    {user.role === 'admin' && (
                        <Link
                            to="/admin"
                            className={`flex items-center space-x-2 text-sm font-medium transition-colors ${location.pathname === '/admin' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                        </Link>
                    )}

                    <div className="h-6 w-px bg-gray-200"></div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <span className="font-medium">{user.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
                    <Navigation />
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route
                            path="/"
                            element={
                                <ProtectedRoute requiredRole="user">
                                    <UserDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
