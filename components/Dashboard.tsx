
import React, { useMemo } from 'react';
import { Grievance, GrievanceCategory, GrievanceStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartIcon, DocumentIcon, CheckCircleIcon, ClockIcon } from './Icons';

interface DashboardProps {
  grievances: Grievance[];
}

const Dashboard: React.FC<DashboardProps> = ({ grievances }) => {

  const stats = useMemo(() => {
    const total = grievances.length;
    const open = grievances.filter(g => g.status === GrievanceStatus.OPEN).length;
    const inProgress = grievances.filter(g => g.status === GrievanceStatus.IN_PROGRESS).length;
    const resolved = grievances.filter(g => g.status === GrievanceStatus.RESOLVED || g.status === GrievanceStatus.CLOSED).length;
    return { total, open, inProgress, resolved };
  }, [grievances]);

  const categoryData = useMemo(() => {
    const counts = grievances.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {} as Record<GrievanceCategory, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, count: value }));
  }, [grievances]);

  const getStatusColor = (status: GrievanceStatus) => {
    switch(status) {
        case GrievanceStatus.OPEN: return 'bg-red-100 text-red-800';
        case GrievanceStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
        case GrievanceStatus.RESOLVED: return 'bg-green-100 text-green-800';
        case GrievanceStatus.CLOSED: return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  }

  const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Grievance Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<DocumentIcon className="h-6 w-6 text-blue-600"/>} title="Total Grievances" value={stats.total} color="bg-blue-100" />
          <StatCard icon={<ClockIcon className="h-6 w-6 text-red-600"/>} title="Open" value={stats.open} color="bg-red-100" />
          <StatCard icon={<ChartIcon className="h-6 w-6 text-yellow-600"/>} title="In Progress" value={stats.inProgress} color="bg-yellow-100" />
          <StatCard icon={<CheckCircleIcon className="h-6 w-6 text-green-600"/>} title="Resolved/Closed" value={stats.resolved} color="bg-green-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Grievances by Category</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={categoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-25} textAnchor="end" height={70} interval={0} fontSize={12} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 p-6">Recent Grievances</h3>
            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {grievances.slice(0, 10).map((g) => (
                            <tr key={g.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{g.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate" title={g.summary}>{g.summary}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(g.status)}`}>
                                        {g.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
