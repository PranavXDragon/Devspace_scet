import { useOutletContext } from "react-router-dom";
import { Award } from "lucide-react";

export default function StudentCertificates() {
  const { dashboardData: data } = useOutletContext();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Award className="w-6 h-6 text-accent" />
          My Certificates
        </h1>
        <p className="text-text-text-muted mt-1">View and download your event certificates.</p>
      </div>

      {data.certificates.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center text-text-text-muted shadow-sm">
          You don't have any certificates yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.certificates.map((cert) => (
            <div key={cert.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-text">{cert.eventName}</h3>
                  <p className="text-sm font-medium text-text mt-1">{cert.position}</p>
                  <p className="text-xs text-text-text-muted mt-1">{new Date(cert.eventDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-amber-500/10 text-amber-500 p-2 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <button
                onClick={() => window.open(`/verify-certificate/${cert.certificateId}`, "_blank")}
                className="w-full py-2.5 bg-card-hover border border-border hover:bg-border/50 text-text text-sm font-medium rounded-lg transition-colors"
              >
                View Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
