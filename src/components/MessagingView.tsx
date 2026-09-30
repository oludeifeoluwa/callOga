import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Check,
  CheckCheck,
  ArrowLeft,
  Briefcase,
  MapPin,
  ExternalLink,
  Phone,
  MessageSquare
} from 'lucide-react';
import { storage } from '../lib/storage';
import { Conversation, Message } from '../types';

interface MessagingViewProps {
  initialConversationId?: string;
  onNavigate: (view: string, data?: any) => void;
  onBack: () => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  initialConversationId,
  onNavigate,
  onBack
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => storage.getConversations());
  const [activeConvId, setActiveConvId] = useState<string>(
    initialConversationId || (conversations.length > 0 ? conversations[0].id : '')
  );
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = storage.getCurrentUser();

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setConversations(storage.getConversations());
      if (activeConvId) {
        setMessages(storage.getMessages(activeConvId));
      }
    });
    return unsub;
  }, [activeConvId]);

  useEffect(() => {
    if (activeConvId) {
      setMessages(storage.getMessages(activeConvId));
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvId) return;

    storage.sendMessage(activeConvId, messageText.trim());
    setMessageText('');
  };

  return (
    <div id="messaging-container" className="pb-28 pt-2 max-w-5xl mx-auto px-4 h-[calc(100vh-140px)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-stone-200 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="md:hidden p-1.5 rounded-xl bg-white border border-stone-200 text-stone-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#0B0B0F]">Direct Messages</h1>
            <p className="text-[11px] text-stone-500">Live communication between customer & artisan</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Conversations List (Sidebar on desktop) */}
        <div
          className={`w-full md:w-80 border-r border-stone-200 bg-stone-50/50 flex flex-col ${
            activeConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b border-stone-200 font-bold text-xs text-stone-600 uppercase tracking-wider">
            Conversations ({conversations.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">
                No active messages yet. Connect with an artisan to chat.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                const otherPartyName =
                  currentUser?.role === 'customer'
                    ? conv.artisan.user.fullName
                    : conv.customer.fullName;
                const otherPartyAvatar =
                  currentUser?.role === 'customer'
                    ? conv.artisan.user.avatarUrl
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full p-3 flex items-center gap-3 text-left transition-colors ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-[#2563EB]' : 'hover:bg-stone-100/70'
                    }`}
                  >
                    <img
                      src={otherPartyAvatar}
                      alt={otherPartyName}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#0B0B0F] truncate">
                          {otherPartyName}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {conv.lastMessage || 'Started a conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Active Conversation Chat Window */}
        {activeConversation ? (
          <div className={`flex-1 flex flex-col ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
            {/* Chat Topbar */}
            <div className="p-3 border-b border-stone-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConvId('')}
                  className="md:hidden p-1 text-stone-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <img
                  src={
                    currentUser?.role === 'customer'
                      ? activeConversation.artisan.user.avatarUrl
                      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                  }
                  alt="Avatar"
                  className="w-9 h-9 rounded-xl object-cover border border-stone-200"
                />
                <div>
                  <h3 className="font-bold text-xs text-[#0B0B0F]">
                    {currentUser?.role === 'customer'
                      ? activeConversation.artisan.user.fullName
                      : activeConversation.customer.fullName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    <span>
                      {currentUser?.role === 'customer'
                        ? activeConversation.artisan.headlineTitle
                        : activeConversation.customer.area}
                    </span>
                  </div>
                </div>
              </div>

              {activeConversation.jobId && (
                <button
                  onClick={() => onNavigate('job_tracking', { jobId: activeConversation.jobId })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-xl text-xs font-bold transition-colors border border-blue-200"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>View Job</span>
                </button>
              )}
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F8FA]">
              {messages.map((m) => {
                const isMe = m.senderId === currentUser?.id;

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-[#2563EB] text-white rounded-br-xs'
                          : 'bg-white text-[#0B0B0F] border border-stone-200 rounded-bl-xs'
                      }`}
                    >
                      <p>{m.message}</p>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-400 px-1">
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-[#2563EB]" />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 py-2.5 px-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-medium text-[#0B0B0F] focus:outline-none focus:border-[#F97316]"
              />

              <button
                type="submit"
                disabled={!messageText.trim()}
                className="w-10 h-10 rounded-2xl bg-[#F97316] hover:bg-orange-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-2xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-center p-8 text-stone-400 text-xs">
            Select a conversation on the left to start messaging
          </div>
        )}
      </div>
    </div>
  );
};
