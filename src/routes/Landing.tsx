import { 
  ArrowRightIcon, 
  CheckIcon, 
  ChevronDownIcon,
  CloudArrowUpIcon,
  FolderIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && session) {
      const timer = setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
          if (error) {
            console.error('Error checking session:', error);
            return;
          }
          if (currentSession && currentSession.user && currentSession.expires_at) {
            const expiresAt = currentSession.expires_at * 1000;
            if (expiresAt > Date.now()) {
              navigate('/dashboard');
            }
          }
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, session, loading, navigate]);

  const faqs = [
    {
      question: 'How does pricing work?',
      answer: 'Free tier gives you full access with 10 guideline uploads. If you need more, Pro is $5/month or $25/year for unlimited uploads.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. Files are encrypted in transit and at rest, stored on Australian servers. Only you can access them.',
    },
    {
      question: 'What file types can I upload?',
      answer: 'PDFs, Word documents (.doc, .docx), and images (PNG, JPG). Most clinical guidelines and reference materials work perfectly.',
    },
    {
      question: 'Can I access my documents offline?',
      answer: 'Documents are stored online for access from any device. You can view them in your browser without downloading.',
    },
    {
      question: 'What happens if I cancel Pro?',
      answer: 'You keep access to everything you\'ve uploaded. You can still view and organise, but new uploads are limited to the free tier.',
    },
    {
      question: 'Do I need to install anything?',
      answer: 'No. MedSnap works entirely in your browser. Just sign up and start uploading.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header - Simple Navigation */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="MedSnap" className="h-7 w-7 sm:h-8 sm:w-8" />
          <span className="text-base sm:text-lg font-semibold text-brand-500">MedSnap</span>
        </div>
        <button
          onClick={() => { setAuthMode('signin'); setAuthModalOpen(true); }}
          className="text-xs sm:text-sm font-medium text-slate-300 hover:text-brand-400"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section - Literal, clear, one CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 md:pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 leading-tight">
            Store and find your clinical documents
          </h1>
          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-lg sm:text-xl md:text-2xl text-slate-300 leading-relaxed">
            Upload PDFs, screenshots, and reference documents. Organise them by category. Find them instantly when you need them.
          </p>
          <div className="mt-8 sm:mt-10">
            <button
              onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl font-bold text-white shadow-lg transition hover:bg-brand-700 active:scale-95"
            >
              Try MedSnap — free
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-400">10 free uploads • No credit card required</p>
          </div>
        </div>

        {/* Product Demo - Show immediately */}
        <div className="mt-12 sm:mt-16 mx-auto max-w-6xl">
          <div className="relative rounded-xl border border-slate-700 bg-slate-800 p-2 shadow-lg pointer-events-none select-none">
            <div className="absolute top-3 right-3 z-10 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded px-2 py-1 flex items-center gap-1.5">
              <EyeIcon className="h-3 w-3 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">Preview</span>
            </div>
            <div className="rounded-lg bg-slate-900 p-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-brand-600" />
                  <span className="text-sm font-semibold text-brand-500">MedSnap</span>
                </div>
                <div className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold">
                  <PlusIcon className="h-3 w-3" />
                  Upload
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-32 rounded-lg bg-slate-800 border border-slate-700 p-2 space-y-1.5 hidden md:block">
                  <div className="text-[10px] font-semibold uppercase text-slate-500 mb-1">Categories</div>
                  <div className="text-xs text-brand-400 bg-brand-900/50 px-2 py-1 rounded">All (12)</div>
                  <div className="text-xs text-slate-300 px-2 py-1 rounded">Cardiology (4)</div>
                  <div className="text-xs text-slate-300 px-2 py-1 rounded">Emergency (3)</div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-2 py-1.5">
                    <MagnifyingGlassIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-400">Search by title...</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="rounded-lg bg-slate-800 border border-slate-700 p-2">
                      <div className="aspect-[4/3] rounded bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-900/30 mb-1.5 flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6 text-red-500/50" />
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 truncate">STEMI Pathway</h4>
                      <p className="text-[10px] text-slate-500">Cardiology • PDF</p>
                    </div>
                    <div className="rounded-lg bg-slate-800 border border-slate-700 p-2">
                      <div className="aspect-[4/3] rounded bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-900/30 mb-1.5 flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6 text-blue-500/50" />
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 truncate">Sepsis Bundle</h4>
                      <p className="text-[10px] text-slate-500">Emergency • PDF</p>
                    </div>
                    <div className="rounded-lg bg-slate-800 border border-slate-700 p-2 hidden sm:block">
                      <div className="aspect-[4/3] rounded bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-900/30 mb-1.5 flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6 text-emerald-500/50" />
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 truncate">Asthma Protocol</h4>
                      <p className="text-[10px] text-slate-500">Paediatrics • PDF</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem - User's words */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-6 sm:mb-8 text-center">
          I can never find that PDF when I need it
        </h2>
        <div className="space-y-4 text-lg sm:text-xl text-slate-300 leading-relaxed">
          <p>
            You saved that sepsis protocol somewhere. But where? Downloads? Bookmarks? Email? That folder you created last month?
          </p>
          <p>
            You know you'll need it again, but every time you search for it, you waste minutes digging through folders, browser history, or re-Googling the same thing.
          </p>
        </div>
      </section>

      {/* Solution */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-6 sm:mb-8 text-center">
          MedSnap keeps everything in one place
        </h2>
        <div className="space-y-4 text-lg sm:text-xl text-slate-300 leading-relaxed">
          <p>
            Upload your clinical documents once. Organise them by category. Find them instantly with search.
          </p>
          <p>
            No more digging through folders or browser history. Everything you need is right here, accessible from any device.
          </p>
        </div>
        <div className="mt-8 grid sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-lg bg-brand-600/20 p-3 mb-3">
              <CloudArrowUpIcon className="h-6 w-6 text-brand-400" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-2">Upload</h3>
            <p className="text-sm text-slate-400">PDFs, Word docs, images</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-lg bg-brand-600/20 p-3 mb-3">
              <FolderIcon className="h-6 w-6 text-brand-400" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-2">Organise</h3>
            <p className="text-sm text-slate-400">By category</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-lg bg-brand-600/20 p-3 mb-3">
              <MagnifyingGlassIcon className="h-6 w-6 text-brand-400" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-2">Find</h3>
            <p className="text-sm text-slate-400">Instantly with search</p>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-6 sm:mb-8 text-center">
          Who this is for
        </h2>
        <div className="space-y-3 text-lg sm:text-xl text-slate-300">
          <div className="flex items-start gap-3">
            <span className="text-brand-500 text-xl">•</span>
            <p>Clinicians who screenshot guidelines or protocols</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-brand-500 text-xl">•</span>
            <p>Anyone tired of re-Googling the same documents</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-brand-500 text-xl">•</span>
            <p>People who want something simpler than folders or Notion</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-6 sm:mb-8 text-center">
          What you get
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">Upload PDFs, Word docs, and images</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">Organise by custom categories</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">Search by title and notes</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">View documents in browser</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">Access from any device</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckIcon className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">Australian-hosted, encrypted</span>
          </div>
        </div>
      </section>

      {/* Pricing - Moved down after value */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-4 text-center">Pricing</h2>
          <p className="text-center text-slate-300 mb-8 sm:mb-12">Full access. Upgrade when you need more uploads.</p>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
            <div className="relative rounded-lg bg-brand-900/30 border-2 border-brand-600 p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">Free</h3>
              <div className="mb-6">
                <span className="text-lg sm:text-xl text-brand-300">$</span><span className="text-4xl sm:text-5xl font-bold text-white">0</span>
              </div>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-center gap-2 text-sm sm:text-base text-white">
                  <CheckIcon className="h-5 w-5 text-white flex-shrink-0" />
                  <span>Full access</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base text-white">
                  <CheckIcon className="h-5 w-5 text-white flex-shrink-0" />
                  <span>10 guideline uploads</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base text-white">
                  <CheckIcon className="h-5 w-5 text-white flex-shrink-0" />
                  <span>Unlimited viewing</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg bg-slate-900 border border-slate-700 p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-100 mb-4">Pro</h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl text-slate-400">$</span><span className="text-4xl sm:text-5xl font-bold text-slate-100">5</span>
                    <span className="text-slate-300 text-lg sm:text-xl">/month</span>
                  </div>
                  <span className="text-slate-400 text-base sm:text-lg">or</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-lg text-slate-400">$</span><span className="text-3xl sm:text-4xl font-bold text-slate-100">25</span>
                    <span className="text-slate-300 text-base sm:text-lg">/year</span>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-400">(save 58% with annual billing)</span>
                </div>
              </div>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-center gap-2 text-sm sm:text-base text-slate-300">
                  <CheckIcon className="h-5 w-5 text-brand-500 flex-shrink-0" />
                  <span>Unlimited uploads</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 text-center">
            <button
              onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl font-bold text-white shadow-lg transition hover:bg-brand-700 active:scale-95"
            >
              Start Free — No Credit Card
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
            <p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-slate-400">10 free guideline uploads • Upgrade anytime</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-8 sm:mb-12 text-center">Common Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left gap-3"
              >
                <span className="font-semibold text-base sm:text-lg text-slate-100 pr-2">{faq.question}</span>
                <ChevronDownIcon className={`h-5 w-5 sm:h-6 sm:w-6 text-slate-400 transition-transform flex-shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="text-center rounded-xl bg-slate-800 border border-slate-700 p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-4 sm:mb-6">Ready to get started?</h2>
          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Upload your first document and see how simple it is.
          </p>
          <button
            onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl font-bold text-white shadow-lg transition hover:bg-brand-700 active:scale-95"
          >
            Try MedSnap — free
            <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl border-t border-slate-800 px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center text-sm sm:text-base text-slate-400">
          <p>© 2025 Apogee Health Services (ACN: 673 390 657)</p>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
    </div>
  );
}
