'use client';

import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const handleSendMessage = async (message: string) => {
    try {
      // TODO: Replace with your n8n webhook URL
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
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

  return <ChatInterface onSendMessage={handleSendMessage} />;
}
