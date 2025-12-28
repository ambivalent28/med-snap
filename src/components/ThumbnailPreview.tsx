import { DocumentIcon, PhotoIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Props {
  filePath: string;
  fileType: 'pdf' | 'image' | 'word';
  title: string;
}

const ThumbnailPreview: React.FC<Props> = ({ filePath, fileType, title }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const generateThumbnail = async () => {
      setLoading(true);
      setError(false);

      try {
        if (fileType === 'image') {
          // For images, use the file path directly
          setThumbnailUrl(filePath);
          setLoading(false);
        } else if (fileType === 'pdf') {
          // For PDFs, render the first page as thumbnail
          await renderPdfThumbnail();
        } else {
          // For Word docs, we can't generate preview easily
          setLoading(false);
        }
      } catch (err) {
        console.error('Thumbnail generation error:', err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    const renderPdfThumbnail = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(filePath).promise;
        const page = await pdf.getPage(1);
        
        // Calculate scale for thumbnail (target ~300px width for better quality)
        const viewport = page.getViewport({ scale: 1 });
        const scale = 300 / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not get canvas context');
        }

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any).promise;

        if (!cancelled) {
          setThumbnailUrl(canvas.toDataURL('image/jpeg', 0.85));
          setLoading(false);
        }
      } catch (err) {
        console.error('PDF thumbnail error:', err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    generateThumbnail();

    return () => {
      cancelled = true;
    };
  }, [filePath, fileType]);

  // Loading state - simple gray placeholder
  if (loading) {
    return (
      <div className="w-full aspect-[4/3] rounded-xl bg-slate-700/50 flex items-center justify-center border border-slate-600">
        <div className="text-slate-500 text-xs">Loading...</div>
      </div>
    );
  }

  // Error state or Word docs - show consistent colored placeholder
  if (error || (fileType === 'word' && !thumbnailUrl)) {
    // PDF: blue, Word: emerald/green
    const fallbackColor = fileType === 'pdf' 
      ? 'bg-blue-900/30 border-blue-800/50 text-blue-400/60'
      : 'bg-emerald-900/30 border-emerald-800/50 text-emerald-400/60';
    
    return (
      <div className={`w-full aspect-[4/3] rounded-xl ${fallbackColor} flex flex-col items-center justify-center border`}>
        <DocumentIcon className="h-10 w-10" />
        <span className="text-xs mt-1 text-slate-400">{fileType.toUpperCase()}</span>
      </div>
    );
  }

  // Success - show actual preview
  return (
    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-600 bg-slate-900">
      <img
        src={thumbnailUrl || ''}
        alt={`Preview of ${title}`}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

export default ThumbnailPreview;
