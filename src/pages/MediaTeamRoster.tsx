import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';

interface MediaTeamRosterData {
  _id: string;
  week: string;
  startDate: string;
  endDate: string;
  assignments: {
    media: string;
    sounds: string[];
  };
  status: string;
}

interface ChurchResponsibility {
  _id: string;
  date: string;
  saturdayMorningCleanup: string;
  speaker: string;
  scriptureReading: string;
  worshipLead: string;
  announcements: string;
  food: string;
  formattedDate: string;
  isUpcoming: boolean;
}

const MediaTeamRoster: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [roster, setRoster] = useState<MediaTeamRosterData | null>(null);
  const [churchResponsibilities, setChurchResponsibilities] = useState<ChurchResponsibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'media' | 'church'>('media');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [copiedEvent, setCopiedEvent] = useState<string | null>(null);
  const itemsPerPage = 5;
  // Force recompilation

  // Sort responsibilities cyclically from nearest upcoming date
  const sortResponsibilitiesCyclically = (data: ChurchResponsibility[]) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Convert each responsibility to have next occurrence date
    const withNextOccurrence = data.map(responsibility => {
      const originalDate = new Date(responsibility.date);
      const month = originalDate.getMonth();
      const day = originalDate.getDate();
      
      // Create this year's occurrence
      let nextOccurrence = new Date(currentYear, month, day);
      
      // If this year's date has passed, use next year
      if (nextOccurrence < today) {
        nextOccurrence = new Date(currentYear + 1, month, day);
      }
      
      return {
        ...responsibility,
        nextOccurrence,
        daysDifference: Math.ceil((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      };
    });
    
    // Sort by next occurrence date (cyclically)
    return withNextOccurrence
      .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime())
      .map(({ nextOccurrence, daysDifference, ...responsibility }) => responsibility);
  };

  useEffect(() => {
    fetchCurrentRoster();
    fetchChurchResponsibilities();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCurrentRoster = async () => {
    try {
      setLoading(true);
      // Use mock data instead of API call
      const mockRoster: MediaTeamRosterData = {
        _id: 'roster-1',
        week: 'Week 43',
        startDate: '2025-10-21',
        endDate: '2025-10-27',
        assignments: {
          media: 'Joel',
          sounds: ['Richard', 'Nophina']
        },
        status: 'active'
      };
      setRoster(mockRoster);
    } catch (error) {
      setError('Failed to fetch media team roster');
    } finally {
      setLoading(false);
    }
  };

  const fetchChurchResponsibilities = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://nfc-media-app.web.app/api';
      const response = await fetch(`${API_URL}/responsibilities`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Sort responsibilities cyclically from nearest upcoming date
        const sortedData = sortResponsibilitiesCyclically(data.data);
        setChurchResponsibilities(sortedData);
        setTotalCount(data.count || data.data.length);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching church responsibilities:', error);
      setError('Failed to fetch church responsibilities');
      setChurchResponsibilities([]);
      setTotalCount(0);
    }
  };

  const getFormattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    
    // Add ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
    const getOrdinalSuffix = (num: number) => {
      if (num >= 11 && num <= 13) return 'th';
      switch (num % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${month} ${day}${getOrdinalSuffix(day)}`;
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Generate WhatsApp message for responsibilities
  const generateWhatsAppMessage = (responsibility: ChurchResponsibility) => {
    let message = `Good Evening everyone 🙌🏽\n\nA Gentle Reminder on this week's responsibilities\n\n`;
    
    // Main responsibilities
    if (responsibility.worshipLead) {
      message += `Worship : ${responsibility.worshipLead}\n`;
    }
    if (responsibility.speaker) {
      message += `Word : ${responsibility.speaker}\n`;
    }
    if (responsibility.scriptureReading) {
      message += `Prayer &Scripture Reading : ${responsibility.scriptureReading}\n`;
    }
    if (responsibility.announcements) {
      message += `Announcements : ${responsibility.announcements}\n`;
    }
    
    message += `\nOther responsibilities \n`;
    
    if (responsibility.saturdayMorningCleanup) {
      message += `Clean up : ${responsibility.saturdayMorningCleanup}\n`;
    }
    if (responsibility.food) {
      message += `Food : ${responsibility.food}\n`;
    }
    
    message += `\nPls consider sharing PPT's by Friday evening \n\nThank you 😄`;
    
    return message;
  };

  // Copy message to clipboard
  const copyMessage = async (responsibility: ChurchResponsibility) => {
    const message = generateWhatsAppMessage(responsibility);
    const eventKey = responsibility._id;
    
    try {
      await navigator.clipboard.writeText(message);
      setCopiedEvent(eventKey);
      setTimeout(() => setCopiedEvent(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedEvent(eventKey);
      setTimeout(() => setCopiedEvent(null), 2000);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResponsibilities = churchResponsibilities.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
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
      active: true,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roster...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Team Roster</h1>
            <p className="text-gray-500 mt-1">This week's assignments</p>
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

      {/* Tab Navigation */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-2 flex">
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'media'
                ? 'bg-gray-800 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
Media Team
          </button>
          <button
            onClick={() => setActiveTab('church')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'church'
                ? 'bg-gray-800 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
Church
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 pb-24">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

{/* Media Team Tab Content */}
        {activeTab === 'media' && roster && (
          <div className="space-y-6">
            {/* Week Info */}
            <div className="bg-white rounded-3xl p-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Week {roster.week}</h2>
                <p className="text-gray-500">
                  {getFormattedDate(roster.startDate)} - {getFormattedDate(roster.endDate)}
                </p>
              </div>
            </div>

            {/* Media Assignment */}
            <div className="bg-gray-800 rounded-3xl p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full mr-4 flex items-center justify-center" style={{ backgroundColor: '#E5E5EA' }}>
                  <svg className="w-6 h-6" style={{ color: '#8E8E93' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Media</h3>
                  <p className="text-2xl font-bold mt-2">{roster.assignments.media}</p>
                </div>
              </div>
              <p className="text-sm opacity-80">
                Responsible for slides, displays, and visual media during service
              </p>
            </div>

            {/* Sounds Assignment */}
            <div className="bg-gray-800 rounded-3xl p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full mr-4 flex items-center justify-center" style={{ backgroundColor: '#E5E5EA' }}>
                  <svg className="w-6 h-6" style={{ color: '#8E8E93' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6 10a2 2 0 012-2h1l7-4v16l-7-4H8a2 2 0 01-2-2V10z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">Sounds</h3>
                  <div className="space-y-2">
                    {roster.assignments.sounds.map((person, index) => (
                      <div key={index} className="text-xl font-bold">
                        {person}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm opacity-80">
                Manage audio levels, microphones, and background music
              </p>
            </div>

            {/* Team Instructions */}
            <div className="bg-yellow-100 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Team Instructions</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Arrive 30 minutes before service for setup</p>
                <p>• Check all equipment before service begins</p>
                <p>• Coordinate with worship team for smooth transitions</p>
                <p>• Have backup slides ready for any technical issues</p>
              </div>
            </div>
          </div>
        )}

        {/* Church Responsibilities Tab Content */}
        {activeTab === 'church' && (
          <div className="space-y-4">
            {churchResponsibilities.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-medium mb-2 text-gray-900 text-lg">No Upcoming Responsibilities</h3>
                <p className="text-gray-500">Church responsibilities will appear here once synced from Google Sheets.</p>
              </div>
            ) : (
              <>
                {/* Pagination Info */}
                <div className="flex justify-between items-center mb-3 mx-2">
                  <p style={{ color: '#8E8E93', fontSize: '14px' }}>
                    Showing {startIndex + 1}-{Math.min(endIndex, totalCount)} of {totalCount}
                  </p>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F2F2F7', color: '#1C1C1E' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <div className="space-y-3">
                  {currentResponsibilities.map((responsibility) => (
                    <div key={responsibility._id} className="bg-white rounded-xl" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                      <div className="p-4">
                        {/* Header with Date and Copy Button */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold mb-1" style={{ color: '#1C1C1E', fontSize: '20px' }}>
                              {formatDate(responsibility.date)}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#F2F2F7', color: '#8E8E93' }}>
                                Service Day
                              </span>
                              {(() => {
                                const today = new Date();
                                const currentYear = today.getFullYear();
                                const originalDate = new Date(responsibility.date);
                                let nextOccurrence = new Date(currentYear, originalDate.getMonth(), originalDate.getDate());
                                if (nextOccurrence < today) {
                                  nextOccurrence = new Date(currentYear + 1, originalDate.getMonth(), originalDate.getDate());
                                }
                                const daysUntil = Math.ceil((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                
                                if (daysUntil === 0) {
                                  return (
                                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#FF2D9215', color: '#FF2D92' }}>
                                      Today!
                                    </span>
                                  );
                                } else if (daysUntil === 1) {
                                  return (
                                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#FF2D9215', color: '#FF2D92' }}>
                                      Tomorrow
                                    </span>
                                  );
                                } else if (daysUntil <= 7) {
                                  return (
                                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#FF2D9215', color: '#FF2D92' }}>
                                      {daysUntil} days
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#F2F2F7', color: '#8E8E93' }}>
                                      {daysUntil} days
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                          <button
                            onClick={() => copyMessage(responsibility)}
                            className="px-4 py-2 rounded-full font-medium transition-all duration-200"
                            style={{
                              backgroundColor: copiedEvent === responsibility._id ? '#34C759' : '#1C1C1E',
                              color: 'white',
                              fontSize: '14px'
                            }}
                          >
                            {copiedEvent === responsibility._id ? 'Copied!' : 'Copy'}
                          </button>
                        </div>

                        {/* Responsibilities Grid */}
                        <div className="space-y-3">
                          {[
                            { label: 'Saturday Cleanup', value: responsibility.saturdayMorningCleanup },
                            { label: 'Speaker', value: responsibility.speaker },
                            { label: 'Scripture Reading', value: responsibility.scriptureReading },
                            { label: 'Worship Lead', value: responsibility.worshipLead },
                            { label: 'Announcements', value: responsibility.announcements },
                            { label: 'Food', value: responsibility.food }
                          ].map((item, index) => (
                            item.value && (
                              <div key={index} className="flex items-center py-1">
                                <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: '#E5E5EA' }}>
                                  <span style={{ color: '#8E8E93', fontSize: '14px', fontWeight: '500' }}>
                                    {getInitials(item.value)}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium" style={{ color: '#1C1C1E', fontSize: '16px' }}>{item.value}</p>
                                  <p className="text-sm" style={{ color: '#8E8E93' }}>{item.label}</p>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 px-2">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={goToPrevious}
                        disabled={currentPage === 1}
                        className="flex items-center px-3 py-2 rounded-full font-medium transition-all duration-200 text-sm"
                        style={{
                          backgroundColor: currentPage === 1 ? '#F2F2F7' : '#1C1C1E',
                          color: currentPage === 1 ? '#8E8E93' : 'white',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ← Prev
                      </button>
                      
                      <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#F2F2F7', color: '#1C1C1E' }}>
                        {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        onClick={goToNext}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-3 py-2 rounded-full font-medium transition-all duration-200 text-sm"
                        style={{
                          backgroundColor: currentPage === totalPages ? '#F2F2F7' : '#1C1C1E',
                          color: currentPage === totalPages ? '#8E8E93' : 'white',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation items={navItems} />
    </div>
  );
};

export default MediaTeamRoster;