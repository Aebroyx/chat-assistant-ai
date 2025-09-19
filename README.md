# AI Chatbot Assistant Setup

A beautiful, modern AI chatbot interface built with Next.js 15 and Tailwind CSS, designed to integrate with your n8n RAG workflow.

## Features

- 🎨 Modern, responsive chat interface
- 🤖 AI-powered responses via n8n workflow
- 📱 Mobile-friendly design
- 🌙 Dark mode support
- ⚡ Real-time messaging
- 🔄 Loading states and error handling

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your n8n webhook URL:
   ```
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## n8n Integration

### Setting up your n8n Workflow

Your n8n workflow should:

1. **Accept POST requests** at your webhook URL
2. **Expect JSON payload** with this structure:
   ```json
   {
     "message": "User's message here",
     "timestamp": "2024-01-01T12:00:00.000Z"
   }
   ```

3. **Return JSON response** with this structure:
   ```json
   {
     "response": "AI's response here",
     "timestamp": "2024-01-01T12:00:00.000Z"
   }
   ```

### Example n8n Workflow Structure

```
Webhook → Process Message → Decision Node
                              ├── Query Qdrant (RAG)
                              ├── Fetch API Data
                              └── Direct Gemini Response
                                     ↓
                              Format Response → Return
```

### Webhook Configuration

In your n8n workflow:
1. Add a **Webhook** node as the trigger
2. Set HTTP Method to **POST**
3. Set Response Mode to **Return Response**
4. Configure the webhook URL and note it for your `.env.local`

## Customization

### Styling
The chat interface uses Tailwind CSS. You can customize:
- Colors in `src/components/ChatInterface.tsx`
- Layout in `src/app/page.tsx`
- Global styles in `src/app/globals.css`

### Message Handling
Modify the API route in `src/app/api/chat/route.ts` to:
- Add authentication
- Transform request/response data
- Add logging or analytics
- Handle different message types

### UI Components
The main chat component is in `src/components/ChatInterface.tsx`. You can:
- Add message reactions
- Include file uploads
- Add typing indicators
- Implement message history

## Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `N8N_WEBHOOK_URL` | Your n8n webhook endpoint | Yes |
| `GOOGLE_AI_API_KEY` | Google AI API key (if needed by n8n) | No |
| `QDRANT_API_KEY` | Qdrant API key (if needed by n8n) | No |
| `QDRANT_URL` | Qdrant instance URL (if needed by n8n) | No |

## Troubleshooting

### Common Issues

1. **"This is a demo response" message:**
   - Set the `N8N_WEBHOOK_URL` environment variable
   - Restart the development server

2. **Connection errors:**
   - Verify your n8n webhook URL is accessible
   - Check n8n workflow is active
   - Ensure proper CORS settings in n8n

3. **Styling issues:**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS classes

### Debug Mode
Add console logs in `src/app/api/chat/route.ts` to debug API calls:

```typescript
console.log('Sending to n8n:', { message, timestamp });
console.log('n8n response:', data);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this in your own projects!
