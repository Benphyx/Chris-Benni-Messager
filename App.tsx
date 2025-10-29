import React, { useState, useEffect } from 'react';
import { ContactList } from './components/ContactList';
import { ChatWindow } from './components/ChatWindow';
import { ALL_USERS, INITIAL_USER } from './constants';
import { Message, MessageStatus, User } from './types';
import { deriveSharedKey, encryptMessage } from './services/cryptoService';
import { socketService } from './services/socketService';
import { ConnectionView } from './components/ConnectionView';

interface Session {
  user: User;
  serverUrl: string;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [sharedKeys, setSharedKeys] = useState<Record<string, CryptoKey>>({});

  const firstContact = ALL_USERS.find(u => u.id !== INITIAL_USER.id);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(firstContact?.id || null);

  const getChatKey = (id1: string, id2: string): string => {
    return [id1, id2].sort().join('-');
  }

  useEffect(() => {
    if (!session) {
      socketService.disconnect();
      return;
    }

    const handleNewMessage = (message: Message) => {
      const otherUserId = message.senderId === session.user.id ? getOtherUserId(message.chatKey, session.user.id) : message.senderId;
      const chatKey = getChatKey(session.user.id, otherUserId);

      setMessages(prev => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), message],
      }));
    };
    
    const handleInitialMessages = (initialMessages: Record<string, Message[]>) => {
      setMessages(initialMessages);
    };
    
    socketService.connect(session.user.id, session.serverUrl, handleNewMessage, handleInitialMessages)
      .catch(err => {
        console.error("Connection failed:", err);
        alert(`Verbindung zum Server fehlgeschlagen: ${err.message || 'Bitte prüfen Sie die URL und versuchen Sie es erneut.'}`);
        handleDisconnect(); // Go back to connection view on error
      });

    return () => {
      socketService.disconnect();
    };
  }, [session]);


  useEffect(() => {
    if (!session) return;
     // When the user switches, if they are viewing a chat with themselves,
    // switch the view to the first available contact.
    if (selectedContactId === session.user.id) {
       const newContactToSelect = ALL_USERS.find(u => u.id !== session.user.id);
       setSelectedContactId(newContactToSelect ? newContactToSelect.id : null);
    }
    // Automatically select the first contact if no contact is selected after a user switch
    if (!selectedContactId) {
        const firstContact = ALL_USERS.find(u => u.id !== session.user.id);
        if (firstContact) {
            setSelectedContactId(firstContact.id);
        }
    }
  }, [session?.user, selectedContactId]);

  const chatKey = selectedContactId && session ? getChatKey(session.user.id, selectedContactId) : null;

  useEffect(() => {
    if (!session) return;

    const establishKeys = async () => {
      const newKeys: Record<string, CryptoKey> = {};
      for (const user of ALL_USERS) {
        if (user.id !== session.user.id) {
          try {
            const key = await deriveSharedKey(session.user.privateKey, user.publicKey);
            const currentChatKey = getChatKey(session.user.id, user.id);
            newKeys[currentChatKey] = key;
          } catch(e) {
            console.error(`Could not derive key for user ${user.id}:`, e);
          }
        }
      }
      setSharedKeys(newKeys);
    };
    establishKeys();
  }, [session]);


  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
  };

  const handleDisconnect = () => {
    setSession(null);
    setMessages({});
    setSharedKeys({});
    setSelectedContactId(firstContact?.id || null);
  };

  const handleSendMessage = async (text: string) => {
    if (!chatKey || !selectedContactId || !session) return;
    
    const sharedKey = sharedKeys[chatKey];
    if (!sharedKey) {
        console.error("No shared key for this chat.");
        return;
    }

    const encryptedText = await encryptMessage(text, sharedKey);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: session.user.id,
      text: encryptedText,
      timestamp: Date.now(),
      status: MessageStatus.SENT,
      chatKey: chatKey,
    };
    
    socketService.sendMessage(newMessage, selectedContactId);

    setMessages(prev => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), newMessage],
      }));
  };

  const getOtherUserId = (chatKey: string, userId: string): string => {
    return chatKey.replace(userId, '').replace('-', '');
  }

  if (!session) {
    return <ConnectionView onConnect={(user, url) => setSession({ user, serverUrl: url })} allUsers={ALL_USERS} />;
  }

  const { user: currentUser } = session;
  const displayedContacts = ALL_USERS.filter(c => c.id !== currentUser.id);
  const selectedContact = ALL_USERS.find(c => c.id === selectedContactId);
  const selectedContactMessages = chatKey ? messages[chatKey] || [] : [];
  
  return (
    <div className="bg-slate-900 text-slate-300 h-screen w-screen flex antialiased">
      <div className={`w-full md:w-auto md:flex flex-col h-full ${selectedContactId ? 'hidden md:flex' : 'flex'}`}>
        <ContactList
          contacts={displayedContacts}
          messages={messages}
          selectedContactId={selectedContactId}
          onSelectContact={handleSelectContact}
          currentUser={currentUser}
          onDisconnect={handleDisconnect}
        />
      </div>
       <div className={`w-full h-full ${selectedContactId ? 'flex' : 'hidden md:flex'}`}>
        <ChatWindow
          contact={selectedContact}
          messages={selectedContactMessages}
          onSendMessage={handleSendMessage}
          currentUser={currentUser}
          sharedKey={chatKey ? sharedKeys[chatKey] : null}
        />
      </div>
    </div>
  );
}

export default App;