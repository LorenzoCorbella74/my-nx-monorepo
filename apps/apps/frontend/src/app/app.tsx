import { useState, useEffect, useRef } from 'react';
import styles from './app.module.css';
import { Streamdown } from 'streamdown';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { google } from "@ai-sdk/google";

const googleFlash = google("gemini-2.5-flash");
const googlePro = google("gemini-2.5-pro");

type Metadata = {
  totalUsage?: {
    inputTokens: number,
    outputTokens: number,
    totalTokens: number,
    reasoningTokens: number
  }
}

export const MODELS = {
  "gemini-2.5-flash": googleFlash,
  "gemini-2.5-pro": googlePro
} as const;

export default function App() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      /* prepareSendMessagesRequest: (({ id, messages }) => {
        return { body: { id, messages, temperature, maxOutputTokens: maxTokens, model: selectedModel, systemPrompt } };
      }) */
    }),
    onFinish: ({ message }) => {
      const metadata = message.metadata as Metadata | undefined;
      console.log("onFinish: ", metadata?.totalUsage);
    }
  });

  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<keyof typeof MODELS>("gemini-2.5-flash");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(10000);
  const [systemPrompt, setSystemPrompt] = useState('Sei un assistente AI che risponde in Italiano.');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (messageContent: string) => {
    sendMessage(
      { text: messageContent },
      {
        body: {
          temperature,
          maxOutputTokens: maxTokens,
          model: selectedModel,
          systemPrompt
        }
      }
    );
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatWrapper}>
        {/* Sidebar con controlli */}
        <div className={`${styles.sidebar} ${!sidebarVisible ? styles.sidebarHidden : ''}`}>
          <h3 className={styles.sidebarTitle}>Impostazioni</h3>

        <div className={styles.controlsContainer}>
          <div className={styles.controlGroup}>
            <label className={styles.label}>System Prompt:</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Inserisci il prompt di sistema..."
              className={styles.systemPromptTextarea}
              rows={6}
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Temperature: {temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Max Tokens: {maxTokens}
            </label>
            <input
              type="range"
              min="1000"
              max="20000"
              step="100"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>Modello:</label>
            <select
              value={selectedModel}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                setSelectedModel(event.target.value as keyof typeof MODELS);
              }}
              className={styles.select}
            >
              {Object.keys(MODELS).map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className={styles.mainContent}>
        <div className={styles.toggleSidebarContainer}>
          <button 
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className={styles.toggleSidebarBtn}
            title={sidebarVisible ? "Nascondi impostazioni" : "Mostra impostazioni"}
          >
            {sidebarVisible ? '◀' : '▶'}
          </button>
        </div>
        <div className={styles.messagesContainer}>
          {messages.map(message => {
            type Metadata = { totalUsage?: { totalTokens?: number } };
            const metadata = message.metadata as Metadata | undefined;

            return (
              <div key={message.id} className={message.role === 'user' ? styles.userMessage : styles.aiMessage}>
                <div className={styles.messageHeader}>
                  {message.role === 'user' ? '👤 Tu' : '🤖 AI'}
                </div>

                <div className={styles.messageContent}>
                  {message.parts
                    .filter(part => part.type === 'source-url')
                    .map((part, index) => (
                      <span key={`source-url-${index}`} className={styles.sourceLink}>
                        [
                        <a href={part.url} target="_blank" rel="noopener noreferrer">
                          {part.title ?? new URL(part.url).hostname}
                        </a>
                        ]
                      </span>
                    ))}

                  {message.parts
                    .filter(part => part.type === 'source-document')
                    .map((part, index) => (
                      <span key={`source-${index}`} className={styles.sourceDocument}>
                        [<span>{part.title ?? `Document ${index}`}</span>]
                      </span>
                    ))
                  }

                  {message.parts.map((part, index) => {
                    if (part.type === 'text') {
                      return <Streamdown key={index}>{part.text}</Streamdown>
                      {/* <div key={index} className={styles.messageText}>{part.text}</div>; */}
                    }
                    if (part.type === 'reasoning') {
                      return <pre key={index} className={styles.reasoning}>{part.text}</pre>;
                    }
                    if (part.type === 'file' && part.mediaType.startsWith('image/')) {
                      return <img key={index} src={part.url} alt="Generated image" className={styles.messageImage} />;
                    }
                    return null;
                  })}

                  {metadata?.totalUsage && (
                    <div className={styles.tokenUsage}>Tokens utilizzati: {metadata.totalUsage.totalTokens}</div>
                  )}
                </div>
              </div>
            )
          })}

          {status !== 'ready' && (
            <div className={styles.loadingMessage}>Caricamento...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (input.trim()) {
              handleSendMessage(input);
              setInput('');
            }
          }}
          className={styles.inputForm}
        >
          <div className={styles.inputContainer}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={status !== 'ready'}
              placeholder="Scrivi un messaggio..."
              className={styles.messageInput}
            />
            <button
              type="submit"
              disabled={status !== 'ready' || !input.trim()}
              className={styles.sendButton}
            >
              Invia
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}