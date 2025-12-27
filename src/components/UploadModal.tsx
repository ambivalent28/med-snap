import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { UploadFormValues } from '../types';

const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File, form: UploadFormValues) => Promise<void>;
}

const defaultForm: UploadFormValues = {
  title: '',
  category: 'General',
  tags: '',
  notes: '',
  source_url: '',
  confirmNoPhi: false
};

const UploadModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState<UploadFormValues>(defaultForm);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const picked = accepted[0];
    if (picked && allowedTypes.includes(picked.type)) {
      setFile(picked);
      setError(null);
    } else {
      setError('Only PDF, PNG, and JPG files are allowed.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    }
  });

  const isValid = useMemo(() => {
    return (
      !!file &&
      form.title.trim().length > 0 &&
      form.confirmNoPhi === true
    );
  }, [file, form.title, form.confirmNoPhi]);

  const handleSubmit = async () => {
    if (!file || !isValid) return;
    setSubmitting(true);
    try {
      await onSubmit(file, form);
      setForm(defaultForm);
      setFile(null);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = <K extends keyof UploadFormValues>(key: K, value: UploadFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
              <Dialog.Panel className="w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    Upload guideline
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
                    isDragActive
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <ArrowUpTrayIcon className="mb-3 h-8 w-8 text-brand-600" />
                  <p className="text-sm font-medium text-slate-800">
                    Drag & drop a PDF or image, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Accepted: PDF, PNG, JPG. No downloads—inline only.
                  </p>
                  {file && (
                    <p className="mt-2 max-w-md truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                      {file.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Title *</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      value={form.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="e.g., 2024 Sepsis bundle"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Category</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      value={form.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      placeholder="Cardiology"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Tags</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      value={form.tags}
                      onChange={(e) => updateField('tags', e.target.value)}
                      placeholder="comma separated"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Source URL</label>
                    <input
                      type="url"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      value={form.source_url}
                      onChange={(e) => updateField('source_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Notes</label>
                    <textarea
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      rows={2}
                      value={form.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      placeholder="Clinical pearls or reminders"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={form.confirmNoPhi}
                    onChange={(e) => updateField('confirmNoPhi', e.target.checked)}
                  />
                  <span>
                    I confirm this file contains no patient information or protected health data.
                  </span>
                </label>

                {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid || submitting}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {submitting ? 'Uploading...' : 'Upload'}
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

export default UploadModal;

