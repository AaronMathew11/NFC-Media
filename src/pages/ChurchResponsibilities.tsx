import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

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

const ChurchResponsibilities: React.FC = () => {
  const navigate = useNavigate();
  const [responsibilities, setResponsibilities] = useState<ChurchResponsibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [copiedEvent, setCopiedEvent] = useState<string | null>(null);
  const itemsPerPage = 5;


  useEffect(() => {
    fetchResponsibilities();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchResponsibilities = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'https://nfc-media-app.web.app/api';
      const response = await fetch(`${API_URL}/responsibilities`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Sort responsibilities cyclically from nearest upcoming date
        const sortedData = sortResponsibilitiesCyclically(data.data);
        setResponsibilities(sortedData);
        setTotalCount(data.count || data.data.length);
      } else {
        throw new Error('Invalid response format');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching responsibilities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch responsibilities');
      setResponsibilities([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
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

  // Pagination logic
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResponsibilities = responsibilities.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      label: 'Responsibilities',
      active: true,
      onClick: () => navigate('/church-responsibilities')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F2F2F7' }}>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#007AFF' }}></div>
            <p style={{ color: '#8E8E93', fontSize: '17px' }}>Loading responsibilities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F7' }}>
      <header className="bg-white px-4 py-6 border-b" style={{ borderColor: '#E5E5EA' }}>
        <h1 className="text-2xl font-semibold" style={{ color: '#1C1C1E' }}>Responsibilities</h1>
        <p className="mt-1" style={{ color: '#8E8E93', fontSize: '15px' }}>Upcoming service assignments</p>
      </header>

      <main className="px-4 py-3 pb-24">
        {error ? (
          <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: '#FFEBEE', borderColor: '#F8BBD9', borderWidth: '1px' }}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" style={{ color: '#D32F2F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium" style={{ color: '#D32F2F', fontSize: '17px' }}>Error loading responsibilities</h3>
                <p className="mt-1" style={{ color: '#B71C1C', fontSize: '15px' }}>{error}</p>
              </div>
            </div>
          </div>
        ) : responsibilities.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F2F2F7' }}>
              <svg className="w-8 h-8" style={{ color: '#8E8E93' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-medium mb-2" style={{ color: '#1C1C1E', fontSize: '20px' }}>No Responsibilities</h3>
            <p style={{ color: '#8E8E93', fontSize: '17px' }}>Responsibilities will appear here once synced from Google Sheets.</p>
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

            <div className="space-y-3 mx-2">
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
                {/* Simple pagination */}
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
      </main>

      <BottomNavigation items={navItems} />
    </div>
  );
};

export default ChurchResponsibilities;