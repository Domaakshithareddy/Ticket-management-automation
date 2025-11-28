import React, { useState, useEffect } from 'react';
import {
    Activity, CheckCircle, Clock, AlertTriangle, Search, Filter,
    Edit2, Save, X, LayoutDashboard, Ticket, Users,
    Bell, ChevronRight, AlertOctagon, MoreVertical, Trash2, UserPlus, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTicketId, setEditingTicketId] = useState(null);
    const [newUrgency, setNewUrgency] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showNotifications, setShowNotifications] = useState(false);

    // User Management State
    const [editingUserId, setEditingUserId] = useState(null);
    const [newUserRole, setNewUserRole] = useState('');
    const [newUserStatus, setNewUserStatus] = useState('');

    // Add User Modal State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({
        name: '',
        email: '',
        role: 'User',
        status: 'Active'
    });

    // Load tickets from backend for admin
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const res = await api.get('/tickets');
                const docs = res.data || [];

                const mapped = docs.map((d) => ({
                    id: d.ticketId,
                    subject: d.subject,
                    description: d.description,
                    urgency: (d.urgency || d.priority || 'medium').toLowerCase(),
                    category: d.category,
                    status: d.status === 'in_progress' ? 'pending' : d.status,
                    timestamp: d.createdAt ? new Date(d.createdAt).toLocaleString() : '—',
                    user: d.userId || d.company || 'User'
                }));

                if (mounted) setTickets(mapped);
            } catch (err) {
                console.error('Failed to load admin tickets, falling back to mock data', err);
                // keep existing mock data if present
            }
        };

        load();

        return () => { mounted = false };
    }, []);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-rose-100 text-rose-800 border border-rose-200';
            case 'high': return 'bg-orange-100 text-orange-800 border border-orange-200';
            case 'medium': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
            case 'low': return 'bg-slate-100 text-slate-800 border border-slate-200';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    // Ticket Editing Handlers
    const handleEditClick = (ticket) => {
        setEditingTicketId(ticket.id);
        setNewUrgency(ticket.urgency);
    };

    const handleSaveUrgency = async (id) => {
        // Persist admin urgency update to backend
        try {
            const payload = { urgency: newUrgency };
            const res = await api.patch(`/tickets/${id}/admin-update`, payload);
            const updated = res.data;

            setTickets(tickets.map(t => t.id === id ? {
                ...t,
                urgency: (updated.urgency || updated.priority || 'medium').toString().toLowerCase(),
                status: updated.status === 'in_progress' ? 'pending' : updated.status
            } : t));
        } catch (err) {
            console.error('Failed to save urgency:', err);
            alert('Failed to save changes.');
        } finally {
            setEditingTicketId(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingTicketId(null);
    };

    // User Management Handlers
    const handleEditUserClick = (user) => {
        setEditingUserId(user.id);
        setNewUserRole(user.role);
        setNewUserStatus(user.status);
    };

    const handleSaveUser = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, role: newUserRole, status: newUserStatus } : u));
        setEditingUserId(null);
    };

    const handleCancelUserEdit = () => {
        setEditingUserId(null);
    };

    const handleDeleteUser = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    // Add User Handlers
    const handleAddUserSubmit = (e) => {
        e.preventDefault();
        const newUser = {
            id: users.length + 1,
            ...newUserData
        };
        setUsers([...users, newUser]);
        setIsAddUserModalOpen(false);
        setNewUserData({ name: '', email: '', role: 'User', status: 'Active' });
    };

    const handleNotificationClick = (ticketId) => {
        setShowNotifications(false);
        setActiveTab('tickets');
        setSearchQuery(ticketId);
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filter === 'all' || ticket.status === filter;
        const matchesPriority = priorityFilter === 'all' || ticket.urgency === priorityFilter;
        const matchesSearch =
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesPriority && matchesSearch;
    }).sort((a, b) => {
        const statusOrder = { 'open': 1, 'pending': 2, 'resolved': 3 };
        return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
    });

    const criticalTickets = tickets.filter(t => ['critical', 'high'].includes(t.urgency) && t.status !== 'resolved');

    // Reusable Ticket Table Component
    const TicketTable = ({ tickets }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">Tickets</h3>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <select
                            className="text-sm bg-white border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">Status</option>
                            <option value="open">Open</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <select
                            className="text-sm bg-white border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="all">Priority</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Ticket Details</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 mr-4 shadow-sm">
                                            {ticket.user?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{ticket.subject}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{ticket.id} • {ticket.timestamp}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                                        ${ticket.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {editingTicketId === ticket.id ? (
                                        <select
                                            value={newUrgency}
                                            onChange={(e) => setNewUrgency(e.target.value)}
                                            className="text-xs border-slate-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    ) : (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.urgency)} capitalize`}>
                                            {ticket.urgency}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {editingTicketId === ticket.id ? (
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleSaveUrgency(ticket.id)} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 p-1 rounded"><Save className="w-4 h-4" /></button>
                                            <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded"><X className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEditClick(ticket)}
                                            className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                            <button
                                onClick={() => setIsAddUserModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add User
                            </button>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold mr-4 shadow-sm">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingUserId === user.id ? (
                                                    <select
                                                        value={newUserRole}
                                                        onChange={(e) => setNewUserRole(e.target.value)}
                                                        className="text-xs border-slate-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    >
                                                        <option value="User">User</option>
                                                        <option value="Admin">Admin</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'Admin' ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                                        {user.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingUserId === user.id ? (
                                                    <select
                                                        value={newUserStatus}
                                                        onChange={(e) => setNewUserStatus(e.target.value)}
                                                        className="text-xs border-slate-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    >
                                                        <option value="Active">Active</option>
                                                        <option value="Inactive">Inactive</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                        {user.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingUserId === user.id ? (
                                                    <div className="flex items-center space-x-2">
                                                        <button onClick={() => handleSaveUser(user.id)} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 p-1 rounded"><Save className="w-4 h-4" /></button>
                                                        <button onClick={handleCancelUserEdit} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded"><X className="w-4 h-4" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditUserClick(user)}
                                                            className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 p-1.5 rounded-lg transition-colors"
                                                            title="Edit User"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-rose-400 hover:text-rose-600 bg-rose-50 p-1.5 rounded-lg transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'tickets':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-900">All Tickets</h2>
                        <TicketTable tickets={filteredTickets} />
                    </div>
                );
            case 'dashboard':
            default:
                return (
                    <div className="space-y-8 animate-fade-in">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Tickets', value: tickets.length, icon: Ticket, color: 'blue', bg: 'bg-blue-500' },
                                { label: 'Open Issues', value: tickets.filter(t => t.status === 'open').length, icon: AlertTriangle, color: 'orange', bg: 'bg-orange-500' },
                                { label: 'Critical', value: tickets.filter(t => t.urgency === 'critical').length, icon: AlertOctagon, color: 'rose', bg: 'bg-rose-500' },
                                { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle, color: 'emerald', bg: 'bg-emerald-500' },
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all transform hover:-translate-y-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                                        </div>
                                        <div className={`p-3 rounded-xl ${stat.bg} bg-opacity-10 text-${stat.color}-600`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Ticket List */}
                            <div className="lg:col-span-2 space-y-6">
                                <TicketTable tickets={filteredTickets} />
                            </div>

                            {/* Priority Queue (Right Sidebar) */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-slate-900 flex items-center">
                                            <AlertOctagon className="w-5 h-5 text-rose-500 mr-2" />
                                            Priority Queue
                                        </h3>
                                        <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-200">
                                            {criticalTickets.length}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        {criticalTickets.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                                </div>
                                                <p className="text-sm text-slate-500">No critical issues. Good job!</p>
                                            </div>
                                        ) : (
                                            criticalTickets.map(ticket => (
                                                <div key={ticket.id} className="p-4 rounded-xl bg-rose-50 border border-rose-100 hover:shadow-md transition-all cursor-pointer group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-bold text-rose-700 uppercase tracking-wide bg-white px-2 py-0.5 rounded border border-rose-200">{ticket.urgency}</span>
                                                        <span className="text-xs text-rose-400 font-medium">{ticket.timestamp}</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-rose-700 transition-colors">{ticket.subject}</h4>
                                                    <p className="text-xs text-slate-600 line-clamp-2">{ticket.description}</p>
                                                    <div className="mt-3 flex justify-end">
                                                        <button className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center bg-white px-2 py-1 rounded border border-rose-200 hover:border-rose-300 transition-all">
                                                            Resolve Now <ChevronRight className="w-3 h-3 ml-1" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans relative">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col text-slate-300">
                <div className="p-8 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">AutoDesk</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { id: 'tickets', icon: Ticket, label: 'All Tickets' },
                        { id: 'users', icon: Users, label: 'Users' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === item.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-medium'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-900/20 hover:text-rose-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
                        <p className="text-slate-500 text-sm font-medium">Welcome back, Administrator</p>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="relative group">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative focus:outline-none"
                            >
                                <Bell className={`w-6 h-6 ${showNotifications ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`} />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white shadow-sm">
                                    {tickets.filter(t => t.status === 'open').length}
                                </span>
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-900">Notifications</h3>
                                        <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:text-indigo-800">Mark all read</span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {tickets.slice(0, 5).map((ticket, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleNotificationClick(ticket.id)}
                                                className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${ticket.urgency === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                        ticket.urgency === 'high' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                            'bg-blue-50 text-blue-700 border-blue-100'
                                                        }`}>
                                                        {ticket.urgency}
                                                    </span>
                                                    <span className="text-xs text-slate-400">{ticket.timestamp}</span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-900 mb-0.5">New Ticket: {ticket.subject}</p>
                                                <p className="text-xs text-slate-500">From: {ticket.user}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 text-center border-t border-slate-50 bg-slate-50/50">
                                        <button
                                            onClick={() => setActiveTab('tickets')}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                        >
                                            View All Tickets
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900">Admin User</p>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-md overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>

            {/* Add User Modal */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Add New User</h3>
                                <p className="text-sm text-slate-500">Create a new account for the system.</p>
                            </div>
                            <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddUserSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="John Doe"
                                    value={newUserData.name}
                                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="john@example.com"
                                    value={newUserData.email}
                                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                                        value={newUserData.role}
                                        onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                                    >
                                        <option value="User">User</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                                        value={newUserData.status}
                                        onChange={(e) => setNewUserData({ ...newUserData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddUserModalOpen(false)}
                                    className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;