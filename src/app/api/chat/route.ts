import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create a unique session ID based on user email/id
    const customSessionId = `user_${session.user.email?.replace('@', '_').replace('.', '_')}_${new Date().toISOString().split('T')[0]}`;

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

    if (!N8N_WEBHOOK_URL) {
      // For demo purposes, return a mock response
      return NextResponse.json({
        response: "This is a demo response. Please set up your N8N_WEBHOOK_URL environment variable to connect to your n8n workflow.",
        timestamp: new Date().toISOString(),
        sessionId: customSessionId,
      });
    }

    // Send message to n8n workflow with custom session ID
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput: message,
        sessionId: customSessionId, // Custom session ID for your Chat Hook
        timestamp: new Date().toISOString(),
        user: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different n8n response formats
    let aiResponse = '';
    
    if (typeof data === 'string') {
      // If n8n returns a plain string
      aiResponse = data;
    } else if (data.output) {
      // If n8n returns { output: "response" }
      aiResponse = data.output;
    } else if (data.response) {
      // If n8n returns { response: "response" }
      aiResponse = data.response;
    } else if (data.message) {
      // If n8n returns { message: "response" }
      aiResponse = data.message;
    } else if (data.text) {
      // If n8n returns { text: "response" }
      aiResponse = data.text;
    } else {
      // Fallback: stringify the entire response
      aiResponse = JSON.stringify(data);
    }
    
    // Return the response from n8n
    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      sessionId: customSessionId,
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
