export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  SENDING = 'sending',
  ERROR = 'error',
}

export interface Message {
  id: string;
  senderId: string;
  // text is now encrypted
  text: string;
  timestamp: number;
  status: MessageStatus;
  chatKey?: string; // Used for routing on the server
}

export type Contact = User;

export enum AIFeature {
  SMART_REPLY = 'Smarte Antworten',
  REWRITE_FORMAL = 'Formeller umschreiben',
  REWRITE_CASUAL = 'Legerer umschreiben',
  SUMMARIZE = 'Zusammenfassen',
}