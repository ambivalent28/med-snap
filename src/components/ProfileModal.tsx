import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  UserCircleIcon, 
  KeyIcon, 
  CreditCardIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/solid';
import React, { Fragment, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  user: {
    email: string;
    id: string;
  };
  profile: {
    subscription_status: string | null;
    subscription_plan: string | null;
  } | null;
  onSubscriptionCancelled: () => void;
}

type Tab = 'account' | 'password' | 'subscription';

const ProfileModal: React.FC<Props> = ({ open, onClose, user, profile, onSubscriptionCancelled }) => {
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Cancel subscription state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // User has Pro access if status is 'active' OR 'cancelling' (still in billing period)
  const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'cancelling';
  const isCancelling = profile?.subscription_status === 'cancelling';

  // Reset cancel confirmation when profile changes (e.g., after cancellation)
  useEffect(() => {
    if (isCancelling) {
      setShowCancelConfirm(false);
    }
  }, [isCancelling]);

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to update password.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Call API to cancel subscription
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setMessage({ type: 'success', text: 'Subscription cancelled. You will retain access until the end of your billing period.' });
      setShowCancelConfirm(false);
      // Reload profile to get updated status
      await onSubscriptionCancelled();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to cancel subscription.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setActiveTab('account');
    setMessage(null);
    setNewPassword('');
    setConfirmPassword('');
    setShowCancelConfirm(false);
  };

  return (
    <Transition show={open} as={Fragment} afterLeave={resetState}>
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                  <Dialog.Title className="text-lg font-semibold text-white">
                    Account Settings
                  </Dialog.Title>
                  <button 
                    onClick={onClose} 
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                  <button
                    onClick={() => { setActiveTab('account'); setMessage(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
                      activeTab === 'account' 
                        ? 'text-brand-400 border-b-2 border-brand-400 bg-slate-700/30' 
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/20'
                    }`}
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    Account
                  </button>
                  <button
                    onClick={() => { setActiveTab('password'); setMessage(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
                      activeTab === 'password' 
                        ? 'text-brand-400 border-b-2 border-brand-400 bg-slate-700/30' 
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/20'
                    }`}
                  >
                    <KeyIcon className="h-4 w-4" />
                    Password
                  </button>
                  <button
                    onClick={() => { setActiveTab('subscription'); setMessage(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
                      activeTab === 'subscription' 
                        ? 'text-brand-400 border-b-2 border-brand-400 bg-slate-700/30' 
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/20'
                    }`}
                  >
                    <CreditCardIcon className="h-4 w-4" />
                    Subscription
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Messages */}
                  {message && (
                    <div className={`rounded-lg px-4 py-3 text-sm ${
                      message.type === 'success' 
                        ? 'bg-emerald-900/30 border border-emerald-700/50 text-emerald-300'
                        : 'bg-red-900/30 border border-red-700/50 text-red-300'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  {/* Account Tab */}
                  {activeTab === 'account' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                        <div className="rounded-lg bg-slate-700/50 border border-slate-600 px-4 py-2.5 text-sm text-slate-300">
                          {user.email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Account Type</label>
                        <div className="rounded-lg bg-slate-700/50 border border-slate-600 px-4 py-2.5 text-sm">
                          {isPro ? (
                            <span className="text-brand-400 font-medium">Pro Account</span>
                          ) : (
                            <span className="text-slate-300">Free Account</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">User ID</label>
                        <div className="rounded-lg bg-slate-700/50 border border-slate-600 px-4 py-2.5 text-xs text-slate-500 font-mono">
                          {user.id}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password Tab */}
                  {activeTab === 'password' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-lg bg-slate-700 border border-slate-600 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-lg bg-slate-700 border border-slate-600 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={loading || !newPassword || !confirmPassword}
                        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  )}

                  {/* Subscription Tab */}
                  {activeTab === 'subscription' && (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-slate-700/30 border border-slate-600 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-white">Current Plan</h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {isPro ? 'Pro Plan - Unlimited uploads' : 'Free Plan - 10 uploads'}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            isCancelling
                              ? 'bg-amber-600/30 text-amber-300'
                              : isPro 
                                ? 'bg-brand-600/30 text-brand-300' 
                                : 'bg-slate-600/50 text-slate-300'
                          }`}>
                            {isCancelling ? 'Cancels at period end' : isPro ? 'Active' : 'Free'}
                          </span>
                        </div>
                      </div>

                      {/* Show message when subscription is cancelling */}
                      {isCancelling && (
                        <div className="rounded-lg bg-amber-900/20 border border-amber-700/50 px-4 py-3 text-sm text-amber-300">
                          Your subscription has been cancelled and will end at the end of your billing period. You'll keep Pro access until then.
                        </div>
                      )}

                      {/* Only show cancel button if Pro and NOT already cancelling */}
                      {isPro && !isCancelling && !showCancelConfirm && (
                        <button
                          onClick={() => setShowCancelConfirm(true)}
                          className="w-full rounded-lg border border-red-600/50 bg-red-900/20 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900/30 transition"
                        >
                          Cancel Subscription
                        </button>
                      )}

                      {isPro && !isCancelling && showCancelConfirm && (
                        <div className="rounded-xl bg-red-900/20 border border-red-600/50 p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-red-300">Cancel subscription?</h4>
                              <p className="text-xs text-red-400/80 mt-1">
                                You'll retain access until the end of your billing period. After that, you'll be limited to 10 uploads.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowCancelConfirm(false)}
                              className="flex-1 rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
                            >
                              Keep Subscription
                            </button>
                            <button
                              onClick={handleCancelSubscription}
                              disabled={loading}
                              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 transition"
                            >
                              {loading ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                          </div>
                        </div>
                      )}

                      {!isPro && (
                        <p className="text-xs text-slate-500 text-center">
                          You're on the free plan. Close this modal and click "Upgrade" to get unlimited uploads.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProfileModal;

