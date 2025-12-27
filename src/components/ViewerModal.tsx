import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { Fragment, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { Guideline } from '../types';

// Configure pdf.js worker for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

interface Props {
  open: boolean;
  guideline: Guideline | null;
  onClose: () => void;
}

const ViewerModal: React.FC<Props> = ({ open, guideline, onClose }) => {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!guideline) return null;

  const isPdf = guideline.file_type === 'pdf';

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
                  <Document file={guideline.file_path} loading={<p className="text-slate-200">Loading PDF…</p>}>
                    <Page pageNumber={1} renderTextLayer renderAnnotationLayer />
                  </Document>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <img
                      src={guideline.file_path}
                      alt={guideline.title}
                      className="max-h-full max-w-full rounded-xl shadow-lg"
                    />
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

