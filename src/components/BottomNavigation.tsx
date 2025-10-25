import React from 'react';

interface NavItem {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  onClick?: () => void;
}

interface BottomNavigationProps {
  items: NavItem[];
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ items }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="rounded-3xl px-4 py-3" style={{ backgroundColor: '#1C1C1E' }}>
        <div className="flex justify-around items-center">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex items-center justify-center transition-all duration-200 rounded-full hover:scale-105"
              style={{
                backgroundColor: item.active ? 'white' : 'transparent',
                color: item.active ? '#1C1C1E' : 'white',
                width: '52px',
                height: '52px'
              }}
            >
              {item.id === 'home' && (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              )}
              {item.id === 'songs' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
              )}
              {item.id === 'media' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4L5.5 6M17 4l1.5 2M2 6h20v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                </svg>
              )}
              {item.id === 'schedule' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              )}
              {item.id === 'team' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              )}
              {item.id === 'church' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;