import { useOutletContext } from "react-router-dom";
import { Ticket, QrCode } from "lucide-react";

export default function StudentPasses() {
  const { dashboardData: data } = useOutletContext();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Ticket className="w-6 h-6 text-accent" />
          My Boarding Passes
        </h1>
        <p className="text-text-text-muted mt-1">Access your boarding passes for upcoming events.</p>
      </div>

      {data.boardingPasses.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center text-text-text-muted shadow-sm">
          You don't have any boarding passes yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.boardingPasses.map((pass) => (
            <div key={pass.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-text">{pass.eventName}</h3>
                  <p className="text-xs text-text-text-muted mt-1">{new Date(pass.issuedAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-accent/10 text-accent p-2 rounded-lg">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <button
                onClick={() => window.open(`/verify-boarding-pass/${pass.boardingPassId}`, "_blank")}
                className="w-full py-2.5 bg-card-hover border border-border hover:bg-border/50 text-text text-sm font-medium rounded-lg transition-colors"
              >
                View Pass
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
