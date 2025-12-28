import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowUpTrayIcon, DocumentIcon, PlusIcon, XCircleIcon } from '@heroicons/react/24/solid';
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
  const [tagInput, setTagInput] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
      setFile(null);
      setPreview(null);
      setTagInput('');
      setError(null);
      setIsCreatingCategory(false);
      setNewCategoryName('');
    }
  }, [open]);

  const onDrop = useCallback((accepted: File[]) => {
    const picked = accepted[0];
    if (picked && allowedTypes.includes(picked.type)) {
      setFile(picked);
      setError(null);
      
      // Create preview for images
      if (picked.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(picked);
      } else {
        setPreview(null);
      }
    } else {
      setError('Only PDF, Word documents (DOC/DOCX), PNG, and JPG files are allowed.');
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
    return (
      !!file &&
      form.title.trim().length > 0 &&
      form.confirmNoPhi === true
    );
  }, [file, form.title, form.confirmNoPhi]);

  const handleSubmit = async () => {
    if (!file || !isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(file, form);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleCategoryChange = (value: string) => {
    if (value === '__create_new__') {
      setIsCreatingCategory(true);
      setNewCategoryName('');
    } else {
      setForm(prev => ({ ...prev, category: value }));
      setIsCreatingCategory(false);
    }
  };

  const confirmNewCategory = () => {
    if (newCategoryName.trim()) {
      setForm(prev => ({ ...prev, category: newCategoryName.trim() }));
      setIsCreatingCategory(false);
      setNewCategoryName('');
    }
  };

  const getFileTypeLabel = () => {
    if (!file) return '';
    if (file.type === 'application/pdf') return 'PDF Document';
    if (file.type.includes('word') || file.type.includes('msword')) return 'Word Document';
    if (file.type.startsWith('image/')) return 'Image';
    return 'Document';
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
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl space-y-4 rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold text-slate-100">
                    Upload Clinical Reference
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
                    isDragActive
                      ? 'border-brand-500 bg-brand-950/20'
                      : 'border-slate-600 hover:border-brand-600 hover:bg-slate-700/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <ArrowUpTrayIcon className="mb-3 h-8 w-8 text-brand-500" />
                  <p className="text-sm font-medium text-slate-200">
                    Drag & drop a file, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Accepted: PDF, Word (DOC/DOCX), PNG, JPG
                  </p>
                  {file && (
                    <div className="mt-2">
                      <p className="max-w-md truncate rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200">
                        {file.name}
                      </p>
                      {preview && (
                        <div className="mt-3 flex justify-center">
                          <img
                            src={preview}
                            alt="Preview"
                            className="max-h-32 max-w-full rounded-lg border border-slate-600"
                          />
                        </div>
                      )}
                      {(file.type === 'application/pdf' || file.type.includes('word') || file.type.includes('msword')) && (
                        <div className="mt-3 flex justify-center">
                          <div className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2">
                            <DocumentIcon className="h-6 w-6 text-brand-500" />
                            <span className="text-sm font-medium text-slate-200">{getFileTypeLabel()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Title *</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., 2024 Sepsis Guidelines"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Category</label>
                    {!isCreatingCategory ? (
                      <select
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={form.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                      >
                        {existingCategories.map(cat => (
                          <option key={cat} value={cat} className="bg-slate-700">{cat}</option>
                        ))}
                        <option value="__create_new__" className="bg-slate-700">+ Create New Category</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Category name"
                          autoFocus
                        />
                        <button
                          onClick={confirmNewCategory}
                          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setIsCreatingCategory(false);
                            setNewCategoryName('');
                          }}
                          className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Tags</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Add a tag"
                      />
                      <button
                        onClick={addTag}
                        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 flex items-center gap-1"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-brand-900/50 border border-brand-700 px-3 py-1 text-xs font-medium text-brand-200"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-brand-100"
                            >
                              <XCircleIcon className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Source URL</label>
                    <input
                      type="url"
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      value={form.source_url}
                      onChange={(e) => setForm(prev => ({ ...prev, source_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Notes</label>
                    <textarea
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Clinical notes or reminders"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2 rounded-lg bg-slate-700/50 px-3 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-700 text-brand-600 focus:ring-brand-500"
                    checked={form.confirmNoPhi}
                    onChange={(e) => setForm(prev => ({ ...prev, confirmNoPhi: e.target.checked }))}
                  />
                  <span>
                    I confirm this file contains no patient information or protected health data.
                  </span>
                </label>

                {error && (
                  <div className="rounded-lg bg-red-900/50 border border-red-700 px-3 py-2 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid || submitting}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-400"
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
