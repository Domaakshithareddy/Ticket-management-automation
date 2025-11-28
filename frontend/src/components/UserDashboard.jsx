import React, { useEffect, useState } from "react";
import api from "../api";
import { Ticket, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  open: "text-yellow-400",
  in_progress: "text-blue-400",
  resolved: "text-green-400",
};

const priorityColors = {
  Low: "text-green-300",
  Medium: "text-yellow-300",
  High: "text-orange-400",
  Critical: "text-red-400",
};

const UserDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get("/tickets/me");
        setTickets(res.data);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      }
      setLoading(false);
    };
    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
          My Tickets
        </h1>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-blue-400" />
        </div>
      ) : tickets.length === 0 ? (
        <p className="text-center text-blue-200/70 text-lg">No tickets submitted yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {tickets.map((t) => (
            <div
              key={t.ticketId}
              className="p-6 bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <Ticket className="text-cyan-300" />
                <h3 className="text-xl font-bold">{t.subject}</h3>
              </div>

              <p className="text-blue-200/70 text-sm mb-4">{t.description}</p>

              <div className="flex justify-between text-sm">
                <p className={priorityColors[t.priority] || "text-white/70"}>
                  <strong>Priority:</strong> {t.priority}
                </p>

                <p className={statusColors[t.status] || "text-white/70"}>
                  <strong>Status:</strong> {t.status}
                </p>
              </div>

              <p className="text-blue-200/50 mt-2 text-sm">
                <strong>Urgency:</strong> {t.urgency}
              </p>

              {t.adminSuggestion && (
                <p className="text-green-300 mt-3 text-sm">
                  <strong>Admin Suggestion:</strong> {t.adminSuggestion}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
