import React, { useRef, useEffect } from 'react';
import { Contact, Message, User } from '../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { LockIcon } from './icons';

interface ChatWindowProps {
  contact: Contact | undefined;
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUser: User;
  sharedKey: CryptoKey | null;
}

const ChatHeader: React.FC<{ contact: Contact }> = ({ contact }) => (
    <header className="flex items-center p-4 bg-slate-900 border-b border-slate-800">
        <img src={contact.avatarUrl} alt={contact.name} className="h-10 w-10 rounded-full mr-4" />
        <div>
            <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
            <div className="flex items-center text-xs text-green-400 mt-1">
                <LockIcon className="h-3 w-3 mr-1" />
                <span>End-to-End-verschlüsselt</span>
            </div>
        </div>
    </header>
);

const EmptyChat: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
        <LockIcon className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold text-slate-300">Willkommen bei Gemini Secure Messenger</h2>
        <p className="max-w-sm mt-2">
            Wähle einen Kontakt aus, um eine Unterhaltung zu beginnen. Nachrichten sind End-to-End-verschlüsselt.
        </p>
    </div>
);

export const ChatWindow: React.FC<ChatWindowProps> = ({ contact, messages, onSendMessage, currentUser, sharedKey }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

  if (!contact) {
    return (
      <main className="flex-1 bg-slate-800/50 hidden md:flex flex-col">
        <EmptyChat/>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-slate-800/50 h-full">
        <ChatHeader contact={contact} />
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-4">
            {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} currentUserId={currentUser.id} sharedKey={sharedKey} />
            ))}
            <div ref={messagesEndRef} />
            </div>
        </div>
        <MessageInput onSendMessage={onSendMessage} conversationContext={messages} />
    </main>
  );
};