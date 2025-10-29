import { Message } from '../types.ts';

class SocketService {
  private ws: WebSocket | null = null;
  private onMessageCallback: ((message: Message) => void) | null = null;
  private onInitialMessagesCallback: ((messages: Record<string, Message[]>) => void) | null = null;

  public connect(
    userId: string,
    serverUrl: string, // URL is now a parameter
    onMessage: (message: Message) => void,
    onInitialMessages: (messages: Record<string, Message[]>) => void
  ): Promise<void> {
    
    return new Promise((resolve, reject) => {
        if (this.ws) {
            this.disconnect();
        }
        
        this.onMessageCallback = onMessage;
        this.onInitialMessagesCallback = onInitialMessages;

        if (!serverUrl || !serverUrl.startsWith('ws')) {
             console.error("Invalid WebSocket URL provided.");
             reject(new Error("Invalid WebSocket URL. It should start with ws:// or wss://"));
             return;
        }

        this.ws = new WebSocket(`${serverUrl}?userId=${userId}`);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            resolve();
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'newMessage' && this.onMessageCallback) {
                console.log('Received new message:', data.payload);
                this.onMessageCallback(data.payload);
            }
            
            if (data.type === 'initialMessages' && this.onInitialMessagesCallback) {
                console.log('Received initial messages:', data.payload);
                this.onInitialMessagesCallback(data.payload);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.ws = null;
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
            this.ws = null; // Ensure clean state on error
        };
    });
  }

  public sendMessage(message: Message, recipientId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'sendMessage',
        payload: {
          message,
          recipientId,
        }
      }));
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  public disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}

export const socketService = new SocketService();