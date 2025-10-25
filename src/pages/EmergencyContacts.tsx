import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';

const EmergencyContacts: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
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

  const emergencyContacts = [
    {
      name: 'Pastor Samuel',
      role: 'Senior Pastor',
      phone: '+918247893456',
      type: 'Spiritual Emergency'
    },
    {
      name: 'Dr. Prakash',
      role: 'Medical Emergency',
      phone: '+919876543210',
      type: 'Medical Emergency'
    },
    {
      name: 'Vikranth',
      role: 'Youth Leader',
      phone: '+917654321098',
      type: 'Youth Emergency'
    },
    {
      name: 'Manu',
      role: 'Facilities Manager',
      phone: '+919123456789',
      type: 'Facility Emergency'
    },
    {
      name: 'Church Office',
      role: 'Main Office',
      phone: '+918765432109',
      type: 'General Inquiries'
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Header */}
      <header className="bg-white px-4 py-6 border-b" style={{ borderColor: '#E5E5EA' }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: '#1C1C1E' }}>Emergency Contacts</h1>
            <p className="mt-1" style={{ color: '#8E8E93', fontSize: '15px' }}>Quick access to important contacts</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-full"
            style={{ backgroundColor: '#F2F2F7' }}
          >
            <svg className="w-6 h-6" style={{ color: '#8E8E93' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-3 pb-24">
        <div className="space-y-3">
          {emergencyContacts.map((contact, index) => (
            <a 
              key={index}
              href={`tel:${contact.phone}`} 
              className="bg-white rounded-xl block transition-all duration-200 hover:scale-[0.98] no-underline"
              style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', textDecoration: 'none' }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: '#E5E5EA' }}>
                      <span style={{ color: '#8E8E93', fontSize: '14px', fontWeight: '500' }}>
                        {getInitials(contact.name)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: '#1C1C1E', fontSize: '18px' }}>{contact.name}</h3>
                      <p className="text-sm" style={{ color: '#8E8E93' }}>{contact.role}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F2F2F7', color: '#8E8E93' }}>
                          {contact.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium" style={{ color: '#1C1C1E' }}>
                      {contact.phone}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1C1C1E' }}>
                      <svg className="w-4 h-4" style={{ color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-xl p-4" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: '#E5E5EA' }}>
              <svg className="w-4 h-4" style={{ color: '#8E8E93' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold" style={{ color: '#1C1C1E', fontSize: '16px' }}>Instructions</h3>
          </div>
          <div className="space-y-2">
            {[
              'Tap any contact to call immediately',
              'Use Pastor Samuel for spiritual emergencies',
              'Call Dr. Prakash for medical emergencies',
              'Contact Vikranth for youth-related issues',
              'Reach Manu for facility or technical problems'
            ].map((instruction, index) => (
              <div key={index} className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: '#8E8E93' }}></div>
                <p className="text-sm" style={{ color: '#8E8E93' }}>{instruction}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation items={navItems} />
    </div>
  );
};

export default EmergencyContacts;