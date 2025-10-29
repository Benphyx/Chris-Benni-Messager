import { MOCK_MESSAGES, ALL_USERS } from '../constants';
import { Message, User } from '../types';
import { deriveSharedKey, encryptMessage } from './cryptoService';

type Subscriber = (payload: { chatKey: string, message: Message }) => void;

class MockServer {
  private messages: Record<string, Message[]> = {};
  private subscribers: Subscriber[] = [];

  constructor() {
    this.initialize();
  }

  private getChatKey(id1: string, id2: string): string {
    return [id1, id2].sort().join('-');
  }

  private async initialize() {
    // This simulates the server having access to pre-existing encrypted chats.
    // In a real scenario, this would be a database.
    console.log("Initializing Mock Server and encrypting mock messages...");
    const userMap = new Map<string, User>(ALL_USERS.map(u => [u.id, u]));

    for (const contactId in MOCK_MESSAGES) {
      const messagesToEncrypt = MOCK_MESSAGES[contactId];
      if (messagesToEncrypt.length > 0) {
        
        const firstMessage = messagesToEncrypt[0];
        const senderId = firstMessage.senderId;
        const receiverId = (senderId === contactId) ? messagesToEncrypt[1]?.senderId : contactId;

        if (!receiverId) continue;
        
        const sender = userMap.get(senderId);
        const receiver = userMap.get(receiverId);

        if (sender && receiver) {
            const chatKey = this.getChatKey(senderId, receiverId);
            this.messages[chatKey] = [];
            
            // Derive keys for all pairs to encrypt history
            for (const msg of messagesToEncrypt) {
                const msgSender = userMap.get(msg.senderId);
                const msgReceiverId = this.getOtherUserId(chatKey, msg.senderId);
                const msgReceiver = userMap.get(msgReceiverId);

                if (msgSender && msgReceiver) {
                    const sharedKey = await deriveSharedKey(msgSender.privateKey, msgReceiver.publicKey);
                    const encryptedText = await encryptMessage(msg.text, sharedKey);
                    this.messages[chatKey].push({ ...msg, text: encryptedText });
                }
            }
        }
      }
    }
     console.log("Mock Server initialized with encrypted messages.", this.messages);
  }

  private getOtherUserId(chatKey: string, userId: string): string {
      return chatKey.replace(userId, '').replace('-', '');
  }

  public sendMessage(fromId: string, toId: string, message: Message) {
    const chatKey = this.getChatKey(fromId, toId);
    if (!this.messages[chatKey]) {
      this.messages[chatKey] = [];
    }
    this.messages[chatKey].push(message);

    // Simulate network delay and notify subscribers
    setTimeout(() => {
      this.notify({ chatKey, message });
    }, 500 + Math.random() * 500);
  }

  public getAllMessages(): Record<string, Message[]> {
    return { ...this.messages };
  }

  public subscribe(callback: Subscriber) {
    this.subscribers.push(callback);
  }

  public unsubscribe(callback: Subscriber) {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  private notify(payload: { chatKey: string, message: Message }) {
    this.subscribers.forEach(sub => sub(payload));
  }
}

// Singleton instance
export const mockServer = new MockServer();