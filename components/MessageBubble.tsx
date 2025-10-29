import React, { useState, useEffect } from 'react';
import { Message, MessageStatus } from '../types.ts';
import { CheckIcon, DoubleCheckIcon, ClockIcon, XCircleIcon, LockIcon } from './icons.tsx';
import { decryptMessage } from '../services/cryptoService.ts';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  sharedKey: CryptoKey | null;
}

const MessageStatusIndicator: React.FC<{ status: MessageStatus }> = ({ status }) => {
  switch (status) {
    case MessageStatus.SENDING:
      return <ClockIcon className="h-4 w-4 text-slate-400" />;
    case MessageStatus.SENT:
      return <CheckIcon className="h-4 w-4 text-slate-400" />;
    case MessageStatus.DELIVERED:
      return <DoubleCheckIcon className="h-4 w-4 text-slate-400" />;
    case MessageStatus.READ:
      return <DoubleCheckIcon className="h-4 w-4 text-sky-400" />;
    case MessageStatus.ERROR:
       return <XCircleIcon className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId, sharedKey }) => {
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState<boolean>(true);

  useEffect(() => {
    const decrypt = async () => {
      if (sharedKey && message.text) {
        setIsDecrypting(true);
        try {
          const text = await decryptMessage(message.text, sharedKey);
          setDecryptedText(text);
        } catch (error) {
          console.error("Failed to decrypt message:", error);
          setDecryptedText("Fehler beim Entschlüsseln...");
        } finally {
          setIsDecrypting(false);
        }
      } else if (!message.text) {
          setDecryptedText("");
          setIsDecrypting(false);
      }
    };

    decrypt();
  }, [message.text, sharedKey]);

  const isCurrentUser = message.senderId === currentUserId;

  const bubbleClasses = isCurrentUser
    ? 'bg-sky-600 text-white self-end rounded-br-none'
    : 'bg-slate-700 text-slate-200 self-start rounded-bl-none';

  const time = new Date(message.timestamp).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${bubbleClasses}`}>
        {isDecrypting ? (
            <p className="italic text-slate-400">Entschlüsseln...</p>
        ) : (
             <p className="break-words">{decryptedText}</p>
        )}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-70">{time}</span>
          {isCurrentUser && <MessageStatusIndicator status={message.status} />}
        </div>
      </div>
    </div>
  );
};