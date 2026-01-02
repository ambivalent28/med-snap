import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon, 
  ArrowTopRightOnSquareIcon, 
  PencilIcon, 
  CheckIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  DocumentIcon,
  PhotoIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid';
import React, { Fragment, useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth';
import type { Guideline } from '../types';

interface Props {
  open: boolean;
  guideline: Guideline | null;
  onClose: () => void;
  onUpdate?: (guideline: Guideline, updates: Partial<Guideline>, newFile?: File) => Promise<void>;
  onDelete?: (guideline: Guideline) => Promise<void>;
  existingCategories?: string[];
}

const allowedTypes = [
  'application/pdf', 
  'image/png', 
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ViewerModal: React.FC<Props> = ({ open, guideline, onClose, onUpdate, onDelete, existingCategories = [] }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wordHtml, setWordHtml] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', category: '', notes: '', source_url: '' });
  const [saving, setSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFilePreview, setNewFilePreview] = useState<string | null>(null);
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [showSourceUrl, setShowSourceUrl] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const picked = accepted[0];
    if (picked && allowedTypes.includes(picked.type)) {
      setNewFile(picked);
      if (picked.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setNewFilePreview(e.target?.result as string);
        reader.readAsDataURL(picked);
      } else {
        setNewFilePreview(null);
      }
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

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (open && guideline) {
      setLoading(true);
      setError(null);
      setWordHtml(null);
      setIsEditing(false);
      setNewFile(null);
      setNewFilePreview(null);
      setNewCategoryName('');
      setLocalCategories([]);
      
      setEditForm({
        title: guideline.title,
        category: guideline.category || 'General',
        notes: guideline.notes || '',
        source_url: guideline.source_url || ''
      });
      
      // Show fields if they have content
      setShowNotes(!!(guideline.notes));
      setShowSourceUrl(!!(guideline.source_url));

      if (guideline.file_type === 'word') {
        loadWordDocument(guideline.file_path);
      } else {
        setLoading(false);
      }
    }
  }, [open, guideline]);

  const loadWordDocument = async (url: string) => {
    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setWordHtml(result.value);
    } catch (err) {
      console.error('Word document load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!guideline || !onUpdate) return;
    
    // Validate inputs
    const title = editForm.title.trim();
    if (!title || title.length === 0) {
      setError('Title is required');
      return;
    }
    if (title.length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }
    
    const category = (editForm.category || 'General').trim();
    if (category.length > 50) {
      setError('Category name must be 50 characters or less');
      return;
    }
    
    let sourceUrl = editForm.source_url ? editForm.source_url.trim() : null;
    if (sourceUrl && sourceUrl.length > 0) {
      try {
        new URL(sourceUrl);
        if (sourceUrl.length > 500) {
          setError('URL must be 500 characters or less');
          return;
        }
      } catch {
        setError('Invalid URL format. Please enter a valid URL (e.g., https://example.com)');
        return;
      }
    } else {
      sourceUrl = null;
    }
    
    const notes = editForm.notes ? editForm.notes.trim().substring(0, 1000) : null;
    
    setSaving(true);
    setError(null);
    try {
      await onUpdate(guideline, {
        title,
        category: category || 'General',
        tags: [], // Keep empty array for backend compatibility
        notes,
        source_url: sourceUrl
      }, newFile || undefined);
      setIsEditing(false);
      setNewFile(null);
      setNewFilePreview(null);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (guideline) {
      setEditForm({
        title: guideline.title,
        category: guideline.category || 'General',
        notes: guideline.notes || '',
        source_url: guideline.source_url || ''
      });
      setShowNotes(!!(guideline.notes));
      setShowSourceUrl(!!(guideline.source_url));
    }
    setIsEditing(false);
    setNewCategoryName('');
    setNewFile(null);
    setNewFilePreview(null);
    setError(null);
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    
    if (trimmed.length > 50) {
      setError('Category name must be 50 characters or less');
      return;
    }
    
    if (trimmed && !existingCategories.includes(trimmed) && !localCategories.includes(trimmed)) {
      setLocalCategories(prev => [...prev, trimmed]);
      setEditForm(prev => ({ ...prev, category: trimmed }));
    } else if (trimmed) {
      setEditForm(prev => ({ ...prev, category: trimmed }));
    }
    setNewCategoryName('');
  };

  const allCategories = [...existingCategories, ...localCategories.filter(c => !existingCategories.includes(c))];

  if (!guideline) return null;

  const isPdf = guideline.file_type === 'pdf';
  const isWord = guideline.file_type === 'word';
  
  // Check if the file path is a valid URL (not a relative path or missing)
  const isValidUrl = guideline.file_path && (
    guideline.file_path.startsWith('http://') || 
    guideline.file_path.startsWith('https://') ||
    guideline.file_path.startsWith('blob:')
  );

  const renderFilePreview = () => {
    // Show error if file path is invalid
    if (!isValidUrl) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-slate-900">
          <DocumentIcon className="h-16 w-16 text-slate-600 mb-4" />
          <p className="text-red-400 text-sm font-medium">File not found</p>
          <p className="text-slate-500 text-xs mt-2">This file may have been deleted or is unavailable.</p>
          <p className="text-slate-600 text-xs mt-1">Try deleting this guideline and re-uploading.</p>
        </div>
      );
    }
    
    if (isPdf) {
      return <iframe src={guideline.file_path} className="w-full h-full bg-white" title={guideline.title} />;
    }
    if (isWord) {
      if (loading) {
        return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
      }
      if (error) {
        return <div className="flex h-full items-center justify-center p-8 text-center"><p className="text-red-400 text-sm">{error}</p></div>;
      }
      if (wordHtml) {
        return <div className="prose prose-invert max-w-none p-6 overflow-auto h-full" dangerouslySetInnerHTML={{ __html: wordHtml }} />;
      }
      return <div className="flex h-full items-center justify-center text-slate-500">No content</div>;
    }
    return (
      <div className="h-full flex items-center justify-center p-4 bg-slate-900">
        <img src={guideline.file_path} alt={guideline.title} className="max-h-full max-w-full object-contain rounded-lg" onError={() => setError('Failed to load image')} />
      </div>
    );
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="relative flex h-[95vh] sm:h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl sm:rounded-2xl bg-slate-800 shadow-2xl">
              
              {/* Header */}
              <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-700 bg-slate-800">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
                    {isPdf || isWord ? <DocumentIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> : <PhotoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      maxLength={200}
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white focus:border-brand-500 focus:outline-none"
                      placeholder="Title..."
                    />
                  ) : (
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-base font-semibold text-white truncate">{guideline.title}</h2>
                      <p className="text-[10px] sm:text-xs text-slate-400">{guideline.category || 'General'} • {guideline.file_type.toUpperCase()}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {!isEditing && (
                    <>
                      <a href={guideline.file_path} target="_blank" rel="noopener noreferrer" className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 hidden sm:block">
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </a>
                      <a href={guideline.file_path} download className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </a>
                    </>
                  )}
                  {isEditing ? (
                    <>
                      <button onClick={handleCancel} className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm text-slate-400 hover:text-white hover:bg-slate-700">Cancel</button>
                      <button onClick={handleSave} disabled={saving || !editForm.title.trim()} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">
                        <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </>
                  ) : (
                    onUpdate && (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600">
                        <PencilIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">Edit</span>
                      </button>
                    )
                  )}
                  <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* Notes/URL Bar - only show in view mode if they exist */}
              {!isEditing && (guideline.notes || guideline.source_url) && (
                <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-slate-700 bg-slate-800/50 flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                  {guideline.notes && (
                    <div className="flex items-start gap-1.5 sm:gap-2 flex-1 min-w-0">
                      <span className="text-slate-500 text-[10px] sm:text-xs font-medium shrink-0">Note:</span>
                      <p className="text-slate-300 text-[10px] sm:text-xs leading-relaxed line-clamp-2 sm:line-clamp-none">{guideline.notes}</p>
                    </div>
                  )}
                  {guideline.source_url && (
                    <a
                      href={guideline.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-brand-400 hover:text-brand-300 shrink-0"
                    >
                      <ArrowTopRightOnSquareIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Source
                    </a>
                  )}
                </div>
              )}

              {/* Main Content */}
              <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
                <div className={`${isEditing ? 'h-1/2 sm:h-full sm:w-1/2' : 'h-full w-full'} bg-slate-900 overflow-hidden transition-all duration-200`}>
                  {renderFilePreview()}
                </div>

                {isEditing && (
                  <div className="h-1/2 sm:h-full sm:w-1/2 overflow-y-auto border-t sm:border-t-0 sm:border-l border-slate-700 bg-slate-800 p-3 sm:p-5 space-y-3 sm:space-y-4">
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
                      <div className="flex flex-wrap gap-1.5">
                        {allCategories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setEditForm(prev => ({ ...prev, category: cat }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                              editForm.category === cat ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          maxLength={50}
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                          placeholder="New category..."
                          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                        />
                        <button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-600 text-slate-300 hover:bg-slate-500 disabled:opacity-50">
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Optional Notes */}
                    {!showNotes ? (
                      <button onClick={() => setShowNotes(true)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400">
                        <ChevronDownIcon className="h-3 w-3" />
                        Add note (optional)
                      </button>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Note</label>
                        <textarea
                          maxLength={1000}
                          value={editForm.notes}
                          onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Personal notes..."
                          rows={2}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none resize-none"
                        />
                      </div>
                    )}

                    {/* Optional Source URL */}
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
                          maxLength={500}
                          value={editForm.source_url}
                          onChange={(e) => setEditForm(prev => ({ ...prev, source_url: e.target.value }))}
                          placeholder="https://..."
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Replace File */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Replace File</label>
                      {newFile ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/50">
                          {newFilePreview ? (
                            <img src={newFilePreview} alt="Preview" className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-emerald-700/30 flex items-center justify-center">
                              <DocumentIcon className="h-5 w-5 text-emerald-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-emerald-200 truncate">{newFile.name}</p>
                            <p className="text-[10px] text-emerald-400">{(newFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button onClick={() => { setNewFile(null); setNewFilePreview(null); }} className="p-1.5 rounded text-emerald-400 hover:bg-emerald-700/30">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div {...getRootProps()} className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition ${isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                          <input {...getInputProps()} />
                          <ArrowUpTrayIcon className="h-4 w-4 text-slate-400" />
                          <span className="text-xs text-slate-400">{isDragActive ? 'Drop file...' : 'Drop or click to replace'}</span>
                        </div>
                      )}
                    </div>

                    {error && <div className="p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-xs text-red-300">{error}</div>}

                    {onDelete && (
                      <div className="pt-4 border-t border-slate-700">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${guideline.title}"?`)) {
                              onDelete(guideline);
                              onClose();
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 bg-red-900/20 hover:bg-red-900/30 border border-red-700/50"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ViewerModal;
