'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, History, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date | string;
}

interface SideNavProps {
  isOpen: boolean;
  onToggle: () => void;
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onSessionCreated?: (sessionId: string, firstMessage: string) => void;
}

export default function SideNav({ 
  isOpen, 
  onToggle, 
  currentSessionId, 
  onSessionSelect, 
  onNewChat,
  onSessionCreated 
}: SideNavProps) {
  const { data: session } = useSession();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate session ID based on user email and current date
  const generateSessionId = (userEmail: string, date?: Date) => {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split('T')[0];
    return `user_${userEmail.replace('@', '_').replace(/\./g, '_')}_${dateStr}`;
  };

  // Load user's chat sessions
  const loadChatSessions = async () => {
    if (!session?.user?.email) return;

    setIsLoading(true);
    try {
      // Always show Today's Chat as the default persistent session
      const todaySessionId = generateSessionId(session.user.email);
      const todaySession: ChatSession = {
        id: todaySessionId,
        title: "Today's Chat",
        lastMessage: "Your persistent chat for today",
        timestamp: new Date(),
      };
      
      setChatSessions([todaySession]);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      loadChatSessions();
    }
  }, [session]);

  // Function to add a session when it's actually created (when first message is sent)
  const addSessionToList = (sessionId: string, firstMessage: string) => {
    const sessionExists = chatSessions.some(s => s.id === sessionId);
    if (!sessionExists) {
      // Check if this is today's session or a temporary new chat
      const todaySessionId = generateSessionId(session?.user?.email || '');
      const isTemporaryChat = sessionId !== todaySessionId;
      
      const newSession: ChatSession = {
        id: sessionId,
        title: isTemporaryChat ? `New Chat ${new Date().toLocaleTimeString()}` : "Today's Chat",
        lastMessage: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : ''),
        timestamp: new Date(),
      };
      
      if (isTemporaryChat) {
        // Add temporary chats at the top
        setChatSessions(prev => [newSession, ...prev]);
      } else {
        // Update today's chat message if it already exists
        setChatSessions(prev => prev.map(s => 
          s.id === todaySessionId 
            ? { ...s, lastMessage: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '') }
            : s
        ));
      }
    }
  };

  // Expose the addSessionToList function
  useEffect(() => {
    if (onSessionCreated) {
      (window as any).addSessionToSideNav = addSessionToList;
    }
  }, [onSessionCreated, chatSessions]);

  const handleNewChat = () => {
    if (!session?.user?.email) return;
    
    // Create a unique session ID using timestamp to ensure uniqueness
    const timestamp = new Date().getTime();
    const newSessionId = `user_${session.user.email.replace('@', '_').replace(/\./g, '_')}_${timestamp}`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      title: `New Chat ${new Date().toLocaleTimeString()}`,
      lastMessage: 'Temporary chat - will reset on reload',
      timestamp: new Date(),
    };
    
    // Add the new session to the list (at the top, above Today's Chat)
    setChatSessions(prev => [newSession, ...prev]);
    
    onNewChat();
    onSessionSelect(newSessionId);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if this is today's persistent chat
    const todaySessionId = generateSessionId(session?.user?.email || '');
    const isTodaysChat = sessionId === todaySessionId;
    
    if (isTodaysChat) {
      alert("Today's Chat cannot be deleted. It's your persistent chat session.");
      return;
    }
    
    if (confirm('Are you sure you want to delete this temporary chat?')) {
      setChatSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If deleting current session, switch back to today's chat
      if (currentSessionId === sessionId) {
        onSessionSelect(todaySessionId);
      }
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const now = new Date();
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white/80 dark:bg-zinc-800/95 backdrop-blur-sm border-r border-gray-200 dark:border-zinc-700 z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 lg:w-72
      `}>
        {/* Header */}
        <div className="h-16 px-4 flex items-center border-b border-gray-200 dark:border-zinc-700">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
              <h2 className="font-semibold text-gray-800 dark:text-zinc-100">
                Chat History
              </h2>
            </div>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-3 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Chat Sessions */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-zinc-400">
              Loading chat history...
            </div>
          ) : chatSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-zinc-400">
              No chat history yet.
              <br />
              Start a new conversation!
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {chatSessions.map((chatSession) => (
                <div
                  key={chatSession.id}
                  onClick={() => onSessionSelect(chatSession.id)}
                  className={`
                    group relative p-3 rounded-lg cursor-pointer transition-colors
                    ${currentSessionId === chatSession.id 
                      ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800' 
                      : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-gray-400 dark:text-zinc-500 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-800 dark:text-zinc-100 truncate">
                        {chatSession.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-1">
                        {chatSession.lastMessage}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                        {formatTimestamp(chatSession.timestamp)}
                      </p>
                    </div>
                    
                    {/* Delete button - show on hover (only for temporary chats) */}
                    {(() => {
                      const todaySessionId = generateSessionId(session?.user?.email || '');
                      const isTodaysChat = chatSession.id === todaySessionId;
                      
                      return !isTodaysChat ? (
                        <button
                          onClick={(e) => handleDeleteSession(chatSession.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all"
                          title="Delete temporary chat"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      ) : null;
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-4 z-30 p-2 bg-white/80 dark:bg-zinc-800/95 backdrop-blur-sm border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm hover:shadow-md transition-all"
          title="Open chat history"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
        </button>
      )}
    </>
  );
}
