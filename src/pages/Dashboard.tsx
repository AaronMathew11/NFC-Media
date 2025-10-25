import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      active: true,
      onClick: () => navigate('/dashboard')
    },
    {
      id: 'team',
      label: 'Team',
      onClick: () => navigate('/media-roster')
    },
    {
      id: 'church',
      label: 'Members',
      onClick: () => navigate('/church-members')
    },
    {
      id: 'schedule',
      label: 'Flow',
      onClick: () => navigate('/service-flow')
    }
  ];


  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    };
    return today.toLocaleDateString('en-US', options);
  };


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white px-4 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, {user?.name || 'Aaron Mathew'}
            </h1>
            <p className="text-gray-500 mt-1">Today {getCurrentDate()}</p>
          </div>
          <button
            onClick={logout}
            className="bg-gray-100 p-2 rounded-full"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>


      {/* Main Content */}
      <main className="px-4 pb-24">
        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Access
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Emergency Contacts */}
            <button 
              onClick={() => navigate('/emergency-contacts')}
              className="bg-white rounded-2xl p-4 hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-sm text-gray-900">Emergency</h3>
                <p className="text-xs text-gray-600">Contacts</p>
              </div>
            </button>

            {/* Lyrics Generator */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="font-bold text-sm text-gray-900">Lyrics Generator</h3>
                <p className="text-xs text-gray-600">38+ files</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation items={navItems} />
    </div>
  );
};

export default Dashboard;