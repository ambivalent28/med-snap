import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { Fragment, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
}

type Plan = 'monthly' | 'yearly';

const PricingModal: React.FC<Props> = ({ open, onClose, userId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const priceId = selectedPlan === 'monthly' 
        ? import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY 
        : import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY;

      if (!priceId) {
        throw new Error(`Price ID for ${selectedPlan} plan is missing. Add VITE_STRIPE_PRICE_ID_${selectedPlan.toUpperCase()} to Vercel.`);
      }

      // Call the serverless function to create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to create checkout session.';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No checkout URL returned from server.');
      }

      // Redirect directly to Stripe Checkout (new approach)
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred.');
      setLoading(false);
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 translate-y-2" enterTo="opacity-100 translate-y-0" leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-2">
              <Dialog.Panel className="w-full max-w-lg space-y-5 rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-xl font-bold text-white">Upgrade to Pro</Dialog.Title>
                  <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-sm text-red-300">{error}</div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      selectedPlan === 'monthly' ? 'border-brand-500 bg-brand-900/30' : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-white">Monthly</h3>
                      {selectedPlan === 'monthly' && <CheckIcon className="h-5 w-5 text-brand-400" />}
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-slate-400">$</span>
                      <span className="text-2xl font-bold text-white">5</span>
                      <span className="text-slate-400">/mo</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`rounded-xl border-2 p-4 text-left transition relative ${
                      selectedPlan === 'yearly' ? 'border-brand-500 bg-brand-900/30' : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                    }`}
                  >
                    <span className="absolute -top-2.5 left-3 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">SAVE 58%</span>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-white">Yearly</h3>
                      {selectedPlan === 'yearly' && <CheckIcon className="h-5 w-5 text-brand-400" />}
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-slate-400">$</span>
                      <span className="text-2xl font-bold text-white">25</span>
                      <span className="text-slate-400">/yr</span>
                    </div>
                  </button>
                </div>

                <div className="rounded-xl bg-slate-700/30 border border-slate-600 p-4">
                  <h4 className="font-medium text-white text-sm mb-2">What's included:</h4>
                  <ul className="space-y-1.5 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-brand-400 flex-shrink-0" />
                      <span>Unlimited uploads</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button onClick={onClose} className="flex-1 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? 'Processing...' : 'Continue to Checkout'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PricingModal;
