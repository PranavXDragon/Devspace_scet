import { useStudentDashboard } from '../StudentDashboardContext';
import { Calendar, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function StudentRegistrations() {
  const { dashboardData: data } = useStudentDashboard();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Calendar className="w-6 h-6 text-accent" />
          Event Registrations
        </h1>
        <p className="text-text-text-muted mt-1">Track the status of your event applications.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {data.registrations.length === 0 ? (
          <div className="p-8 text-center text-text-text-muted">
            You haven't registered for any events yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.registrations.map((reg) => (
              <div key={reg.id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-card-hover/50 transition-colors">
                <div>
                  <h3 className="font-bold text-text mb-1">Event Registration</h3>
                  <p className="text-sm text-text-text-muted">Transaction ID: {reg.transactionId}</p>
                  <p className="text-xs text-text-text-muted mt-1">Applied on: {new Date(reg.created_at).toLocaleDateString()}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 ${
                  reg.status === 'APPROVED' ? 'bg-green-500/10 text-green-600' :
                  reg.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
                  'bg-amber-500/10 text-amber-600'
                }`}>
                  {reg.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> : 
                   reg.status === 'REJECTED' ? <AlertCircle className="w-4 h-4" /> : 
                   <Clock className="w-4 h-4" />}
                  {reg.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

