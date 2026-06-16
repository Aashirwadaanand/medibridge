import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle2, Bot, HelpCircle, HeartHandshake, AlertCircle, Sparkles, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import aiService from '../services/aiService';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  structured?: {
    summary: string;
    possibleCauses: string[];
    riskLevel: 'Low' | 'Moderate' | 'Critical';
    recommendations: string[];
    suggestedTests: string[];
    score?: number;
  };
}

type RiskLevel = 'UNKNOWN' | 'LOW' | 'MODERATE' | 'CRITICAL';

export const SymptomChecker: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'bot',
      text: 'Hello, I am the MEDIBRIDGE AI Triage Assistant. Please describe the symptoms you are experiencing (e.g., chest pain, fever, throat congestion) and I will perform an immediate diagnostic risk evaluation.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingStep, setTypingStep] = useState('');
  
  // Right-side Active Risk State
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('UNKNOWN');
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [riskDetails, setRiskDetails] = useState<string>('Describe symptoms to begin analysis');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const runStepByStepAnimation = (steps: string[], callback: () => void) => {
    let index = 0;
    setTypingStep(steps[0]);
    
    const interval = setInterval(() => {
      index++;
      if (index < steps.length) {
        setTypingStep(steps[index]);
      } else {
        clearInterval(interval);
        callback();
      }
    }, 900);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const queryText = inputText;
    const userMsg: Message = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const animationSteps = [
      'Mapping symptomatic indicators against clinical index...',
      'Correlating cardiovascular & physiological vitals telemetry...',
      'Synthesizing diagnostic risk level estimates...'
    ];

    runStepByStepAnimation(animationSteps, async () => {
      try {
        // Parallel calls to backend AI Layer (Live Gemini or simulated depending on mode)
        const [symptomsRes, riskRes] = await Promise.all([
          aiService.analyzeSymptoms(queryText),
          aiService.calculateRiskScore(queryText, { heartRate: 72, oxygen: 98 })
        ]);

        // Update Right-side active risk panels
        setRiskLevel(riskRes.level.toUpperCase() as RiskLevel);
        setRiskScore(riskRes.score);
        setRiskFactors(riskRes.primaryRiskFactors);
        setRiskDetails(riskRes.details);

        const botMsg: Message = {
          id: `msg_bot_${Date.now()}`,
          sender: 'bot',
          text: symptomsRes.summary,
          timestamp: new Date(),
          structured: {
            summary: symptomsRes.summary,
            possibleCauses: symptomsRes.possibleCauses,
            riskLevel: symptomsRes.riskLevel,
            recommendations: symptomsRes.recommendations,
            suggestedTests: symptomsRes.suggestedTests || [],
            score: riskRes.score
          }
        };

        setMessages(prev => [...prev, botMsg]);
      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, {
          id: `msg_bot_err_${Date.now()}`,
          sender: 'bot',
          text: 'Sorry, I encountered an issue compiling AI triage results. Please try again.',
          timestamp: new Date()
        }]);
      } finally {
        setIsTyping(false);
        setTypingStep('');
      }
    });
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'MODERATE':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'LOW':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans">AI Symptom Checker</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">Analyze symptoms, review possible conditions, and view active risk triage panels.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] text-[10px] font-bold uppercase tracking-wider rounded-full h-fit">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Clinical Triage Assistant Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat Stream (Left 2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 flex flex-col overflow-hidden h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-slate-900/40 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Clinical Triage Bot</h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Online Triage AI
              </p>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isBot 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}>
                      {isBot ? 'AI' : 'PT'}
                    </div>
                    
                    <div className="max-w-[85%] space-y-2">
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isBot 
                          ? 'bg-slate-900/60 border border-white/5 text-slate-300 rounded-tl-none' 
                          : 'bg-cyan-900/20 border border-cyan-500/10 text-slate-200 rounded-tr-none'
                      }`}>
                        <p className="font-sans whitespace-pre-wrap">{msg.text}</p>
                        
                        {/* Structured Output Layout (Only for AI responses) */}
                        {isBot && msg.structured && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                            {/* Possible conditions & Risk */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Possible Conditions</span>
                                <ul className="space-y-1 list-disc list-inside text-slate-300 text-[10px]">
                                  {msg.structured.possibleCauses.map((c, i) => (
                                    <li key={i}>{c}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Risk Assessment</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider w-fit mt-1.5 ${
                                  msg.structured.riskLevel === 'Critical' 
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                                    : msg.structured.riskLevel === 'Moderate'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                  {msg.structured.riskLevel} Risk
                                </span>
                              </div>
                            </div>

                            {/* Recommendations */}
                            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Recommendations & Actions</span>
                              <ul className="space-y-1 text-slate-300 text-[10px]">
                                {msg.structured.recommendations.map((r, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450 flex-shrink-0 mt-0.5" />
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Suggested Tests */}
                            {msg.structured.suggestedTests && msg.structured.suggestedTests.length > 0 && (
                              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Suggested Tests</span>
                                <ul className="space-y-1 text-slate-300 text-[10px]">
                                  {msg.structured.suggestedTests.map((t, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />
                                      <span>{t}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        <span className="text-[8px] text-slate-500 mt-1.5 block font-mono">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold">
                    AI
                  </div>
                  <div className="bg-slate-900/60 border border-white/5 p-3.5 rounded-2xl rounded-tl-none text-slate-400 text-xs font-mono space-y-2 max-w-[80%]">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Analyzing Report Logs</span>
                    </div>
                    <p className="text-[10px] text-slate-500 animate-pulse leading-normal">{typingStep}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-slate-950/40 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe symptoms (e.g., chest tightness, heart flutter, dry cough)..."
              disabled={isTyping}
              className="flex-1 glass-input py-2.5 text-xs bg-[#070b13] border-white/10"
              required
            />
            <button
              type="submit"
              disabled={isTyping || !inputText.trim()}
              className="p-2.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Diagnostics Triage State (Right 1 col) */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full">
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
            <div className="border-b border-white/5 pb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Active Risk State</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Real-time triage telemetry</p>
            </div>

            {/* Risk Indicator Badge */}
            <div className={`p-4 rounded-xl border text-center font-sans ${getRiskColor(riskLevel)}`}>
              <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-400">Assessed Risk Level</span>
              <span className="text-lg font-black tracking-widest mt-1 block">{riskLevel}</span>
              {riskScore !== null && (
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <Activity className="w-4 h-4 text-slate-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200 font-mono">Severity: {riskScore}/100</span>
                </div>
              )}
            </div>

            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <div className="space-y-2 bg-white/[0.01] p-3 rounded-xl border border-white/5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Risk Factors</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {riskFactors.map((f, i) => (
                    <span key={i} className="text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold uppercase font-sans">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Explanation */}
            <div className="space-y-3 pt-2 text-xs font-sans">
              <div className="flex gap-2.5 items-start">
                <HelpCircle className="w-4.5 h-4.5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-[11px] font-bold text-slate-300">How it works</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    The AI checks your symptom inputs against cardiac, respiratory, and standard viral descriptors to triage severity.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start border-t border-white/[0.03] pt-3">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-[11px] font-bold text-slate-300">Clinical Directive</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    {riskDetails}
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start border-t border-white/[0.03] pt-3">
                <AlertCircle className="w-4.5 h-4.5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-[11px] font-bold text-slate-500">Disclaimer</h5>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">
                    This information is educational and not a substitute for professional medical advice.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Consultation Booking Shortcut */}
          <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.02] space-y-3 font-sans">
            <div className="flex items-center gap-2 text-cyan-400">
              <HeartHandshake className="w-4.5 h-4.5" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Need Support?</h4>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              If your symptoms persist, connect with a medical expert instantly or review your consultations queue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
