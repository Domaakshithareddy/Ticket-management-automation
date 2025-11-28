import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from "../api";

const TicketSubmission = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        urgency: 'medium',
        submitter: user?.email || ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error


const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    try {
        await api.post("/tickets/", formData);
        setStatus("success");

        setTimeout(() => {
            setFormData({
                subject: "",
                description: "",
                urgency: "medium",
                submitter: user.email,
            });
            setStatus("idle");
        }, 2000);
    } catch (err) {
        console.error(err);
        setStatus("error");
    }
};

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Submit Support Ticket</h1>
                    <p className="text-gray-500 mt-2">Describe your issue and we'll help you out.</p>
                </div>

                {status === 'success' ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-center mb-6 animate-fade-in">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Ticket submitted successfully!
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g., Cannot access VPN"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Please provide details about the issue..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={formData.urgency}
                            onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        >
                            <option value="low">Low - Routine Query</option>
                            <option value="medium">Medium - Standard Issue</option>
                            <option value="high">High - Blocking Work</option>
                            <option value="critical">Critical - System Down</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${status === 'submitting' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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
                            <span className="flex items-center">
                                <Send className="w-5 h-5 mr-2" />
                                Submit Ticket
                            </span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TicketSubmission;
