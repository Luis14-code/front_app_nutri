import React, { useState, useContext, useEffect, useRef } from 'react';
import { ChefHat, Send, Loader2 } from 'lucide-react';
import { AuthContext, DataContext } from '../utils/contexts';
import Button from '../components/ui/Button';
import { generateAIResponse } from '../utils/gemini';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const { recipes } = useContext(DataContext);
  const [messages, setMessages] = useState([
    { role: 'model', content: `Olá ${user?.name || ''}! Vi que você tem ${user?.nutrition?.caloriesTarget}kcal de meta. Quer ajuda para adaptar alguma receita com o que você tem na geladeira?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const userContext = {
      name: user.name,
      goal: user.nutrition?.goal,
      restrictions: 'Sem Glúten',
      caloriesTarget: user.nutrition?.caloriesTarget,
      proteinTarget: user.nutrition?.proteinTarget,
      carbsTarget: user.nutrition?.carbsTarget
    };

    const responseText = await generateAIResponse([...messages, userMsg], userContext, recipes);
    setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    setLoading(false);
  };

  const renderMessage = (text) => {
    const parts = text.split(/(\[Imagem:.*?\])/g);
    return parts.map((part, idx) => {
        if (part.startsWith('[Imagem:') && part.endsWith(']')) {
            const recipeName = part.replace('[Imagem:', '').replace(']', '').trim();
            return (
                <div key={idx} className="my-2 p-2 bg-gray-100 rounded-lg border border-gray-200 flex items-center gap-2 max-w-sm">
                    <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center text-xl">📸</div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Receita Sugerida</p>
                        <p className="text-sm font-medium text-gray-900">{recipeName}</p>
                    </div>
                </div>
            );
        }
        return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-sm">
                <ChefHat className="text-white w-5 h-5" />
             </div>
             <div>
                 <h2 className="font-bold text-gray-900">Nutri Assistant IA</h2>
                 <p className="text-xs text-green-600 flex items-center gap-1">Online • Adaptação de Receitas Ativa</p>
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        m.role === 'user' 
                        ? 'bg-gradient-to-br from-green-600 to-teal-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                           {renderMessage(m.content)}
                        </div>
                    </div>
                </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-white border px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4 text-green-600" /><span className="text-xs">Consultando banco de receitas...</span></div></div>}
            <div ref={scrollRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ex: Tenho 3 ovos e espinafre, o que posso fazer?" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50" />
            <Button onClick={handleSend} disabled={loading} className="px-6"><Send className="w-5 h-5" /></Button>
        </div>
    </div>
  );
};

export default ChatPage;
