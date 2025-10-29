import React, { useState } from 'react';
import { User } from '../types.ts';
import { INITIAL_USER } from '../constants.ts';

interface ConnectionViewProps {
    onConnect: (user: User, url: string) => void;
    allUsers: User[];
}

export const ConnectionView: React.FC<ConnectionViewProps> = ({ onConnect, allUsers }) => {
    const [selectedUser, setSelectedUser] = useState<User>(INITIAL_USER);
    const [urlInput, setUrlInput] = useState<string>('ws://localhost:8080');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // A short delay to give feedback, as connection is handled in App.tsx
        setTimeout(() => {
             onConnect(selectedUser, urlInput);
             // isLoading will remain true until App unmounts this component
        }, 250);
    }

    return (
        <div className="w-screen h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 text-slate-200 rounded-2xl shadow-xl p-8 border border-slate-700">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Gemini Secure Messenger</h1>
                    <p className="text-slate-400 mt-2">Sicher verbinden</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="user-select" className="block text-sm font-medium text-slate-300 mb-2">
                            1. Wer sind Sie?
                        </label>
                        <select
                            id="user-select"
                            value={selectedUser.id}
                            onChange={(e) => {
                                const user = allUsers.find(u => u.id === e.target.value);
                                if (user) setSelectedUser(user);
                            }}
                             className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            {allUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="server-url" className="block text-sm font-medium text-slate-300 mb-2">
                            2. Geben Sie Ihre Server-URL ein
                        </label>
                        <input
                            id="server-url"
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="z.B. wss://mein-server.onrender.com"
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                         <p className="text-xs text-slate-500 mt-2">
                            Dies ist die Adresse Ihres gehosteten `server.js`-Backends. Für lokale Tests ist `ws://localhost:8080` korrekt.
                        </p>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-sky-600 text-white font-semibold py-3 rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-wait flex items-center justify-center"
                    >
                        {isLoading ? 'Verbinde...' : 'Verbinden und Chat starten'}
                    </button>
                </form>
            </div>
        </div>
    );
}