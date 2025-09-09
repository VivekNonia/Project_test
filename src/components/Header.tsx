import React from 'react';
import { View } from '../types';
import { WaterDropIcon } from './Icons';

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ view, setView }) => {
  const handleToggle = () => {
    setView(view === 'citizen' ? 'official' : 'citizen');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <WaterDropIcon className="h-8 w-8 text-brand-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Jal Shakti <span className="text-brand-blue-600">Sahayak</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-600">
            {view === 'citizen' ? 'Citizen View' : 'Official View'}
          </span>
          <label htmlFor="view-toggle" className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="view-toggle" className="sr-only peer" checked={view === 'official'} onChange={handleToggle} />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue-600"></div>
          </label>
        </div>
      </div>
    </header>
  );
};

export default Header;