import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { loadStripe } from '@stripe/stripe-js';
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
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call your backend API
      // to create a Stripe Checkout session
      // For now, we'll show a placeholder message
      
      const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!stripePublishableKey) {
        throw new Error('Stripe is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.');
      }

      // This is a placeholder - you'll need to implement the backend endpoint
      // that creates the Stripe Checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlan === 'monthly' 
            ? import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY 
            : import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session. Please try again.');
      }

      const { sessionId } = await response.json();
      const stripe = await loadStripe(stripePublishableKey);
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (redirectError) {
        throw redirectError;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
            >
              <Dialog.Panel className="w-full max-w-2xl space-y-6 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-2xl font-bold text-slate-900">
                    Upgrade to Pro
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`rounded-xl border-2 p-6 text-left transition ${
                      selectedPlan === 'monthly'
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Monthly</h3>
                      {selectedPlan === 'monthly' && (
                        <CheckIcon className="h-6 w-6 text-brand-600" />
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-slate-900">$5</span>
                      <span className="text-slate-600">/month</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Billed monthly</p>
                  </button>

                  <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`rounded-xl border-2 p-6 text-left transition ${
                      selectedPlan === 'yearly'
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Yearly</h3>
                      {selectedPlan === 'yearly' && (
                        <CheckIcon className="h-6 w-6 text-brand-600" />
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-slate-900">$20</span>
                      <span className="text-slate-600">/year</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Save $40 per year</p>
                    <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Best Value
                    </span>
                  </button>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <h4 className="font-semibold text-slate-900">What's included:</h4>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-brand-600" />
                      <span>Unlimited uploads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-brand-600" />
                      <span>All existing features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-brand-600" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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

