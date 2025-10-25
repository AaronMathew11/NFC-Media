import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

interface ChurchMember {
  _id: string;
  fullName: string;
  photo: string;
  dateOfBirth: string;
  anniversaryDate?: string;
  address: string;
  phoneNumber: string;
  email: string;
  hobbies: string[];
}

interface MemberEvent {
  memberId: string;
  memberName: string;
  member: ChurchMember;
  eventType: 'birthday' | 'anniversary';
  date: string;
  monthDay: string;
  nextOccurrence: Date;
  daysUntil: number;
}

const ChurchMembers: React.FC = () => {
  const navigate = useNavigate();
  const [copiedEvent, setCopiedEvent] = useState<string | null>(null);
  const [members, setMembers] = useState<ChurchMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch members from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_URL}/members`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform API data to match component interface
          const transformedMembers = data.data.map((member: any) => {
            // Use backend proxy for UI Avatars to avoid CORS issues
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
            const photoUrl = `${API_URL}/avatar/proxy?name=${encodeURIComponent(member.fullName)}&background=E5E5EA&color=8E8E93&size=120&bold=false&format=svg`;
            
            return {
              _id: member._id,
              fullName: member.fullName,
              photo: photoUrl,
              dateOfBirth: member.dateOfBirth,
              anniversaryDate: member.anniversaryDate,
              address: member.address || '',
              phoneNumber: member.phoneNumber || '',
              email: member.email,
              hobbies: member.hobbies || []
            };
          });
          
          setMembers(transformedMembers);
        } else {
          throw new Error('Invalid response format');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch members');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, []);

  const sortedEvents = useMemo(() => {
    const events: MemberEvent[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Create events for birthdays and anniversaries
    members.forEach(member => {
      // Add birthday event if dateOfBirth exists
      if (member.dateOfBirth) {
        const birthdayDate = new Date(member.dateOfBirth);
        const birthdayMonthDay = `${String(birthdayDate.getMonth() + 1).padStart(2, '0')}-${String(birthdayDate.getDate()).padStart(2, '0')}`;
        
        // Calculate next occurrence
        let nextBirthday = new Date(currentYear, birthdayDate.getMonth(), birthdayDate.getDate());
        if (nextBirthday < today) {
          nextBirthday = new Date(currentYear + 1, birthdayDate.getMonth(), birthdayDate.getDate());
        }
        
        events.push({
          memberId: member._id,
          memberName: member.fullName,
          member: member,
          eventType: 'birthday',
          date: member.dateOfBirth,
          monthDay: birthdayMonthDay,
          nextOccurrence: nextBirthday,
          daysUntil: Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        });
      }

      // Add anniversary event if it exists
      if (member.anniversaryDate) {
        const anniversaryDate = new Date(member.anniversaryDate);
        const anniversaryMonthDay = `${String(anniversaryDate.getMonth() + 1).padStart(2, '0')}-${String(anniversaryDate.getDate()).padStart(2, '0')}`;
        
        // Calculate next occurrence
        let nextAnniversary = new Date(currentYear, anniversaryDate.getMonth(), anniversaryDate.getDate());
        if (nextAnniversary < today) {
          nextAnniversary = new Date(currentYear + 1, anniversaryDate.getMonth(), anniversaryDate.getDate());
        }
        
        events.push({
          memberId: member._id,
          memberName: member.fullName,
          member: member,
          eventType: 'anniversary',
          date: member.anniversaryDate,
          monthDay: anniversaryMonthDay,
          nextOccurrence: nextAnniversary,
          daysUntil: Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        });
      }
    });

    // Sort by days until next occurrence (cyclic - upcoming dates first)
    return events.sort((a, b) => {
      if (a.daysUntil !== b.daysUntil) {
        return a.daysUntil - b.daysUntil;
      }
      // If same day, sort by name
      return a.memberName.localeCompare(b.memberName);
    });
  }, [members]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const generateWhatsAppMessage = (event: MemberEvent) => {
    const memberName = event.member.fullName;
    
    if (event.eventType === 'birthday') {
      return `Dear Church, Let's wish ${memberName} a very Happy Birthday 🥳 🥰😍`;
    } else {
      return `Dear Church, Let's wish ${memberName} a very Happy Anniversary 💒 🥳 🥰😍`;
    }
  };

  const copyImageAndMessage = async (event: MemberEvent) => {
    const message = generateWhatsAppMessage(event);
    const eventKey = `${event.memberId}-${event.eventType}`;
    
    try {
      // First copy the avatar image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob && navigator.clipboard && window.ClipboardItem) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  [blob.type]: blob
                })
              ]);
              
              setCopiedEvent(eventKey);
              
              // Show user to paste image first, then copy text
              setTimeout(() => {
                if (window.confirm('Image copied! Please paste the image in WhatsApp first, then click OK to copy the message text.')) {
                  navigator.clipboard.writeText(message).then(() => {
                    alert('Message text copied! Now paste it in WhatsApp.');
                  }).catch(() => {
                    // Fallback for text
                    const textArea = document.createElement('textarea');
                    textArea.value = message;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Message text copied! Now paste it in WhatsApp.');
                  });
                }
                setCopiedEvent(null);
              }, 1000);
              
            } catch (clipboardErr) {
              // Fallback: just copy text
              await copyTextOnly();
            }
          } else {
            await copyTextOnly();
          }
        }, 'image/png');
      };
      
      img.onerror = async () => {
        await copyTextOnly();
      };
      
      img.src = event.member.photo;
      
    } catch (err) {
      await copyTextOnly();
    }
    
    async function copyTextOnly() {
      try {
        await navigator.clipboard.writeText(message);
        setCopiedEvent(eventKey);
        setTimeout(() => setCopiedEvent(null), 2000);
        alert('Message copied! (Could not copy image - please add photo manually in WhatsApp)');
      } catch (textErr) {
        // Final fallback
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
        alert('Message copied! (Could not copy image - please add photo manually in WhatsApp)');
      }
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
      active: true,
      onClick: () => navigate('/church-members')
    },
    {
      id: 'schedule',
      label: 'Flow',
      onClick: () => navigate('/service-flow')
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2F2F7' }}>
      <header className="bg-white px-8 py-12 border-b" style={{ borderColor: '#E5E5EA' }}>
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#1C1C1E' }}>Members</h1>
          <p className="text-lg" style={{ color: '#8E8E93' }}>Upcoming celebrations</p>
          <div className="mt-6 flex items-center justify-center">
            <div className="w-16 h-1 rounded-full" style={{ backgroundColor: '#E5E5EA' }}></div>
          </div>
        </div>
      </header>

      <main className="px-8 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#007AFF' }}></div>
              <p style={{ color: '#8E8E93', fontSize: '17px' }}>Loading members...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: '#FFEBEE', borderColor: '#F8BBD9', borderWidth: '1px' }}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" style={{ color: '#D32F2F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium" style={{ color: '#D32F2F', fontSize: '17px' }}>Error loading members</h3>
                <p className="mt-1" style={{ color: '#B71C1C', fontSize: '15px' }}>{error}</p>
              </div>
            </div>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F2F2F7' }}>
              <svg className="w-8 h-8" style={{ color: '#8E8E93' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-medium mb-2" style={{ color: '#1C1C1E', fontSize: '20px' }}>No Members</h3>
            <p style={{ color: '#8E8E93', fontSize: '17px' }}>Members will appear here once synced from Google Sheets.</p>
          </div>
        ) : (
          <div className="space-y-4 mx-4">
            {sortedEvents.map((event) => (
            <div key={`${event.memberId}-${event.eventType}`} className="bg-white rounded-xl" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div className="p-4">
                {/* Header with Date and Copy Button - similar to responsibilities */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#1C1C1E', fontSize: '20px' }}>
                      {event.member.fullName}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#F2F2F7', color: '#8E8E93' }}>
                        {event.eventType === 'birthday' ? 'Birthday' : 'Anniversary'}
                      </span>
                      <span className="text-sm px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#F2F2F7', color: '#1C1C1E' }}>
                        {formatDate(event.date)}
                      </span>
                      {(() => {
                        if (event.daysUntil === 0) {
                          return (
                            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#FF2D9215', color: '#FF2D92' }}>
                              Today!
                            </span>
                          );
                        } else if (event.daysUntil === 1) {
                          return (
                            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#FF2D9215', color: '#FF2D92' }}>
                              Tomorrow
                            </span>
                          );
                        } else if (event.daysUntil <= 7) {
                          return (
                            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#FF2D9215', color: '#FF2D92' }}>
                              {event.daysUntil} days
                            </span>
                          );
                        } else {
                          return (
                            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#F2F2F7', color: '#8E8E93' }}>
                              {event.daysUntil} days
                            </span>
                          );
                        }
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={() => copyImageAndMessage(event)}
                    className="px-4 py-2 rounded-full font-medium transition-all duration-200"
                    style={{
                      backgroundColor: copiedEvent === `${event.memberId}-${event.eventType}` ? '#34C759' : '#1C1C1E',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  >
                    {copiedEvent === `${event.memberId}-${event.eventType}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Member Details Grid - similar to responsibilities */}
                <div className="space-y-3">
                  {/* Photo and Name */}
                  <div className="flex items-center py-1">
                    <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: '#E5E5EA' }}>
                      <img
                        src={event.member.photo}
                        alt={event.member.fullName}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement!;
                          parent.innerHTML = `<span style="color: #8E8E93; font-size: 14px; font-weight: 500;">${event.member.fullName.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)}</span>`;
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: '#1C1C1E', fontSize: '16px' }}>{event.member.fullName}</p>
                      <p className="text-sm" style={{ color: '#8E8E93' }}>Member Profile</p>
                    </div>
                  </div>

                  {/* Contact Details */}
                  {event.member.phoneNumber && (
                    <div className="flex items-center py-1">
                      <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: '#E5E5EA' }}>
                        <svg className="w-5 h-5" style={{ color: '#8E8E93' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: '#1C1C1E', fontSize: '16px' }}>{event.member.phoneNumber}</p>
                        <p className="text-sm" style={{ color: '#8E8E93' }}>Phone Number</p>
                      </div>
                    </div>
                  )}

                  {event.member.email && (
                    <div className="flex items-center py-1">
                      <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: '#E5E5EA' }}>
                        <svg className="w-5 h-5" style={{ color: '#8E8E93' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: '#1C1C1E', fontSize: '16px' }}>{event.member.email}</p>
                        <p className="text-sm" style={{ color: '#8E8E93' }}>Email Address</p>
                      </div>
                    </div>
                  )}

                  {event.member.address && (
                    <div className="flex items-center py-1">
                      <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: '#E5E5EA' }}>
                        <svg className="w-5 h-5" style={{ color: '#8E8E93' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: '#1C1C1E', fontSize: '16px' }}>{event.member.address}</p>
                        <p className="text-sm" style={{ color: '#8E8E93' }}>Address</p>
                      </div>
                    </div>
                  )}

                  {event.member.hobbies.length > 0 && (
                    <div className="flex items-center py-1">
                      <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: '#E5E5EA' }}>
                        <svg className="w-5 h-5" style={{ color: '#8E8E93' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: '#1C1C1E', fontSize: '16px' }}>{event.member.hobbies.join(', ')}</p>
                        <p className="text-sm" style={{ color: '#8E8E93' }}>Hobbies & Interests</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </main>

      <BottomNavigation items={navItems} />
    </div>
  );
};

export default ChurchMembers;