import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual n8n webhook URL
    // Example: const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/your-webhook-id';
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

    if (!N8N_WEBHOOK_URL) {
      // For demo purposes, return a mock response
      return NextResponse.json({
        response: "This is a demo response. Please set up your N8N_WEBHOOK_URL environment variable to connect to your n8n workflow.",
        timestamp: new Date().toISOString(),
      });
    }

    // Send message to n8n workflow
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any additional headers your n8n workflow requires
      },
      body: JSON.stringify({
        message: message,
        timestamp: new Date().toISOString(),
        // Add any additional data your n8n workflow expects
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Return the response from n8n
    return NextResponse.json({
      response: data.response || data.message || data,
      timestamp: new Date().toISOString(),
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
