import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';

interface FlowItem {
  _id: string;
  time: string;
  activity: string;
  instructions: {
    media?: string;
    sounds?: string;
    general?: string;
  };
  bgm: string;
}

interface ServiceFlowData {
  _id: string;
  date: string;
  title: string;
  flow: FlowItem[];
  specialInstructions: {
    toSoundsTeam: string[];
    toMediaTeam: string[];
    general: string[];
  };
  status: string;
}

const ServiceFlow: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [serviceFlow, setServiceFlow] = useState<ServiceFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentServiceFlow();
  }, []);

  const fetchCurrentServiceFlow = async () => {
    try {
      setLoading(true);
      // Use mock data for upcoming service
      const mockServiceFlow: ServiceFlowData = {
        _id: 'service-1',
        date: '2025-10-27',
        title: 'Sunday Service',
        flow: [
          {
            _id: 'flow-1',
            time: '9:20',
            activity: 'Team briefing',
            instructions: {
              general: 'All team members gather for briefing'
            },
            bgm: 'none'
          },
          {
            _id: 'flow-2',
            time: '9:25',
            activity: 'Countdown display',
            instructions: {
              general: 'Display countdown timer and prepare worship music'
            },
            bgm: 'none'
          },
          {
            _id: 'flow-3',
            time: '9:30',
            activity: 'Worship',
            instructions: {
              general: 'Begin worship session with appropriate volume'
            },
            bgm: 'worship'
          },
          {
            _id: 'flow-4',
            time: '10:00',
            activity: 'Instrumental music (Worship team transition)',
            instructions: {
              general: 'Continue BGM during transition, keep worship slides ready'
            },
            bgm: 'instrumental'
          },
          {
            _id: 'flow-5',
            time: '10:05',
            activity: 'SR/PRAYER',
            instructions: {
              general: 'Continue BGM, display offering/tithes slides'
            },
            bgm: 'instrumental'
          },
          {
            _id: 'flow-6',
            time: '10:15',
            activity: 'Announcements',
            instructions: {
              general: 'Prepare announcement slides, adjust BGM volume'
            },
            bgm: 'announcement'
          },
          {
            _id: 'flow-7',
            time: '10:25',
            activity: 'Special Announcements',
            instructions: {
              general: 'Display special announcement slides, start repentance music'
            },
            bgm: 'repentance'
          },
          {
            _id: 'flow-8',
            time: '10:30',
            activity: 'Newcomers Welcome',
            instructions: {
              general: 'If any newcomers, display welcome slide with low background music'
            },
            bgm: 'instrumental'
          },
          {
            _id: 'flow-9',
            time: '10:35',
            activity: 'Sermon',
            instructions: {
              general: 'Be attentive with sermon content and coordinate music changes'
            },
            bgm: 'instrumental'
          }
        ],
        specialInstructions: {
          toSoundsTeam: [
            'Any shifts of increase and decrease of volume, do it gradually',
            'Coordinate with media person in every change of music'
          ],
          toMediaTeam: [
            'Make sure the shift from one segment to another should be around 3.5-4 seconds',
            'Coordinate with sounds team in change of every music'
          ],
          general: [
            'Arrive 30 minutes before service for setup',
            'Test all equipment before service begins'
          ]
        },
        status: 'active'
      };
      setServiceFlow(mockServiceFlow);
    } catch (error) {
      setError('Failed to fetch service flow');
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const isToday = date.toDateString() === new Date().toDateString();
    const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBgmColor = (bgm: string) => {
    switch (bgm) {
      case 'worship': return 'bg-blue-100 text-blue-800';
      case 'instrumental': return 'bg-green-100 text-green-800';
      case 'announcement': return 'bg-yellow-100 text-yellow-800';
      case 'repentance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      active: true,
      onClick: () => navigate('/service-flow')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white px-4 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Flow</h1>
            {serviceFlow && (
              <p className="text-gray-500 mt-1">
                Service flow for {getFormattedDate(serviceFlow.date)}
              </p>
            )}
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
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {serviceFlow && (
          <div className="space-y-6">
            {/* Service Flow Timeline */}
            <div className="space-y-4">
              {serviceFlow.flow.map((item, index) => {
                const instruction = item.instructions.general;

                return (
                  <div key={item._id} className="bg-white rounded-2xl p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm font-bold">
                          {item.time}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">{item.activity}</h3>
                        
                        {instruction && (
                          <p className="text-gray-700 text-sm mb-3">{instruction}</p>
                        )}
                        
                        {item.bgm !== 'none' && (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getBgmColor(item.bgm)}`}>
                            🎵 {item.bgm.charAt(0).toUpperCase() + item.bgm.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Special Instructions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Special Instructions</h3>

              {serviceFlow.specialInstructions.toSoundsTeam.length > 0 && (
                <div className="bg-yellow-100 rounded-3xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">🎵 To Sounds Team:</h4>
                  <ul className="space-y-2">
                    {serviceFlow.specialInstructions.toSoundsTeam.map((instruction, index) => (
                      <li key={index} className="text-gray-700 text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {serviceFlow.specialInstructions.toMediaTeam.length > 0 && (
                <div className="bg-blue-100 rounded-3xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">📹 To Media Team:</h4>
                  <ul className="space-y-2">
                    {serviceFlow.specialInstructions.toMediaTeam.map((instruction, index) => (
                      <li key={index} className="text-gray-700 text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {serviceFlow.specialInstructions.general.length > 0 && (
                <div className="bg-gray-100 rounded-3xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">General Instructions:</h4>
                  <ul className="space-y-2">
                    {serviceFlow.specialInstructions.general.map((instruction, index) => (
                      <li key={index} className="text-gray-700 text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              
              <button className="w-full bg-white rounded-2xl p-4 flex items-center justify-between hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-lg p-3 text-white text-xl mr-4">
                    ⏰
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Set Service Reminders</h4>
                    <p className="text-sm text-gray-500">Get notified before each segment</p>
                  </div>
                </div>
                <div className="text-gray-400 text-lg">→</div>
              </button>

              <button className="w-full bg-white rounded-2xl p-4 flex items-center justify-between hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-purple-500 rounded-lg p-3 text-white text-xl mr-4">
                    📤
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Share Flow</h4>
                    <p className="text-sm text-gray-500">Send to team members</p>
                  </div>
                </div>
                <div className="text-gray-400 text-lg">→</div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation items={navItems} />
    </div>
  );
};

export default ServiceFlow;