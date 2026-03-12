
import React, { useState } from 'react';
import { Send, Search, Phone, Video, MoreVertical, CheckCheck } from 'lucide-react';

const mockChats = [
  { id: 1, name: 'Dr. Ricardo Silva', lastMsg: 'Combinado, amanhã às 10h.', time: '14:20', unread: 0, online: true, avatar: 'https://picsum.photos/201' },
  { id: 2, name: 'Dra. Maria Antónia', lastMsg: 'Podes enviar o PDF do exame?', time: 'Ontem', unread: 2, online: false, avatar: 'https://picsum.photos/202' },
  { id: 3, name: 'EduPrep Suporte', lastMsg: 'O seu pagamento foi confirmado.', time: 'Terça', unread: 0, online: true, avatar: 'https://picsum.photos/205' },
];

const Messages: React.FC = () => {
  const [activeChat, setActiveChat] = useState<any>(mockChats[0]);
  const [msg, setMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([
    { text: 'Olá professor, já comecei a estudar as funções.', sender: 'me', time: '14:15' },
    { text: 'Excelente! Tens alguma dúvida específica?', sender: 'them', time: '14:18' },
    { text: 'Combinado, amanhã às 10h.', sender: 'them', time: '14:20' },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setChatHistory([...chatHistory, { text: msg, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMsg('');
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Contact List */}
      <aside className={`w-full md:w-80 flex-col border-r border-gray-100 ${activeChat && 'hidden md:flex'}`}>
        <div className="p-6">
          <h1 className="text-xl font-bold mb-4">Mensagens</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar conversas..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mockChats.map((chat) => (
            <button 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors ${activeChat?.id === chat.id ? 'bg-indigo-50/50' : ''}`}
            >
              <div className="relative">
                <img src={chat.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                {chat.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 text-left">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-sm">{chat.name}</span>
                  <span className="text-[10px] text-gray-400">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 truncate w-40">{chat.lastMsg}</p>
                  {chat.unread > 0 && <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{chat.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Area */}
      <section className={`flex-1 flex flex-col bg-gray-50 ${!activeChat && 'hidden md:flex'}`}>
        {activeChat ? (
          <>
            <header className="p-4 md:p-6 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveChat(null)} className="md:hidden text-gray-400 p-2">←</button>
                <img src={activeChat.avatar} className="w-10 h-10 rounded-xl" alt="" />
                <div>
                  <h3 className="font-bold text-sm">{activeChat.name}</h3>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">{activeChat.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Phone className="w-5 h-5" /></button>
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Video className="w-5 h-5" /></button>
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((item, i) => (
                <div key={i} className={`flex ${item.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${item.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                    <p className="text-sm leading-relaxed">{item.text}</p>
                    <div className={`flex items-center gap-1 mt-1 justify-end ${item.sender === 'me' ? 'text-white/60' : 'text-gray-400'}`}>
                      <span className="text-[10px]">{item.time}</span>
                      {item.sender === 'me' && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 md:p-6 bg-white border-t border-gray-100">
              <div className="relative">
                <input 
                  type="text" 
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Escreva a sua mensagem..." 
                  className="w-full p-4 pr-14 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
              <Send className="w-10 h-10 -rotate-45" />
            </div>
            <h2 className="text-xl font-bold mb-2">As suas mensagens</h2>
            <p className="text-gray-400 max-w-xs">Selecione uma conversa para começar a falar com os seus tutores.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Messages;
