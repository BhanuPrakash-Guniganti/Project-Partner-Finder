import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useToast } from '../context/ToastContext';
import { 
  HelpCircle, ChevronDown, ChevronUp, MessageSquare, 
  Send, Sparkles, CheckCircle2, ShieldCheck, ArrowLeft, BookOpen 
} from 'lucide-react';

const HelpSupport = () => {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [openFaq, setOpenFaq] = useState(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      q: "How does PartnerFinder calculate match compatibility scores?",
      a: "PartnerFinder uses Grok AI matching algorithms that analyze required project skills, candidate proficiency levels, technical role requirements, and availability to calculate real-time percentage scores."
    },
    {
      q: "How do I apply to join a project team?",
      a: "Navigate to Discover Projects, select any open project card, pick your target role (e.g. Frontend Developer), add an optional cover note, and click 'Apply to Join Team'. The project owner will instantly receive a notification."
    },
    {
      q: "How does the AI Resume Analyzer work?",
      a: "Upload your resume in PDF format. Grok AI parses your document, extracts technical skills, identifies missing proficiency gaps, calculates an overall resume score, and recommends ideal projects matching your profile."
    },
    {
      q: "Are group chats real-time?",
      a: "Yes! All project team group chats and 1-on-1 direct teammate messages use real-time Socket.IO websockets so messages arrive instantly without refreshing the page."
    }
  ];

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setTicketSubject('');
      setTicketMsg('');
      showSuccess('Support ticket submitted! Our team will respond shortly.');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full min-w-0 flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-gray-800 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <span>Help & Support Hub</span>
            </h1>
            <p className="text-xs text-gray-400">Frequently asked questions, platform guides, and direct support</p>
          </div>
        </div>

        {/* System Health Status */}
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between min-w-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-emerald-300">All PartnerFinder Services Operational</div>
              <div className="text-[10px] text-emerald-400/80">API Gateway, Socket.IO WebSockets & Grok AI Online</div>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        </div>

        {/* Section 1: FAQ Accordions */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <h3>Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3 pt-1">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-800 bg-gray-900/40 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full p-3.5 text-left text-xs font-semibold text-white flex items-center justify-between gap-2"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-3.5 pt-0 text-xs text-gray-400 leading-relaxed border-t border-gray-800/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Contact / Ticket Form */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <MessageSquare className="w-4 h-4" />
            <h3>Contact Support Team</h3>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-3 pt-1">
            <input
              type="text"
              required
              placeholder="Subject / Issue Summary"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <textarea
              rows="4"
              required
              placeholder="Describe your question or issue in detail..."
              value={ticketMsg}
              onChange={(e) => setTicketMsg(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="gradient-btn w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Ticket...' : 'Submit Support Request'}</span>
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpSupport;
