import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
// Fix: Import GrievanceStatus to use the enum value.
import { Grievance, View, GrievanceStatus } from './types';
import { INITIAL_GRIEVANCES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<View>('citizen');
  const [grievances, setGrievances] = useState<Grievance[]>(INITIAL_GRIEVANCES);

  const addGrievance = (grievance: Omit<Grievance, 'id' | 'status' | 'submittedAt'>) => {
    const newGrievance: Grievance = {
      ...grievance,
      id: `JSS-${Math.floor(Math.random() * 1000) + 5822}`,
      // Fix: Use GrievanceStatus enum member for type safety.
      status: GrievanceStatus.OPEN,
      submittedAt: new Date(),
    };
    setGrievances(prev => [newGrievance, ...prev]);
    return newGrievance.id;
  };

  const getGrievanceStatus = (id: string): string => {
      const grievance = grievances.find(g => g.id.toLowerCase() === id.toLowerCase());
      if (grievance) {
          return `The status of grievance ID ${grievance.id} is currently '${grievance.status}'. It was submitted for '${grievance.summary}'.`;
      }
      return `Sorry, I could not find a grievance with ID ${id}. Please check the ID and try again.`;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header view={view} setView={setView} />
      <main className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {view === 'citizen' ? (
            <Chatbot addGrievance={addGrievance} getGrievanceStatus={getGrievanceStatus} />
          ) : (
            <Dashboard grievances={grievances} />
          )}
        </div>
      </main>
      <footer className="text-center text-sm text-gray-500 py-4">
        <p>&copy; {new Date().getFullYear()} Ministry of Jal Shakti, Government of India</p>
      </footer>
    </div>
  );
};

export default App;