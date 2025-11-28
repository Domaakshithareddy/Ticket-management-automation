import React, { useEffect, useState } from "react";
import api from "../api";
import { Shield, Loader2, Edit, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [updateData, setUpdateData] = useState({
    priority: "",
    status: "",
    adminSuggestion: "",
  });

  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  const loadAll = async () => {
    try {
      const res = await api.get("/tickets/");
      setTickets(res.data);
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const startEdit = (t) => {
    setEditingId(t.ticketId);
    setUpdateData({
      priority: t.priority,
      status: t.status,
      adminSuggestion: t.adminSuggestion || "",
    });
  };

  const saveUpdate = async () => {
    try {
      await api.patch(`/tickets/${editingId}/admin-update`, updateData);
      setEditingId(null);
      loadAll();
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 text-transparent bg-clip-text">
          Admin Dashboard
        </h1>

        <button
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {tickets.map((t) => (
            <div
              key={t.ticketId}
              className="p-6 bg-white/10 border border-white/10 rounded-2xl backdrop-blur-xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{t.subject}</h3>
                <Shield className="text-purple-300" />
              </div>

              <p className="text-blue-200/70 mb-3">{t.description}</p>

              <p className="text-sm text-blue-200/50 mb-1">
                <strong>User:</strong> {t.userId}
              </p>

              {editingId === t.ticketId ? (
                <div className="space-y-3 bg-white/5 p-4 rounded-lg border border-white/10">

                  <div>
                    <label className="text-sm">Priority</label>
                    <select
                      value={updateData.priority}
                      onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                      className="w-full p-2 text-black rounded"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm">Status</label>
                    <select
                      value={updateData.status}
                      onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                      className="w-full p-2 text-black rounded"
                    >
                      <option>open</option>
                      <option>in_progress</option>
                      <option>resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm">Admin Suggestion</label>
                    <textarea
                      value={updateData.adminSuggestion}
                      onChange={(e) =>
                        setUpdateData({ ...updateData, adminSuggestion: e.target.value })
                      }
                      className="w-full p-2 text-black rounded"
                    />
                  </div>

                  <button
                    onClick={saveUpdate}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                  >
                    <CheckCircle className="w-5" />
                    Save Update
                  </button>

                </div>
              ) : (
                <button
                  onClick={() => startEdit(t)}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2"
                >
                  <Edit className="w-5" />
                  Edit Ticket
                </button>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
