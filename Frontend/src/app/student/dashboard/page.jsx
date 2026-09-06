import { useStudentDashboard } from '../StudentDashboardContext';

export default function StudentDashboard() {
  const { dashboardData: data } = useStudentDashboard();

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-text">Welcome back, {data.profile?.name?.split(' ')[0]}!</h1>
        <p className="text-text-text-muted mt-1">Here's an overview of your student portal.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
        <h2 className="text-lg font-bold text-text mb-4">My Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-text-text-muted font-medium uppercase tracking-wider mb-1">Name</p>
            <p className="font-semibold text-text">{data.profile?.name}</p>
          </div>
          <div>
            <p className="text-xs text-text-text-muted font-medium uppercase tracking-wider mb-1">Student ID</p>
            <p className="font-semibold text-text">{data.profile?.studentId}</p>
          </div>
          <div>
            <p className="text-xs text-text-text-muted font-medium uppercase tracking-wider mb-1">Course</p>
            <p className="font-semibold text-text">{data.profile?.course}</p>
          </div>
          <div>
            <p className="text-xs text-text-text-muted font-medium uppercase tracking-wider mb-1">Year</p>
            <p className="font-semibold text-text">{data.profile?.year}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-text-text-muted font-medium mb-2">Total Registrations</h3>
            <p className="text-3xl font-bold text-text">{data.registrations.length}</p>
        </div>
      </div>
    </div>
  );
}

