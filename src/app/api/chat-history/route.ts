import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get n8n base URL from environment variable
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json(
        { error: 'N8N_WEBHOOK_URL environment variable is not configured' },
        { status: 500 }
      );
    }

    // Fetch chat history from n8n Redis endpoint
    const response = await fetch(
      `${N8N_WEBHOOK_URL}/webhook/chat-history?sessionId=${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch chat history: ${response.status}`);
    }

    const chatHistory = await response.json();

    // Transform the data to match our Message interface
    const transformedHistory = chatHistory.map((item: any, index: number) => ({
      id: `${sessionId}-${index}`,
      content: item.message,
      role: item.role === 'bot' ? 'assistant' : item.role,
      timestamp: new Date(), // You might want to include actual timestamps from Redis
    }));

    return NextResponse.json({
      success: true,
      sessionId,
      messages: transformedHistory.reverse(), // Reverse to show oldest first
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch chat history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// API to get list of all sessions for a user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // For now, we'll generate some sample session IDs
    // In a real implementation, you'd fetch this from your database
    const sessions = [
      {
        id: `user_${userId.replace('@', '_').replace('.', '_')}_${new Date().toISOString().split('T')[0]}`,
        title: 'Today\'s Chat',
        lastMessage: 'Hello! How can I help you today?',
        timestamp: new Date(),
      },
      // Add more sessions as needed
    ];

    return NextResponse.json({
      success: true,
      sessions,
    });

  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
