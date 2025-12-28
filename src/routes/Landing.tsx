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
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../hooks/useAuth';

export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const benefits = [
    {
      title: 'Save Time When It Matters Most',
      description: 'Stop wasting precious minutes searching through folders and bookmarks. Find the clinical guideline you need in seconds, right when you need it.',
      icon: ClockIcon,
    },
    {
      title: 'Access Your References Anywhere',
      description: 'Your clinical library follows you. Log in from any device, anywhere—clinic, hospital, or home. All your references are securely stored in the cloud on Australian servers.',
      icon: CloudArrowUpIcon,
    },
    {
      title: 'Stay Organized Without the Effort',
      description: 'Upload once, organize with categories and tags, then forget about it. Your references are automatically searchable and ready when you need them.',
      icon: FolderIcon,
    },
  ];

  const features = [
    {
      title: 'Upload Multiple File Types',
      description: 'Support for PDF documents, Word files (DOC/DOCX), and images. Upload your clinical guidelines, reference sheets, or visual aids.',
      icon: DocumentTextIcon,
    },
    {
      title: 'Smart Organization',
      description: 'Create custom categories and add tags to organize your references. Find what you need quickly with powerful search across titles, tags, and notes.',
      icon: MagnifyingGlassIcon,
    },
    {
      title: 'View Documents Instantly',
      description: 'View PDFs, Word documents, and images directly in your browser. No downloads required—everything is accessible instantly.',
      icon: EyeIcon,
    },
    {
      title: 'Secure Cloud Storage',
      description: 'All data is stored securely on Australian servers. Your references are encrypted and accessible only to you.',
      icon: ShieldCheckIcon,
    },
    {
      title: 'Simple Workflow',
      description: 'Upload a clinical guideline or reference, organize it for later, view it when needed, and access from anywhere with your account.',
      icon: ArrowPathIcon,
    },
  ];

  const faqs = [
    {
      question: 'How does pricing work?',
      answer: 'MedSnap is priced to cover server and database costs—nothing more. This is a small project created by a healthcare doctor who wanted a better way to organize clinical references. The $5/month or $20/year pricing simply keeps the service running sustainably.',
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Absolutely. All data is encrypted in transit and at rest. Your files are stored securely on Australian servers, and only you have access to your references. We never access your files, and the system is designed specifically to exclude any patient information or protected health data.',
    },
    {
      question: 'Where is my data stored?',
      answer: 'All data is stored on servers located in Australia. This ensures compliance with Australian data protection requirements and provides fast access for Australian users.',
    },
    {
      question: 'How do I manage my account?',
      answer: 'You can sign up with just your email address. Once logged in, you can upload references, organize them with categories and tags, search your library, and manage your subscription. You can cancel your subscription at any time from your dashboard.',
    },
    {
      question: 'What happens if I cancel my subscription?',
      answer: 'If you cancel, you\'ll retain access to all your uploaded references. You can continue viewing and organizing them, but you won\'t be able to upload new files beyond the free tier limit of 5 uploads.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="MedSnap" className="h-8 w-8" />
          <span className="text-lg font-semibold text-brand-500">MedSnap</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setAuthMode('signin');
              setAuthModalOpen(true);
            }}
            className="text-sm font-medium text-slate-300 hover:text-brand-400"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthMode('signup');
              setAuthModalOpen(true);
            }}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Start Free Trial
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-slate-100 sm:text-6xl">
          Your Clinical Reference
          <br />
          <span className="text-brand-500">Library, Organized</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-300">
          Upload clinical guidelines and references, organize them for quick access, and view them from anywhere. Built by a healthcare professional, for healthcare professionals.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <button
            onClick={() => {
              setAuthMode('signup');
              setAuthModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Start Free Trial
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-400">5 free uploads • No credit card required</p>
      </section>

      {/* Benefits Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-100 mb-12">What You'll Experience</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} className="rounded-2xl bg-slate-800 border border-slate-700 p-8">
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-brand-600/20 p-3">
                  <Icon className="h-6 w-6 text-brand-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-3">{benefit.title}</h3>
                <p className="text-slate-300">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-100 mb-12">Everything You Need</h2>
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-8 space-y-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex gap-4 items-start">
                <div className="flex-shrink-0 inline-flex items-center justify-center rounded-lg bg-brand-600/20 p-2.5">
                  <Icon className="h-5 w-5 text-brand-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-300">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-2xl bg-slate-800 border border-slate-700 p-12">
          <h2 className="text-center text-3xl font-bold text-slate-100">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-center text-lg text-slate-300">Start free, upgrade when you need more</p>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Free Tier */}
            <div className="rounded-xl bg-slate-900 border border-slate-700 p-8">
              <h3 className="text-xl font-semibold text-slate-100">Free</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-100">$0</span>
                <span className="text-slate-400">/forever</span>
              </div>
              <ul className="mt-6 space-y-3 text-left">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckIcon className="h-5 w-5 text-brand-500" />
                  <span>5 uploads</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckIcon className="h-5 w-5 text-brand-500" />
                  <span>Unlimited viewing</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckIcon className="h-5 w-5 text-brand-500" />
                  <span>All features</span>
                </li>
              </ul>
            </div>

            {/* Pro Tier */}
            <div className="relative rounded-xl bg-brand-900/30 border-2 border-brand-600 p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white">Pro</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$5</span>
                <span className="text-brand-200">/month</span>
              </div>
              <div className="mt-2 text-sm text-brand-200">or $20/year (save $40)</div>
              <ul className="mt-6 space-y-3 text-left">
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckIcon className="h-5 w-5 text-white" />
                  <span>Unlimited uploads</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckIcon className="h-5 w-5 text-white" />
                  <span>Unlimited viewing</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckIcon className="h-5 w-5 text-white" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Unified CTA */}
          <div className="mt-10 text-center">
            <button
              onClick={() => {
                setAuthMode('signup');
                setAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-brand-700 hover:shadow-xl"
            >
              Get Started Free
              <ArrowRightIcon className="h-5 w-5" />
            </button>
            <p className="mt-3 text-sm text-slate-400">
              Start with 5 free uploads • Upgrade anytime for unlimited access
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-100 mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-slate-100">{faq.question}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6">
                  <p className="text-slate-300">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl border-t border-slate-800 px-6 py-12">
        <div className="text-center text-sm text-slate-400">
          <p>© 2024 Apogee Health Services (ACN: 673 390 657). All rights reserved.</p>
          <p className="mt-2">Built for healthcare professionals who value organization and efficiency.</p>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
    </div>
  );
}
