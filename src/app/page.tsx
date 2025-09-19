'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ChatInterface from '@/components/ChatInterface';
import SideNav from '@/components/SideNav';

export default function Home() {
  const { data: session } = useSession();
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  // Generate initial session ID when user is authenticated
  useEffect(() => {
    if (session?.user?.email && !currentSessionId) {
      // Default to today's persistent session
      const todaySessionId = generateSessionId(session.user.email, false);
      setCurrentSessionId(todaySessionId);
    }
  }, [session, currentSessionId]);

  const generateSessionId = (userEmail: string, useTimestamp: boolean = false) => {
    if (useTimestamp) {
      const timestamp = new Date().getTime();
      return `user_${userEmail.replace('@', '_').replace(/\./g, '_')}_${timestamp}`;
    } else {
      // For backward compatibility, still support date-based IDs
      const dateStr = new Date().toISOString().split('T')[0];
      return `user_${userEmail.replace('@', '_').replace(/\./g, '_')}_${dateStr}`;
    }
  };

  const handleSendMessage = async (message: string, sessionId: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          sessionId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message to n8n:', error);
      throw error;
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsSideNavOpen(false); // Close sidenav on mobile after selection
  };

  const handleNewChat = () => {
    if (session?.user?.email) {
      const newSessionId = generateSessionId(session.user.email);
      setCurrentSessionId(newSessionId);
    }
  };

  const handleLoadChatHistory = (sessionId: string) => {
    // This will be handled by the ChatInterface component
    console.log('Loading chat history for session:', sessionId);
  };

  const handleSessionCreated = (sessionId: string, firstMessage: string) => {
    // This will be handled by the SideNav component
    console.log('Session created:', sessionId, firstMessage);
  };

  return (
    <div className="flex h-screen">
      <SideNav
        isOpen={isSideNavOpen}
        onToggle={() => setIsSideNavOpen(!isSideNavOpen)}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        onSessionCreated={handleSessionCreated}
      />
      
      <div className={`flex-1 transition-all duration-300 ${isSideNavOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <ChatInterface 
          onSendMessage={handleSendMessage}
          currentSessionId={currentSessionId}
          onLoadChatHistory={handleLoadChatHistory}
          onNewChat={handleNewChat}
        />
      </div>
    </div>
  );
}
