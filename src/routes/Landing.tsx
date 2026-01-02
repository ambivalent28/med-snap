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

  // 3 Main Benefits (not features)
  const benefits = [
    {
      title: 'Never Lose a Guideline Again',
      description: 'Stop wasting time searching through folders, bookmarks, or browser history. Everything in one place.',
      icon: ClockIcon,
    },
    {
      title: 'Access Anywhere, Anytime',
      description: 'Clinic, hospital, or home. Your clinical library follows you wherever you work.',
      icon: CloudArrowUpIcon,
    },
    {
      title: 'Find It in Seconds',
      description: 'Upload once, assign a category, find it instantly when you need it.',
      icon: MagnifyingGlassIcon,
    },
  ];

  // Features list (10-20 features with checkmarks)
  const features = [
    'Upload PDFs, Word docs, and images',
    'Organise by custom categories',
    'Search by title and notes',
    'View documents in browser (no downloads)',
    'Unlimited document viewing',
    'Access from any device',
    'Australian-hosted servers',
    'Encrypted storage',
    'Drag-and-drop organisation',
    'Add optional notes to documents',
    'Add reference URLs',
    'Simple, clean interface',
    'No complex folder structures',
    'Fast document loading',
    'Mobile-responsive design',
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

      {/* Hero Section - What you offer, how it helps, what to do */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-10 md:pt-16 pb-8 sm:pb-12 md:pb-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-100 leading-tight px-2">
            Stop re-Googling the same clinical guidelines.
          </h1>
          <p className="mx-auto mt-4 sm:mt-6 md:mt-8 max-w-3xl text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 leading-relaxed px-2">
            A simple place to store the clinical documents you actually reuse —
            so you can find them instantly when you need them.
          </p>
          <p className="mx-auto mt-4 sm:mt-6 max-w-3xl text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed px-2">
            Think referral criteria screenshots, sepsis protocols, imaging guidelines,
            or hospital PDFs you know you'll need again — but can never find when
            you're on shift.
          </p>
          <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl font-bold text-white shadow-lg transition hover:bg-brand-700 active:scale-95"
            >
              Try MedSnap — free
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
            <p className="text-xs sm:text-sm md:text-base text-slate-400">10 free uploads • No credit card required</p>
          </div>
        </div>

        {/* App Preview - Below hero */}
        <div className="mt-12 sm:mt-16 mx-auto max-w-6xl">
          <div className="relative rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 p-2 shadow-2xl shadow-brand-900/20 pointer-events-none select-none">
            <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <EyeIcon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">Preview Only</span>
            </div>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section - Pain point + Agitate with emotion */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-3 sm:mb-4 md:mb-6">
              Tired of searching for the same guidelines?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-3 sm:mb-4 leading-relaxed">
              You know you saved that sepsis protocol somewhere. But where? In your downloads? Bookmarks? Email? That folder you created last month?
            </p>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-4 sm:mb-6 leading-relaxed">
              Time spent searching for documents adds up quickly.
              MedSnap keeps everything in one place, so you're not digging through
              folders, bookmarks, or browser history.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-100">Upload once, find instantly</p>
                  <p className="text-xs sm:text-sm md:text-base text-slate-400">No more digging through folders or browser history</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-100">Organise your way</p>
                  <p className="text-xs sm:text-sm md:text-base text-slate-400">Categories that match how you think and work</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-100">Access anywhere</p>
                  <p className="text-xs sm:text-sm md:text-base text-slate-400">Clinic, hospital, or home—your library follows you</p>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 rounded-xl sm:rounded-2xl bg-slate-800 border border-slate-700 p-4 sm:p-6 md:p-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100">Less time searching.</p>
                  <p className="text-xs sm:text-sm md:text-base text-slate-400">More time focused on patients.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                  <FolderIcon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100">One place</p>
                  <p className="text-xs sm:text-sm md:text-base text-slate-400">For all your clinical references</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100">Secure</p>
                  <p className="text-xs sm:text-sm md:text-base text-slate-400">Australian-hosted, encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Main Benefits */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 md:py-20">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-8 sm:mb-12 md:mb-16 px-2">Why MedSnap Works</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} className="rounded-xl sm:rounded-2xl bg-slate-800 border border-slate-700 p-5 sm:p-6 md:p-8">
                <div className="mb-3 sm:mb-4 inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-brand-600/20 p-2.5 sm:p-3">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-brand-400" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 mb-2 sm:mb-3">{benefit.title}</h3>
                <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features List - 10-20 features with checkmarks */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-3 sm:mb-4 md:mb-6 px-2">Everything You Need</h2>
          <p className="text-center text-base sm:text-lg md:text-xl text-slate-400 mb-6 sm:mb-8 md:mb-12 px-2">Simple features that make your clinical work easier</p>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 sm:gap-3">
                <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-brand-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base md:text-lg text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-6 sm:mb-8 px-2">Who MedSnap is for</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-brand-500 text-xl sm:text-2xl">•</span>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 flex-1">Clinicians who screenshot guidelines or protocols</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-brand-500 text-xl sm:text-2xl">•</span>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 flex-1">Anyone tired of re-Googling the same documents</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-brand-500 text-xl sm:text-2xl">•</span>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 flex-1">People who want something simpler than folders or Notion</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 md:py-20">
        <div className="mx-auto max-w-4xl rounded-xl sm:rounded-2xl bg-slate-800 border border-slate-700 p-5 sm:p-8 md:p-12">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-3 sm:mb-4">Pricing (free to try)</h2>
          <p className="text-center text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8 md:mb-12">Full access. Upgrade when you need more uploads.</p>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 md:grid-cols-2">
            <div className="relative rounded-lg sm:rounded-xl bg-brand-900/30 border-2 border-brand-600 p-5 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 sm:mb-4">Free</h3>
              <div className="mb-4 sm:mb-6">
                <span className="text-base sm:text-lg md:text-xl text-brand-300">$</span><span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">0</span>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-left mb-4 sm:mb-6">
                <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-white">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                  <span>Full access</span>
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-white">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                  <span>10 guideline uploads</span>
                </li>
                <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-white">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                  <span>Unlimited viewing</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg sm:rounded-xl bg-slate-900 border border-slate-700 p-5 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-100 mb-3 sm:mb-4">Pro</h3>
              <div className="mb-4 sm:mb-6">
                <span className="text-base sm:text-lg md:text-xl text-slate-400">$</span><span className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-100">5</span>
                <span className="text-slate-300 text-sm sm:text-base">/month</span>
              </div>
              <div className="mb-4 sm:mb-6 text-xs sm:text-sm md:text-base text-slate-400">or $25/year (save 58%)</div>
              <ul className="space-y-2 sm:space-y-3 text-left mb-4 sm:mb-6">
                <li className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-slate-300">
                  <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500 flex-shrink-0" />
                  <span>Unlimited uploads</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 md:mt-10 text-center">
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

      {/* FAQ - Handle Objections */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 md:py-20">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-6 sm:mb-8 md:mb-12 px-2">Common Questions</h2>
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-lg sm:rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-left gap-3"
              >
                <span className="font-semibold text-sm sm:text-base md:text-lg text-slate-100 pr-2">{faq.question}</span>
                <ChevronDownIcon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-slate-400 transition-transform flex-shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                  <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 md:py-20">
        <div className="text-center rounded-xl sm:rounded-2xl bg-slate-800 border border-slate-700 p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 mb-3 sm:mb-4 md:mb-6 px-2">Ready to Organise Your Clinical Library?</h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-2">
            Join clinicians who've stopped wasting time searching for guidelines.
          </p>
          <button
            onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl font-bold text-white shadow-lg transition hover:bg-brand-700 active:scale-95"
          >
            Get Started Free
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
