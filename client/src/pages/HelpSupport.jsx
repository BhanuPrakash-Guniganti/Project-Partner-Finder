import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { submitSupportTicket } from '../services/api';
import { 
  HelpCircle, ChevronDown, ChevronUp, MessageSquare, 
  Send, Sparkles, CheckCircle2, ShieldCheck, ArrowLeft, BookOpen,
  User, Mail, AlertCircle, Loader2
} from 'lucide-react';

const HelpSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [openFaq, setOpenFaq] = useState(0);

  const [senderName, setSenderName] = useState(user?.name || '');
  const [senderEmail, setSenderEmail] = useState(user?.email || '');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (user) {
      if (!senderName) setSenderName(user.name || '');
      if (!senderEmail) setSenderEmail(user.email || '');
    }
  }, [user]);

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

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!senderName.trim()) {
      showError('Please enter your name.');
      return;
    }
    if (!senderEmail.trim() || !senderEmail.includes('@')) {
      showError('Please enter a valid email address.');
      return;
    }
    if (!ticketSubject.trim()) {
      showError('Please enter a subject.');
      return;
    }
    if (!ticketMsg.trim()) {
      showError('Please enter your message.');
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await submitSupportTicket({
        name: senderName.trim(),
        email: senderEmail.trim(),
        subject: ticketSubject.trim(),
        message: ticketMsg.trim()
      });

      showSuccess(res.data?.message || 'Support request delivered to connectwithguniganti@gmail.com');
      setStatusMessage({
        type: 'success',
        text: res.data?.message || 'Your support request has been delivered to connectwithguniganti@gmail.com. We will get back to you shortly!'
      });
      setTicketSubject('');
      setTicketMsg('');
    } catch (err) {
      console.error('[Support Submit Error]', err);
      const errMsg = err.response?.data?.message || 'Failed to submit support request. Please try again.';
      showError(errMsg);
      setStatusMessage({
        type: 'error',
        text: errMsg
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-x-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-36 sm:pb-24 md:pb-12 pb-[calc(8rem+env(safe-area-inset-bottom))] w-full min-w-0 flex-1 space-y-6">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <MessageSquare className="w-4 h-4" />
              <h3>Contact Support Team</h3>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-gray-400 bg-gray-900/90 px-3 py-1 rounded-full border border-gray-800 w-fit">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Direct to: <strong className="text-gray-200">connectwithguniganti@gmail.com</strong></span>
            </div>
          </div>

          {statusMessage && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 animate-fadeIn ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-3.5 pt-1">
            {/* Sender Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>Your Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>Your Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@example.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-300">Subject / Issue Summary *</label>
              <input
                type="text"
                required
                placeholder="e.g. Inquiry regarding team recruitment or project collaboration"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-300">Detailed Message *</label>
              <textarea
                rows="4"
                required
                placeholder="Describe your question, request, or issue in detail..."
                value={ticketMsg}
                onChange={(e) => setTicketMsg(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="gradient-btn w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-transform active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Delivering Support Message...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message to Support</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpSupport;
