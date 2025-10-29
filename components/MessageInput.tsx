import React, { useState, useCallback } from 'react';
import { AIFeature } from '../types.ts';
import { SparklesIcon, SendIcon } from './icons.tsx';
import * as geminiService from '../services/geminiService.ts';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  conversationContext: any[];
}

const AIFeatureButton: React.FC<{ onClick: () => void; children: React.ReactNode; disabled: boolean }> = ({ onClick, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
        {children}
    </button>
);

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, conversationContext }) => {
  const [text, setText] = useState('');
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [hasFetchedReplies, setHasFetchedReplies] = useState(false);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
      setSmartReplies([]);
      setHasFetchedReplies(false);
    }
  };

  const handleAiAction = useCallback(async (action: AIFeature) => {
    setIsLoadingAi(true);
    setIsAiMenuOpen(false);
    try {
        switch(action) {
            case AIFeature.SMART_REPLY:
                const replies = await geminiService.getSmartReplies(conversationContext);
                setSmartReplies(replies);
                setHasFetchedReplies(true);
                break;
            case AIFeature.REWRITE_FORMAL:
                if(text) setText(await geminiService.rewriteMessage(text, 'formeller'));
                break;
            case AIFeature.REWRITE_CASUAL:
                if(text) setText(await geminiService.rewriteMessage(text, 'legerer'));
                break;
        }
    } finally {
        setIsLoadingAi(false);
    }
  }, [conversationContext, text]);

  const useSmartReply = (reply: string) => {
      onSendMessage(reply);
      setSmartReplies([]);
      setHasFetchedReplies(false);
  }

  return (
    <div className="bg-slate-800 p-4 border-t border-slate-700">
        {smartReplies.length > 0 && (
             <div className="flex gap-2 mb-3">
                {smartReplies.map((reply, i) => (
                    <button key={i} onClick={() => useSmartReply(reply)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-full transition-colors">
                        {reply}
                    </button>
                ))}
             </div>
        )}
      <div className="relative flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
            className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-sky-400 transition-colors"
          >
            <SparklesIcon className="h-6 w-6" />
          </button>
          {isAiMenuOpen && (
            <div className="absolute bottom-full mb-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 overflow-hidden">
                <AIFeatureButton onClick={() => handleAiAction(AIFeature.SMART_REPLY)} disabled={isLoadingAi || conversationContext.length === 0}>
                    {AIFeature.SMART_REPLY}
                </AIFeatureButton>
                <AIFeatureButton onClick={() => handleAiAction(AIFeature.REWRITE_FORMAL)} disabled={isLoadingAi || !text}>
                    {AIFeature.REWRITE_FORMAL}
                </AIFeatureButton>
                <AIFeatureButton onClick={() => handleAiAction(AIFeature.REWRITE_CASUAL)} disabled={isLoadingAi || !text}>
                    {AIFeature.REWRITE_CASUAL}
                </AIFeatureButton>
            </div>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="flex-1">
            <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nachricht schreiben..."
            className="w-full bg-slate-700 text-slate-200 rounded-full py-2.5 px-5 focus:outline-none focus:ring-2 focus:ring-sky-500"
            disabled={isLoadingAi}
            />
        </form>
        <button
          onClick={() => handleSendMessage()}
          className="bg-sky-600 text-white p-2.5 rounded-full hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
          disabled={!text.trim() || isLoadingAi}
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};