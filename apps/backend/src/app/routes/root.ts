import { FastifyInstance } from 'fastify';
import { google } from '@ai-sdk/google';
import { streamText, ModelMessage, convertToModelMessages, UIMessage } from 'ai';

import "dotenv/config";

type RequestBody = {
  id: number,
  messages: UIMessage[],
  temperature: number,
  maxOutputTokens: number,
  model: string,
  systemPrompt: string
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/api/welcome', async function () {
    return { message: 'Hello from API' };
  });

  fastify.post('/api/chat', async function (request, reply) {

    const { id, messages, temperature, maxOutputTokens, model, systemPrompt } = (request.body as RequestBody);

    console.log("/api/chat", id, messages, temperature, maxOutputTokens, model)

    const result = streamText({
      model: google(model),
      messages: convertToModelMessages(messages) as ModelMessage[],
      temperature,
      maxOutputTokens: maxOutputTokens,
      system: systemPrompt || 'Sei un assistente AI che risponde in italiano.'
    });

    return reply.send(result.toUIMessageStreamResponse({
      sendReasoning: true,
      sendSources: true,
      originalMessages: messages,
      messageMetadata: ({ part }) => {
        // Send total usage when generation is finished
        if (part.type === 'finish') {
          return { totalUsage: part.totalUsage };
        }
        return undefined;
      },
      onError: error => {
        if (error == null) {
          return 'unknown error';
        }

        if (typeof error === 'string') {
          return error;
        }

        if (error instanceof Error) {
          return error.message;
        }

        return JSON.stringify(error);
      },
    }));
  });
}


