import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  MessageSquare,
  Send,
  Users,
  Hash,
  Volume2,
  Paperclip,
  Smile,
  Circle
} from 'lucide-react';
import { socket } from '../../components/Common/Navbar.jsx';

const Chat = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [activeChannel, setActiveChannel] = useState('general');
  const [typedMessage, setTypedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Channels state
  const channels = ['general', 'placement-alerts', 'coding-support'];

  // Messages lists seed
  const [messages, setMessages] = useState({
    general: [
      { sender: 'Mentor Rahul', text: 'Welcome to the cohort! Get started by updating your resume.', timestamp: '09:30 AM', role: 'mentor' },
      { sender: 'Sujan', text: 'Thanks Rahul! Ready to build projects.', timestamp: '09:32 AM', role: 'student' }
    ],
    'placement-alerts': [
      { sender: 'Recruiter Admin', text: 'Zoho Corporation has posted two new developer internships. Applied profiles will be audited tomorrow.', timestamp: '10:00 AM', role: 'recruiter' }
    ],
    'coding-support': [
      { sender: 'LeetCode Bot', text: 'Today\'s dynamic programming challenge is live on the dashboard.', timestamp: '08:00 AM', role: 'bot' }
    ]
  });

  const activeMessages = messages[activeChannel] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      sender: user?.name || 'Student',
      text: typedMessage,
      timestamp: timeString,
      role: 'student'
    };

    // Save in state
    const nextChannelMsgs = [...messages[activeChannel], userMsg];
    setMessages({ ...messages, [activeChannel]: nextChannelMsgs });
    setTypedMessage('');

    // Simulate socket broadcast
    if (socket) {
      socket.emit('client_chat_message', { channel: activeChannel, message: userMsg });
    }

    // Trigger AI / Mentor response simulations
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Got your message! Let me review this checkpoint with Rahul and get back to you.';
      if (activeChannel === 'coding-support') {
        replyText = 'Have you double-checked dynamic programming cache base cases? Make sure the memo array is initialized with -1.';
      } else if (activeChannel === 'placement-alerts') {
        replyText = 'Excellent! Shortlisted candidates will receive interview slots directly on the CareerOS Calendar.';
      }
      
      const replyMsg = {
        sender: activeChannel === 'coding-support' ? 'AI Code Mentor' : 'Recruiter Desk',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: activeChannel === 'coding-support' ? 'bot' : 'recruiter'
      };

      setMessages((prev) => ({
        ...prev,
        [activeChannel]: [...prev[activeChannel], replyMsg]
      }));
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans h-[calc(100vh-140px)] flex flex-col max-w-5xl">
      {/* Header info */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-855 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5.5 h-5.5 text-indigo-500" /> CareerOS Messaging Desk
        </h1>
      </div>

      {/* Main Panel */}
      <div className="flex-1 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden flex min-h-0">
        
        {/* Chat Channels Sidebar */}
        <aside className="w-56 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between p-4 shrink-0 bg-slate-50/20">
          <div className="space-y-5">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Rooms
              </span>
              <nav className="space-y-1">
                {channels.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setActiveChannel(ch)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeChannel === ch
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5" />
                    <span className="truncate">#{ch}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Active User list */}
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" /> Cohort Contacts
              </span>
              <div className="space-y-2 text-[11px] text-slate-650 dark:text-slate-350 font-medium">
                <div className="flex items-center gap-1.5">
                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
                  <span>Mentor Rahul</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
                  <span>Recruiter Admin</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Circle className="w-2 h-2 fill-slate-300 dark:fill-slate-700 text-slate-300 dark:text-slate-700" />
                  <span>Student Friend</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Messaging Desk */}
        <section className="flex-1 flex flex-col justify-between min-h-0 bg-transparent">
          {/* Channel Name bar */}
          <div className="px-5 py-3 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center bg-slate-50/10">
            <Hash className="w-4 h-4 text-indigo-500" />
            <span className="font-extrabold text-xs text-slate-800 dark:text-white uppercase ml-1">
              {activeChannel}
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
            {activeMessages.map((m, idx) => {
              const isMe = m.role === 'student';
              return (
                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mb-0.5">
                    <span>{m.sender}</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-indigo-650 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/30 dark:border-slate-850'
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-slate-400 font-semibold mb-1">desk is typing...</span>
                <div className="bg-slate-100 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200/30 text-xs text-slate-400 flex items-center gap-1 animate-pulse">
                  <span>typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sending bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex gap-3.5 items-center bg-slate-550/5">
            <button type="button" className="text-slate-400 hover:text-indigo-500">
              <Paperclip className="w-4.5 h-4.5" />
            </button>
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder={`Message #${activeChannel}...`}
              className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-slate-800 dark:text-slate-100"
            />
            <button type="button" className="text-slate-400 hover:text-indigo-500">
              <Smile className="w-4.5 h-4.5" />
            </button>
            <button
              type="submit"
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-md shadow-indigo-650/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>

      </div>
    </div>
  );
};

export default Chat;
