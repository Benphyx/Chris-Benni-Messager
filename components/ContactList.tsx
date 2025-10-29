import React from 'react';
import { Contact, Message, User } from '../types';

interface ContactListProps {
  contacts: Contact[];
  messages: Record<string, Message[]>;
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  currentUser: User;
  onDisconnect: () => void;
}

const ContactItem: React.FC<{
  contact: Contact;
  lastMessage: Message | undefined;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ contact, lastMessage, isSelected, onSelect }) => {
  const selectedClasses = isSelected ? 'bg-slate-700' : 'hover:bg-slate-800';
  const lastMessageText = lastMessage ? '... ' : 'Keine Nachrichten'; // Placeholder, as it's encrypted
  const lastMessageTime = lastMessage
    ? new Date(lastMessage.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <li
      onClick={onSelect}
      className={`flex items-center p-3 cursor-pointer transition-colors ${selectedClasses}`}
    >
      <img src={contact.avatarUrl} alt={contact.name} className="h-12 w-12 rounded-full mr-4" />
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-100">{contact.name}</h3>
          <span className="text-xs text-slate-400">{lastMessageTime}</span>
        </div>
        <p className="text-sm text-slate-400 truncate italic">{lastMessageText}</p>
      </div>
    </li>
  );
};

export const ContactList: React.FC<ContactListProps> = ({ contacts, messages, selectedContactId, onSelectContact, currentUser, onDisconnect }) => {

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-10 w-10 rounded-full mr-3" />
            <span className="font-semibold text-white">{currentUser.name}</span>
        </div>
        <button 
            onClick={onDisconnect}
            className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors"
            title="Trennen und Benutzer wechseln"
        >
            Trennen
        </button>
      </div>

      <header className="p-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Chats</h2>
      </header>
      
      <ul className="overflow-y-auto custom-scrollbar flex-1">
        {contacts.map((contact) => {
           const chatKey = [currentUser.id, contact.id].sort().join('-');
           const contactMessages = messages[chatKey] || [];
           const lastMessage = contactMessages[contactMessages.length - 1];
          return (
            <ContactItem
              key={contact.id}
              contact={contact}
              lastMessage={lastMessage}
              isSelected={selectedContactId === contact.id}
              onSelect={() => onSelectContact(contact.id)}
            />
          );
        })}
      </ul>
    </aside>
  );
};