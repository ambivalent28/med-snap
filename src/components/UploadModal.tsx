import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowUpTrayIcon, DocumentIcon, PlusIcon, ChevronDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import React, { Fragment, useCallback, useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import type { UploadFormValues } from '../types';

const allowedTypes = [
  'application/pdf', 
  'image/png', 
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File, form: UploadFormValues) => Promise<void>;
  existingCategories?: string[];
}

const defaultForm: UploadFormValues = {
  title: '',
  category: 'General',
  tags: [],
  notes: '',
  source_url: '',
  confirmNoPhi: false
};

const UploadModal: React.FC<Props> = ({ open, onClose, onSubmit, existingCategories = [] }) => {
  const [form, setForm] = useState<UploadFormValues>(defaultForm);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [showSourceUrl, setShowSourceUrl] = useState(false);

  const allCategories = useMemo(() => {
    return [...existingCategories, ...localCategories.filter(c => !existingCategories.includes(c))];
  }, [existingCategories, localCategories]);

  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
      setFile(null);
      setPreview(null);
      setError(null);
      setIsCreatingCategory(false);
      setNewCategoryName('');
      setLocalCategories([]);
      setShowNotes(false);
      setShowSourceUrl(false);
    }
  }, [open]);

  const onDrop = useCallback((accepted: File[]) => {
    const picked = accepted[0];
    if (picked && allowedTypes.includes(picked.type)) {
      setFile(picked);
      setError(null);
      if (picked.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(picked);
      } else {
        setPreview(null);
      }
    } else {
      setError('Only PDF, Word documents, PNG, and JPG files are allowed.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    }
  });

  const isValid = useMemo(() => {
    return !!file && form.title.trim().length > 0 && form.confirmNoPhi === true;
  }, [file, form.title, form.confirmNoPhi]);

  const handleSubmit = async () => {
    if (!file || !isValid) {
      if (!form.confirmNoPhi) {
        setError('Please confirm that this file contains no patient information.');
      }
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(file, form);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed && !existingCategories.includes(trimmed) && !localCategories.includes(trimmed)) {
      setLocalCategories(prev => [...prev, trimmed]);
      setForm(prev => ({ ...prev, category: trimmed }));
    } else if (trimmed) {
      setForm(prev => ({ ...prev, category: trimmed }));
    }
    setIsCreatingCategory(false);
    setNewCategoryName('');
  };

  const getFileTypeLabel = () => {
    if (!file) return '';
    if (file.type === 'application/pdf') return 'PDF';
    if (file.type.includes('word') || file.type.includes('msword')) return 'Word';
    if (file.type.startsWith('image/')) return 'Image';
    return 'Document';
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 translate-y-2" enterTo="opacity-100 translate-y-0" leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-2">
              <Dialog.Panel className="w-full max-w-lg space-y-4 rounded-2xl bg-slate-800 border border-slate-700 p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-base font-semibold text-slate-100">
                    Upload Reference
                  </Dialog.Title>
                  <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Drop Zone */}
                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition ${
                    isDragActive ? 'border-brand-500 bg-brand-950/20' : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <input {...getInputProps()} />
                  <ArrowUpTrayIcon className="mb-2 h-7 w-7 text-brand-500" />
                  <p className="text-sm text-slate-300">Drop file here or click to browse</p>
                  <p className="mt-1 text-xs text-slate-500">PDF, Word, PNG, JPG</p>
                  {file && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200">
                        <DocumentIcon className="h-4 w-4 text-brand-400" />
                        {file.name} ({getFileTypeLabel()})
                      </span>
                      {preview && (
                        <img src={preview} alt="Preview" className="mt-3 max-h-24 rounded-lg border border-slate-600 mx-auto" />
                      )}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Sepsis Management Protocol"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {allCategories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => { setForm(prev => ({ ...prev, category: cat })); setIsCreatingCategory(false); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          form.category === cat
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsCreatingCategory(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 text-slate-400 hover:bg-slate-600 flex items-center gap-1"
                    >
                      <PlusIcon className="h-3 w-3" /> New
                    </button>
                  </div>
                  {isCreatingCategory && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && confirmNewCategory()}
                        placeholder="Category name..."
                        autoFocus
                      />
                      <button onClick={confirmNewCategory} disabled={!newCategoryName.trim()} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50">Add</button>
                      <button onClick={() => { setIsCreatingCategory(false); setNewCategoryName(''); }} className="px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-700">Cancel</button>
                    </div>
                  )}
                </div>

                {/* Optional Fields - Hidden by default */}
                <div className="space-y-2">
                  {/* Notes toggle */}
                  {!showNotes ? (
                    <button onClick={() => setShowNotes(true)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400">
                      <ChevronDownIcon className="h-3 w-3" />
                      Add note (optional)
                    </button>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Note</label>
                      <textarea
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none resize-none"
                        rows={2}
                        value={form.notes}
                        onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Personal notes..."
                      />
                    </div>
                  )}

                  {/* Source URL toggle */}
                  {!showSourceUrl ? (
                    <button onClick={() => setShowSourceUrl(true)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400">
                      <ChevronDownIcon className="h-3 w-3" />
                      Add reference URL (optional)
                    </button>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Reference URL</label>
                      <input
                        type="url"
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                        value={form.source_url}
                        onChange={(e) => setForm(prev => ({ ...prev, source_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>

                {/* Confirmation - Made more prominent */}
                <div className={`rounded-lg border-2 p-3 transition ${form.confirmNoPhi ? 'border-brand-600/50 bg-brand-900/20' : 'border-amber-600/50 bg-amber-900/20'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 rounded border-slate-600 bg-slate-700 text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                      checked={form.confirmNoPhi}
                      onChange={(e) => setForm(prev => ({ ...prev, confirmNoPhi: e.target.checked }))}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <ExclamationTriangleIcon className={`h-4 w-4 ${form.confirmNoPhi ? 'text-brand-400' : 'text-amber-400'}`} />
                        <span className={`text-sm font-semibold ${form.confirmNoPhi ? 'text-brand-300' : 'text-amber-300'}`}>
                          Required: Confirm no patient information
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        This file must not contain any patient information or protected health data.
                      </p>
                    </div>
                  </label>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-900/40 border border-red-800 px-3 py-2 text-xs text-red-300">{error}</div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={onClose} className="px-3 py-2 text-sm text-slate-400 hover:text-slate-300">Cancel</button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid || submitting}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
