"use client";

import React, { useState } from 'react';
import { Bell, Check, ExternalLink, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'offer' | 'sale' | 'listing' | 'outbid' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'offer',
    title: 'New Offer Received',
    message: 'You received an offer of 5.2 BASED for Cool Cat #1234',
    timestamp: '10 minutes ago',
    read: false,
    link: '/nft/1234'
  },
  {
    id: 'notif-2',
    type: 'sale',
    title: 'NFT Sold!',
    message: 'Your listing for Bored Ape #5678 has been sold for 120 BASED',
    timestamp: '2 hours ago',
    read: false,
    link: '/nft/5678'
  },
  {
    id: 'notif-3',
    type: 'listing',
    title: 'Listing Created',
    message: 'You listed Azuki #9012 for 8.5 BASED',
    timestamp: '1 day ago',
    read: true,
    link: '/nft/9012'
  }
];

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notif => ({ ...notif, read: true }))
    );
  };
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full border border-theme-border hover:border-theme-primary"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-theme-primary rounded-full text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-theme-border flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-theme-primary hover:underline flex items-center gap-1"
                >
                  <Check size={12} />
                  Mark all as read
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-theme-text-secondary hover:text-theme-text-primary"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div>
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-3 border-b border-theme-border ${notification.read ? '' : 'bg-theme-card-highlight'}`}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <span className="text-xs text-theme-text-secondary">{notification.timestamp}</span>
                    </div>
                    <p className="text-sm text-theme-text-secondary mt-1">{notification.message}</p>
                    
                    <div className="flex justify-between items-center mt-2">
                      {notification.link && (
                        <a 
                          href={notification.link}
                          className="text-xs text-theme-primary hover:underline flex items-center gap-1"
                        >
                          View Details
                          <ExternalLink size={10} />
                        </a>
                      )}
                      
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-theme-text-secondary hover:text-theme-primary"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-theme-text-secondary">
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
