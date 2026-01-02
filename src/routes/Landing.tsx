import { 
  ArrowRightIcon, 
  CheckIcon, 
  ChevronDownIcon,
  ClockIcon,
  CloudArrowUpIcon,
  FolderIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
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
    // Only redirect if we have a valid session (not just a user object)
    // This prevents redirecting during sign out
    // Add a delay to ensure session state is stable after page load
    if (!loading && user && session) {
      const timer = setTimeout(() => {
        // Double-check session is still valid before redirecting
        supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
          if (error) {
            console.error('Error checking session:', error);
            return;
          }
          // Only redirect if we have a valid, non-expired session
          if (currentSession && currentSession.user && currentSession.expires_at) {
            const expiresAt = currentSession.expires_at * 1000; // Convert to milliseconds
            if (expiresAt > Date.now()) {
              navigate('/dashboard');
            }
          }
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, session, loading, navigate]);

  const benefits = [
    {
      title: 'Stop Searching, Start Finding',
      description: 'No more digging through folders, bookmarks, or browser history. Your guidelines are in one place, searchable by title.',
      icon: ClockIcon,
    },
    {
      title: 'Access From Any Device',
      description: 'Clinic, hospital, or home. Log in from any browser and pick up where you left off.',
      icon: CloudArrowUpIcon,
    },
    {
      title: 'Simple Organisation',
      description: 'Upload once, assign a category, done. No complex folder structures. No files to lose.',
      icon: FolderIcon,
    },
  ];

  const features = [
    {
      title: 'PDFs, Word Docs, Images',
      description: 'Upload the file types you actually use—guidelines, reference sheets, screenshots, visual aids.',
      icon: DocumentTextIcon,
    },
    {
      title: 'Organise by Category',
      description: 'Create categories that match how you think. Cardiology, Emergency, Paediatrics—whatever works.',
      icon: MagnifyingGlassIcon,
    },
    {
      title: 'View in Browser',
      description: 'No downloads. Open any document directly, ready to reference.',
      icon: EyeIcon,
    },
    {
      title: 'Stored in Australia',
      description: 'Your files are encrypted and hosted on Australian servers.',
      icon: ShieldCheckIcon,
    },
    {
      title: 'Upload, Organise, View',
      description: 'That\'s it. Upload a file, put it in a category, find it later.',
      icon: ArrowPathIcon,
    },
  ];

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
      question: 'Where is my data stored?',
      answer: 'All data is stored on servers in Australia.',
    },
    {
      question: 'What happens if I cancel Pro?',
      answer: 'You keep access to everything you\'ve uploaded. You can still view and organise, but new uploads are limited to the free tier.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="MedSnap" className="h-7 w-7 sm:h-8 sm:w-8" />
          <span className="text-base sm:text-lg font-semibold text-brand-500">MedSnap</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => { setAuthMode('signin'); setAuthModalOpen(true); }}
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-brand-400"
          >
            Sign In
          </button>
          <button
            onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
            className="rounded-lg bg-brand-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-16 pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 leading-tight">
          Stop re-Googling the same
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          <span className="text-brand-500">clinical guidelines.</span>
        </h1>
        <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-slate-300 px-2">
          Upload your trusted PDFs, screenshots, and reference documents into a personal clinical library — accessible anywhere you work.
        </p>
        <div className="mt-8 sm:mt-10 flex items-center justify-center">
          <button
            onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Get Started Free
            <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-400">10 free guideline uploads — no credit card required</p>
      </section>

      {/* App Preview - Hidden on mobile, shown on tablet+ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-20 hidden sm:block">
        <div className="relative rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 p-2 shadow-2xl shadow-brand-900/20">
          <div className="flex items-center gap-2 rounded-t-xl bg-slate-800 px-4 py-3 border-b border-slate-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-4 py-1.5 text-xs text-slate-400">
                <ShieldCheckIcon className="h-3 w-3 text-green-500" />
                medsnap.com.au
              </div>
            </div>
          </div>
          
          <div className="rounded-b-xl bg-slate-900 p-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-brand-600" />
                  <span className="text-sm font-semibold text-brand-500">MedSnap</span>
                </div>
                <div className="h-4 w-px bg-slate-600 hidden md:block" />
                <span className="text-xs text-slate-400 hidden md:block">dr.example@hospital.org</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                  <PlusIcon className="h-3 w-3" />
                  Upload
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-36 lg:w-44 rounded-xl bg-slate-800 border border-slate-700 p-3 space-y-2 hidden md:block">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Categories</span>
                <div className="text-xs text-brand-400 bg-brand-900/50 px-2 py-1.5 rounded">All <span className="text-slate-500">(12)</span></div>
                <div className="text-xs text-slate-300 px-2 py-1.5 hover:bg-slate-700 rounded">Cardiology <span className="text-slate-500">(4)</span></div>
                <div className="text-xs text-slate-300 px-2 py-1.5 hover:bg-slate-700 rounded">Emergency <span className="text-slate-500">(3)</span></div>
                <div className="text-xs text-slate-300 px-2 py-1.5 hover:bg-slate-700 rounded">Paediatrics <span className="text-slate-500">(3)</span></div>
                <div className="text-xs text-slate-300 px-2 py-1.5 hover:bg-slate-700 rounded">General <span className="text-slate-500">(2)</span></div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2">
                  <div className="flex-1 flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-1.5">
                    <MagnifyingGlassIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-400">Search by title...</span>
                  </div>
                  <select className="text-[10px] text-slate-300 bg-slate-700 border border-slate-600 rounded px-2 py-1 hidden sm:block">
                    <option>Newest</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-3">
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-900/30 mb-2 flex items-center justify-center">
                      <DocumentTextIcon className="h-8 w-8 text-red-500/50" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 truncate">STEMI Pathway</h4>
                    <p className="text-[10px] text-slate-500">Cardiology • PDF</p>
                  </div>
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-3">
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-900/30 mb-2 flex items-center justify-center">
                      <DocumentTextIcon className="h-8 w-8 text-blue-500/50" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 truncate">Sepsis Bundle</h4>
                    <p className="text-[10px] text-slate-500">Emergency • PDF</p>
                  </div>
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-3 hidden lg:block">
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-900/30 mb-2 flex items-center justify-center">
                      <DocumentTextIcon className="h-8 w-8 text-emerald-500/50" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 truncate">Asthma Protocol</h4>
                    <p className="text-[10px] text-slate-500">Paediatrics • PDF</p>
                  </div>
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-3">
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-900/30 mb-2 flex items-center justify-center">
                      <EyeIcon className="h-8 w-8 text-purple-500/50" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 truncate">Dosing Chart</h4>
                    <p className="text-[10px] text-slate-500">General • Image</p>
                  </div>
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-3">
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-900/30 mb-2 flex items-center justify-center">
                      <DocumentTextIcon className="h-8 w-8 text-amber-500/50" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 truncate">AF Management</h4>
                    <p className="text-[10px] text-slate-500">Cardiology • PDF</p>
                  </div>
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-3 hidden lg:block">
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-900/30 mb-2 flex items-center justify-center">
                      <DocumentTextIcon className="h-8 w-8 text-cyan-500/50" />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 truncate">Antibiotic Guide</h4>
                    <p className="text-[10px] text-slate-500">Emergency • Word</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-100 mb-8 sm:mb-12">Why MedSnap?</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} className="rounded-xl sm:rounded-2xl bg-slate-800 border border-slate-700 p-5 sm:p-8">
                <div className="mb-3 sm:mb-4 inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-brand-600/20 p-2.5 sm:p-3">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-2 sm:mb-3">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-slate-300">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-100 mb-3 sm:mb-4">How It Works</h2>
        <p className="text-center text-sm sm:text-base text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto">Upload. Organise. Find it when you need it.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="rounded-xl sm:rounded-2xl bg-slate-800/50 border border-slate-700 p-4 sm:p-6 hover:border-slate-600 transition-all">
                <div className="mb-3 sm:mb-4 inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-brand-600/20 p-2.5 sm:p-3">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-1.5 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-xl sm:rounded-2xl bg-slate-800 border border-slate-700 p-6 sm:p-12">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-100">Pricing</h2>
          <p className="mt-3 sm:mt-4 text-center text-sm sm:text-lg text-slate-300">Full access. Upgrade when you need more uploads.</p>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-2">
            <div className="rounded-lg sm:rounded-xl bg-slate-900 border border-slate-700 p-5 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-100">Free</h3>
              <div className="mt-3 sm:mt-4">
                <span className="text-base sm:text-lg text-slate-400">$</span><span className="text-3xl sm:text-4xl font-bold text-slate-100">0</span>
              </div>
              <ul className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-left">
                <li className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500 flex-shrink-0" />
                  <span>Full access</span>
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500 flex-shrink-0" />
                  <span>10 guideline uploads</span>
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500 flex-shrink-0" />
                  <span>Unlimited viewing</span>
                </li>
              </ul>
            </div>

            <div className="relative rounded-lg sm:rounded-xl bg-brand-900/30 border-2 border-brand-600 p-5 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Pro</h3>
              <div className="mt-3 sm:mt-4">
                <span className="text-base sm:text-lg text-brand-300">$</span><span className="text-3xl sm:text-4xl font-bold text-white">5</span>
                <span className="text-brand-200">/month</span>
              </div>
              <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-brand-200">or $25/year (save 58%)</div>
              <ul className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-left">
                <li className="flex items-center gap-2 text-xs sm:text-sm text-white">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                  <span>Unlimited uploads</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 text-center">
            <button
              onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg transition hover:bg-brand-700"
            >
              Get Started Free
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-400">10 free guideline uploads — upgrade anytime</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-100 mb-8 sm:mb-12">Questions</h2>
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left gap-3"
              >
                <span className="font-semibold text-sm sm:text-base text-slate-100">{faq.question}</span>
                <ChevronDownIcon className={`h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-transform flex-shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <p className="text-sm sm:text-base text-slate-300">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl border-t border-slate-800 px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center text-xs sm:text-sm text-slate-400">
          <p>© 2025 Apogee Health Services (ACN: 673 390 657)</p>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
    </div>
  );
}
