import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Clock, FileText, Activity, Trash2, XCircle, Edit2, Filter, Calendar, Plus, Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Chatbot from './Chatbot';
import api from '../api';

const UserDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
    const [editingTicketId, setEditingTicketId] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        urgency: 'medium',
        submitter: user?.email || ''
    });
    const [status, setStatus] = useState('idle');

    // Filter State
    const [filterYear, setFilterYear] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterUrgency, setFilterUrgency] = useState('all');

    // History State (Mock Data)
    const [tickets, setTickets] = useState([
        {
            id: 'TKT-101',
            subject: 'VPN Connection Failed',
            status: 'open',
            urgency: 'high',
            date: '2023-11-28',
            category: 'Network',
            description: 'Unable to connect to VPN server.'
        },
        {
            id: 'TKT-098',
            subject: 'Software Installation Request',
            status: 'resolved',
            urgency: 'low',
            date: '2023-11-25',
            category: 'Software',
            description: 'Need VS Code installed.'
        },
        {
            id: 'TKT-105',
            subject: 'Email Sync Issue',
            status: 'pending',
            urgency: 'medium',
            date: '2023-10-15',
            category: 'Software',
            description: 'Outlook not syncing.'
        },
        {
            id: 'TKT-106',
            subject: 'System Crash',
            status: 'open',
            urgency: 'critical',
            date: new Date().toISOString().split('T')[0], // Today
            category: 'Hardware',
            description: 'Blue screen of death.'
        }
    ]);

    // Load tickets from backend on mount
    useEffect(() => {
        let mounted = true;

        const loadTickets = async () => {
            try {
                const res = await api.get('/tickets/me');
                const serverTickets = res.data || [];

                const mapped = serverTickets.map((t) => ({
                    id: t.ticketId,
                    subject: t.subject || 'No subject',
                    status: t.status || 'open',
                    // backend returns `priority` and may not return `urgency` in list items
                    urgency: t.urgency || (t.priority ? t.priority.toLowerCase() : 'medium'),
                    date: t.createdAt ? t.createdAt.split('T')[0] : (t.date || new Date().toISOString().split('T')[0]),
                    category: t.category || 'General',
                    description: t.description || '',
                }));

                if (mounted) setTickets(mapped);
            } catch (err) {
                // if unauthorized or network error, keep using local mock data
                console.error('Failed to load tickets:', err);
            }
        };

        loadTickets();

        return () => { mounted = false };
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            if (editingTicketId) {
                // Backend does not expose a user-update endpoint; update locally for now
                setTickets(tickets.map(ticket =>
                    ticket.id === editingTicketId
                        ? { ...ticket, subject: formData.subject, description: formData.description, urgency: formData.urgency }
                        : ticket
                ));

                setStatus('success');
                setTimeout(() => {
                    setStatus('idle');
                    setFormData({ ...formData, subject: '', description: '', urgency: 'medium' });
                    setEditingTicketId(null);
                    setActiveTab('history');
                }, 1000);

            } else {
                // Create ticket on backend
                const payload = {
                    subject: formData.subject,
                    description: formData.description,
                    urgency: formData.urgency,
                    category: formData.category || null,
                };

                const res = await api.post('/tickets', payload);
                const created = res.data;

                const newTicket = {
                    id: created.ticketId,
                    subject: created.subject,
                    status: created.status || 'open',
                    urgency: created.urgency || (created.priority ? created.priority.toLowerCase() : 'medium'),
                    date: created.createdAt ? created.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
                    category: created.category || 'General',
                    description: created.description || '',
                };

                setTickets([newTicket, ...tickets]);
                setStatus('success');

                setTimeout(() => {
                    setStatus('idle');
                    setFormData({ ...formData, subject: '', description: '', urgency: 'medium' });
                    setActiveTab('history');
                }, 1000);
            }
        } catch (err) {
            console.error('Failed to submit ticket:', err);
            setStatus('idle');
            alert('Failed to submit ticket. Please try again.');
        }
    };

    const handleEdit = (ticket) => {
        setEditingTicketId(ticket.id);
        setFormData({
            subject: ticket.subject,
            description: ticket.description || '',
            urgency: ticket.urgency,
            submitter: user?.email || ''
        });
        setActiveTab('new');
    };

    const handleCancelEdit = () => {
        setEditingTicketId(null);
        setFormData({ ...formData, subject: '', description: '', urgency: 'medium' });
    };

    const handleWithdraw = (id) => {
        if (window.confirm('Are you sure you want to withdraw this ticket?')) {
            setTickets(tickets.map(ticket =>
                ticket.id === id ? { ...ticket, status: 'withdrawn' } : ticket
            ));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to permanently delete this ticket?')) {
            setTickets(tickets.filter(ticket => ticket.id !== id));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-50 text-blue-700 border border-blue-100';
            case 'resolved': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-100';
            case 'withdrawn': return 'bg-slate-50 text-slate-500 border border-slate-100 line-through';
            default: return 'bg-slate-50 text-slate-700 border border-slate-100';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'text-rose-600 font-bold';
            case 'high': return 'text-orange-600 font-medium';
            case 'medium': return 'text-indigo-600';
            case 'low': return 'text-slate-500';
            default: return 'text-slate-500';
        }
    };

    const handleNotificationClick = () => {
        setShowNotifications(false);
        setActiveTab('history');
    };

    // Filter Logic
    const filteredTickets = tickets.filter(ticket => {
        const matchesUrgency = filterUrgency === 'all' || ticket.urgency === filterUrgency;

        const ticketYear = ticket.date.split('-')[0];
        const ticketMonth = ticket.date.split('-')[1];

        const matchesYear = filterYear === '' || ticketYear === filterYear;
        const matchesMonth = filterMonth === '' || ticketMonth === filterMonth;

        return matchesUrgency && matchesYear && matchesMonth;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.name || 'User'}</h1>
                        <p className="text-slate-500 mt-1 text-lg">Manage your support requests and track their status.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative"
                            >
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                            </button>

                            {/* User Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-900">Notifications</h3>
                                        <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:text-indigo-800">Mark all read</span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {[
                                            { id: 1, text: 'Ticket #TKT-101 has been resolved.', time: '2 mins ago', type: 'success' },
                                            { id: 2, text: 'Admin commented on #TKT-105.', time: '1 hour ago', type: 'info' },
                                            { id: 3, text: 'Ticket #TKT-098 status updated to Pending.', time: '3 hours ago', type: 'warning' }
                                        ].map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={handleNotificationClick}
                                                className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3"
                                            >
                                                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${notif.type === 'success' ? 'bg-emerald-500' :
                                                    notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                                    }`}></div>
                                                <div>
                                                    <p className="text-sm text-slate-700 leading-snug">{notif.text}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <span className="text-sm font-medium text-slate-500">Current Date:</span>
                        <span className="px-3 py-1 bg-white rounded-full border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
                            {new Date().toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Navigation & Stats */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                                <h3 className="font-bold text-lg">Actions</h3>
                                <p className="text-indigo-100 text-sm opacity-90">What would you like to do?</p>
                            </div>
                            <div className="p-4 space-y-2">
                                <button
                                    onClick={() => { setActiveTab('new'); handleCancelEdit(); }}
                                    className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${activeTab === 'new'
                                        ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm ring-1 ring-indigo-200'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg mr-3 ${activeTab === 'new' ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <span>New Ticket</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${activeTab === 'history'
                                        ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm ring-1 ring-indigo-200'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg mr-3 ${activeTab === 'history' ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <span>History</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                                <Activity className="w-5 h-5 text-indigo-500 mr-2" />
                                Overview
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                    <div className="text-2xl font-bold text-blue-700">{tickets.filter(t => t.status === 'open').length}</div>
                                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mt-1">Open</div>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                    <div className="text-2xl font-bold text-emerald-700">{tickets.filter(t => t.status === 'resolved').length}</div>
                                    <div className="text-xs text-emerald-600 font-medium uppercase tracking-wide mt-1">Resolved</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Main Content */}
                    <div className="lg:col-span-9">
                        {activeTab === 'new' ? (
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">
                                                {editingTicketId ? 'Edit Ticket' : 'Submit a Ticket'}
                                            </h2>
                                            <p className="text-slate-500 mt-1">
                                                {editingTicketId ? `Updating Ticket #${editingTicketId}` : 'Tell us what you need help with.'}
                                            </p>
                                        </div>
                                        {editingTicketId && (
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="p-8">
                                    {status === 'success' ? (
                                        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center animate-fade-in">
                                            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                            <span className="font-medium">{editingTicketId ? 'Ticket updated successfully!' : 'Ticket submitted successfully!'}</span>
                                        </div>
                                    ) : null}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                                placeholder="Briefly summarize the issue"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700">Description</label>
                                            <textarea
                                                required
                                                rows="6"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                                                placeholder="Provide detailed information about the problem..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700">Urgency Level</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                                                    value={formData.urgency}
                                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                                >
                                                    <option value="low">Low - Routine Query</option>
                                                    <option value="medium">Medium - Standard Issue</option>
                                                    <option value="high">High - Blocking Work</option>
                                                    <option value="critical">Critical - System Down</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500">
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={status === 'submitting'}
                                                className={`w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 ${status === 'submitting'
                                                    ? 'bg-indigo-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
                                                    }`}
                                            >
                                                {status === 'submitting' ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    <>
                                                        <Send className="w-5 h-5 mr-2" />
                                                        {editingTicketId ? 'Update Ticket' : 'Submit Ticket'}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
                                <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <h2 className="text-xl font-bold text-slate-900">Ticket History</h2>

                                    {/* Filters */}
                                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                        <div className="relative group">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                                            <select
                                                className="pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none shadow-sm hover:border-slate-300 transition-all"
                                                value={filterYear}
                                                onChange={(e) => setFilterYear(e.target.value)}
                                            >
                                                <option value="">Year</option>
                                                <option value="2023">2023</option>
                                                <option value="2024">2024</option>
                                                <option value="2025">2025</option>
                                            </select>
                                        </div>
                                        <div className="relative group">
                                            <select
                                                className="pl-4 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none shadow-sm hover:border-slate-300 transition-all"
                                                value={filterMonth}
                                                onChange={(e) => setFilterMonth(e.target.value)}
                                            >
                                                <option value="">Month</option>
                                                <option value="01">January</option>
                                                <option value="02">February</option>
                                                <option value="03">March</option>
                                                <option value="04">April</option>
                                                <option value="05">May</option>
                                                <option value="06">June</option>
                                                <option value="07">July</option>
                                                <option value="08">August</option>
                                                <option value="09">September</option>
                                                <option value="10">October</option>
                                                <option value="11">November</option>
                                                <option value="12">December</option>
                                            </select>
                                        </div>
                                        <div className="relative group">
                                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                                            <select
                                                className="pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none shadow-sm hover:border-slate-300 transition-all"
                                                value={filterUrgency}
                                                onChange={(e) => setFilterUrgency(e.target.value)}
                                            >
                                                <option value="all">All Urgency</option>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
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
                                                <th className="px-6 py-4">Urgency</th>
                                                <th className="px-6 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredTickets.length > 0 ? (
                                                filteredTickets.map((ticket) => (
                                                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-start">
                                                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mr-3 mt-1">
                                                                    <FileText className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900">{ticket.subject}</p>
                                                                    <p className="text-xs text-slate-500 mt-0.5">{ticket.id} • {ticket.date}</p>
                                                                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{ticket.description}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                                                {ticket.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-xs uppercase tracking-wide ${getPriorityColor(ticket.urgency)}`}>
                                                                {ticket.urgency}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleEdit(ticket)}
                                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                    title="Edit Ticket"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                {ticket.status === 'open' && (
                                                                    <button
                                                                        onClick={() => handleWithdraw(ticket.id)}
                                                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                                        title="Withdraw Ticket"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDelete(ticket.id)}
                                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                                    title="Delete Ticket"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                                                <Search className="w-6 h-6 text-slate-400" />
                                                            </div>
                                                            <p className="font-medium">No tickets found</p>
                                                            <p className="text-sm mt-1">Try adjusting your filters</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Chatbot />
        </div>
    );
};

export default UserDashboard;