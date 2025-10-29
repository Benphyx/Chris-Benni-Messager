import { User, Message, MessageStatus } from './types.ts';

// IMPORTANT: These keys are for demonstration purposes only.
// In a real application, keys would be generated on the client and never shared.
const user0: User = {
  id: 'user-0',
  name: 'Ich',
  avatarUrl: 'https://picsum.photos/seed/me/100/100',
  publicKey: {"crv":"P-256","ext":true,"key_ops":["deriveKey"],"kty":"EC","x":"f63EyC6a345-C00e-TAt_K-aF0-c0yX_Dcew7-2v8Is","y":"d5X9gO6c1qj2a_gI_e8o5A-f8b8C8F8c8c8c8c8c8c8"},
  privateKey: {"crv":"P-256","d":"8a8J-l-s8-Q9f8c8c8c8c8c8c8c8c8c8c8c8c8c8c8","ext":true,"key_ops":["deriveKey"],"kty":"EC","x":"f63EyC6a345-C00e-TAt_K-aF0-c0yX_Dcew7-2v8Is","y":"d5X9gO6c1qj2a_gI_e8o5A-f8b8C8F8c8c8c8c8c8c8"}
};

const user1: User = {
  id: 'user-1',
  name: 'Lena Müller',
  avatarUrl: 'https://picsum.photos/seed/lena/100/100',
  publicKey: {"crv":"P-256","ext":true,"key_ops":["deriveKey"],"kty":"EC","x":"_4Y-e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a","y":"_4Y-e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-b"},
  privateKey: {"crv":"P-256","d":"_8c_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-c","ext":true,"key_ops":["deriveKey"],"kty":"EC","x":"_4Y-e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a","y":"_4Y-e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-b"}
};

const user2: User = {
  id: 'user-2',
  name: 'Max Schmidt',
  avatarUrl: 'https://picsum.photos/seed/max/100/100',
  publicKey: {"crv":"P-256","ext":true,"key_ops":["deriveKey"],"kty":"EC","x":"a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e","y":"b_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_f"},
  privateKey: {"crv":"P-256","d":"c_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_g","ext":true,"key_ops":["deriveKey"],"kty":"EC","x":"a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e","y":"b_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_f"}
};

const user3: User = {
  id: 'user-3',
  name: 'Sophia Wagner',
  avatarUrl: 'https://picsum.photos/seed/sophia/100/100',
  publicKey: {"crv":"P-256","ext":true,"key_ops":["deriveKey"],"kty":"EC","x":"d_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_h","y":"e_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_i"},
  privateKey: {"crv":"P-256","d":"f_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_j","ext":true,"key_ops":["deriveKey"],"kty":"EC","x":"d_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_h","y":"e_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_e_X-a_Z_e_V_i"}
};

export const ALL_USERS: User[] = [user0, user1, user2, user3];

export const INITIAL_USER: User = user0;

// The text in MOCK_MESSAGES is plaintext.
// The mock server will encrypt them on initialization.
export const MOCK_MESSAGES: Record<string, Message[]> = {
  'user-1': [
    {
      id: 'msg-1-1',
      senderId: 'user-1',
      text: 'Hallo! Wie geht es dir?',
      timestamp: Date.now() - 1000 * 60 * 5,
      status: MessageStatus.READ,
    },
    {
      id: 'msg-1-2',
      senderId: 'user-0',
      text: 'Mir geht es gut, danke! Und dir?',
      timestamp: Date.now() - 1000 * 60 * 4,
      status: MessageStatus.READ,
    },
    {
      id: 'msg-1-3',
      senderId: 'user-1',
      text: 'Auch gut. Hast du schon Pläne für das Wochenende?',
      timestamp: Date.now() - 1000 * 60 * 3,
      status: MessageStatus.READ,
    },
  ],
  'user-2': [
    {
      id: 'msg-2-1',
      senderId: 'user-2',
      text: 'Hey, erinnerst du dich an das Projekt, über das wir gesprochen haben?',
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      status: MessageStatus.READ,
    },
     {
      id: 'msg-2-2',
      senderId: 'user-0',
      text: 'Ja, klar! Gibt es Neuigkeiten?',
      timestamp: Date.now() - 1000 * 60 * 60 * 23,
      status: MessageStatus.READ,
    },
    {
      id: 'msg-2-3',
      senderId: 'user-2',
      text: 'Ich habe einen ersten Entwurf fertig. Kann ich ihn dir schicken?',
      timestamp: Date.now() - 1000 * 60 * 5,
      status: MessageStatus.DELIVERED,
    },
  ],
  'user-3': [
    {
      id: 'msg-3-1',
      senderId: 'user-3',
      text: 'Lass uns nächste Woche mal wieder einen Kaffee trinken gehen!',
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      status: MessageStatus.SENT,
    },
  ],
};