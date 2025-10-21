# AI Chat Application - Nx Monorepo

This is an **Nx-based monorepo** that implements a **full-stack AI chat application** using modern web technologies and Google's Gemini AI models.

## Architecture

- **Frontend**: React 19 application built with Vite and TypeScript
- **Backend**: Fastify Node.js server with TypeScript
- **Monorepo Management**: Nx workspace with optimized build and development workflows

## Key Features

- **AI Chat Interface**: A chat application that integrates with Google's Gemini AI models (Flash and Pro variants)
- **Real-time Streaming**: Uses AI SDK for streaming chat responses
- **Italian Language Support**: Default system prompt configured for Italian responses
- **Configurable Parameters**: Users can adjust temperature, max tokens, and system prompts
- **Model Selection**: Support for switching between different Gemini models

## Technical Stack

### Frontend
- React 19
- React Router DOM 6.29
- AI SDK React hooks
- Streamdown for markdown rendering
- Vite for development and building
- CSS modules for styling

### Backend
- Fastify web framework
- AI SDK with Google provider
- Fastify autoload for plugins and routes
- Environment configuration with dotenv

### Development Tools
- TypeScript 5.9
- Nx 21.6 for monorepo management
- ESBuild for fast compilation
- Vitest for testing
- SWC for fast TypeScript compilation

## Project Structure

```
apps/
├── apps/frontend/          # React chat interface
│   ├── src/
│   │   ├── main.tsx       # Application entry point
│   │   └── app/
│   │       └── app.tsx    # Main chat component
│   └── vite.config.ts     # Vite configuration
└── backend/               # Fastify API server
    └── src/
        ├── main.ts        # Server entry point
        └── app/
            ├── app.ts     # Fastify app configuration
            └── routes/
                └── root.ts # API endpoints (/api/chat, /api/welcome)
```

## Available Scripts

- `npm run dev`: Start both frontend and backend in parallel
- `npm run dev-FE`: Start only the frontend development server
- `npm run dev-BE`: Start only the backend development server

## API Endpoints

- `GET /api/welcome`: Health check endpoint
- `POST /api/chat`: Streaming chat endpoint with Gemini AI integration

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables for Google AI API access

3. Start development servers:
   ```bash
   npm run dev
   ```

The application provides a chat interface where users can interact with Google's Gemini AI models, with configurable parameters and real-time streaming responses in Italian.