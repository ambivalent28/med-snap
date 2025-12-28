import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import React, { Fragment, useEffect, useState } from 'react';
import mammoth from 'mammoth';
import type { Guideline } from '../types';

interface Props {
  open: boolean;
  guideline: Guideline | null;
  onClose: () => void;
}

const ViewerModal: React.FC<Props> = ({ open, guideline, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wordHtml, setWordHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (open && guideline) {
      setLoading(true);
      setError(null);
      setWordHtml(null);

      // Load Word document if needed
      if (guideline.file_type === 'word') {
        loadWordDocument(guideline.file_path);
      } else {
        // For PDFs and images, loading is handled by iframe/img
        setLoading(false);
      }
    }
  }, [open, guideline]);

  const loadWordDocument = async (url: string) => {
    try {
      setLoading(true);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setWordHtml(result.value);
    } catch (err) {
      console.error('Word document load error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load Word document: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!guideline) return null;

  const isPdf = guideline.file_type === 'pdf';
  const isWord = guideline.file_type === 'word';

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
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-6">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative flex h-[90vh] w-[90vw] max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-900/90 shadow-2xl">
              <div className="flex items-center justify-between bg-slate-900/80 px-4 py-3 text-slate-50">
                <div className="truncate text-sm font-semibold">
                  {guideline.title}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full bg-slate-800 p-1 text-slate-200 hover:bg-slate-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-slate-950/70 p-4 pdf-container">
                {isPdf ? (
                  <div className="h-full w-full flex flex-col">
                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 mb-2">
                      <a
                        href={guideline.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600"
                      >
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                        Open in New Tab
                      </a>
                      <a
                        href={guideline.file_path}
                        download
                        className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600"
                      >
                        <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </div>
                    {/* PDF iframe viewer */}
                    <iframe
                      src={guideline.file_path}
                      className="flex-1 w-full rounded-lg border border-slate-700 bg-white"
                      title={guideline.title}
                    />
                  </div>
                ) : isWord ? (
                  <div className="h-full w-full flex flex-col">
                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 mb-2">
                      <a
                        href={guideline.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600"
                      >
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                        Open in New Tab
                      </a>
                      <a
                        href={guideline.file_path}
                        download
                        className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600"
                      >
                        <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </div>
                    {/* Word document content */}
                    <div className="flex-1 overflow-auto">
                      {loading ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-slate-200">Loading document…</p>
                        </div>
                      ) : error ? (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center max-w-lg">
                            <p className="text-red-400 mb-4">{error}</p>
                            <p className="text-slate-400 text-sm">Use the buttons above to open or download the file.</p>
                          </div>
                        </div>
                      ) : wordHtml ? (
                        <div 
                          className="prose prose-invert max-w-none bg-slate-800 p-6 rounded-lg"
                          dangerouslySetInnerHTML={{ __html: wordHtml }}
                          style={{
                            color: '#f1f5f9',
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-slate-400">No content to display. Try downloading the file.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full flex flex-col">
                    {/* Action buttons for images */}
                    <div className="flex justify-end gap-2 mb-2">
                      <a
                        href={guideline.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600"
                      >
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                        Open in New Tab
                      </a>
                      <a
                        href={guideline.file_path}
                        download
                        className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600"
                      >
                        <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </div>
                    {/* Image display */}
                    <div className="flex flex-1 items-center justify-center">
                      <img
                        src={guideline.file_path}
                        alt={guideline.title}
                        className="max-h-full max-w-full rounded-xl shadow-lg"
                        onError={() => {
                          setError('Failed to load image');
                        }}
                      />
                    </div>
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

