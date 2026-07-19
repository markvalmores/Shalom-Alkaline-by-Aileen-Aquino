import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Chat, Message, User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Users, Hash, Loader2, ArrowLeft, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Messenger() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!activeChat) return;
    const q = query(collection(db, 'chats', activeChat.id, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });
    return () => unsubscribe();
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !user) return;
    
    const msg = newMessage;
    setNewMessage('');
    
    try {
      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
        chatId: activeChat.id,
        senderId: user.uid,
        senderName: user.displayName,
        text: msg,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'chats', activeChat.id), {
        lastMessage: msg,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const createGroupChat = async () => {
    if (!user) return;
    const name = prompt('Group Name?');
    if (!name) return;
    
    try {
      await addDoc(collection(db, 'chats'), {
        name,
        participants: [user.uid],
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading chats...</div>;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-64px)] flex overflow-hidden border-x border-tea-green/20">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-tea-green/20 bg-white flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-tea-green/20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-violet-deep flex items-center gap-2">
            <Users className="w-5 h-5" /> Chats
          </h2>
          <button 
            onClick={createGroupChat}
            className="p-2 hover:bg-violet-50 text-violet-primary rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-tea-green/5 transition-colors border-b border-tea-green/5 ${activeChat?.id === chat.id ? 'bg-tea-green/10' : ''}`}
            >
              <div className="w-12 h-12 bg-violet-soft/50 rounded-full flex items-center justify-center text-violet-primary font-bold">
                {chat.name?.[0] || <Hash className="w-6 h-6" />}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-800 truncate">{chat.name || 'Group Chat'}</p>
                <p className="text-xs text-slate-500 truncate">{chat.lastMessage || 'No messages yet'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col bg-slate-50/50 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            <div className="p-4 bg-white border-b border-tea-green/20 flex items-center gap-4">
              <button onClick={() => setActiveChat(null)} className="md:hidden p-2">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-violet-soft/50 rounded-full flex items-center justify-center text-violet-primary font-bold">
                {activeChat.name?.[0] || <Hash className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{activeChat.name || 'Group Chat'}</h3>
                <p className="text-xs text-green-600 font-medium">{activeChat.participants.length} members</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.senderId === user?.uid ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex flex-col ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-300">
                        {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : ''}
                      </span>
                    </div>
                    <div className={`max-w-md px-4 py-2 rounded-2xl text-sm shadow-sm ${
                      msg.senderId === user?.uid 
                        ? 'bg-violet-primary text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-tea-green/20 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-tea-green/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-100 border-none rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-violet-primary/20 focus:bg-white transition-all"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-violet-primary text-white rounded-full hover:bg-violet-deep transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a chat to start saturating the sea of visions</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Missing import fix
import { updateDoc as firestoreUpdateDoc } from 'firebase/firestore';
const updateDoc = firestoreUpdateDoc;
