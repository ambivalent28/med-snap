import { PlusIcon } from '@heroicons/react/24/solid';
import { useMemo, useState } from 'react';
import GuidelineCard from './components/GuidelineCard';
import SearchBar from './components/SearchBar';
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';
import ViewerModal from './components/ViewerModal';
import { mockGuidelines } from './data/mockGuidelines';
import { supabase } from './lib/supabase';
import type { Guideline, UploadFormValues } from './types';

function App() {
  const [guidelines, setGuidelines] = useState<Guideline[]>(mockGuidelines);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [active, setActive] = useState<Guideline | null>(null);

  const categories = useMemo(() => {
    const set = new Set(guidelines.map((g) => g.category || 'General'));
    return Array.from(set).sort();
  }, [guidelines]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return guidelines.filter((g) => {
      const matchesCategory = !category || g.category === category;
      const matchesSearch =
        g.title.toLowerCase().includes(term) ||
        g.notes?.toLowerCase().includes(term) ||
        g.tags.some((t) => t.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [guidelines, category, search]);

  const handleUpload = async (file: File, form: UploadFormValues) => {
    // NOTE: This is a thin placeholder. Wire to Supabase Storage + DB in implementation.
    const fileType: Guideline['file_type'] = file.type === 'application/pdf' ? 'pdf' : 'image';

    const newGuideline: Guideline = {
      id: crypto.randomUUID(),
      user_id: 'demo-user',
      title: form.title,
      category: form.category || 'General',
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      notes: form.notes || null,
      source_url: form.source_url || null,
      file_path: URL.createObjectURL(file), // replace with Supabase Storage public URL
      file_type: fileType,
      created_at: new Date().toISOString()
    };

    // Example Supabase flow (commented for scaffolding):
    // const { data, error } = await supabase.storage.from('guidelines').upload(`user/${file.name}`, file);
    // if (error) throw error;
    // const { data: publicUrl } = supabase.storage.from('guidelines').getPublicUrl(data.path);
    // await supabase.from('guidelines').insert({ ...newGuideline, file_path: publicUrl.publicUrl });

    setGuidelines((prev) => [newGuideline, ...prev]);
  };

  const openViewer = (g: Guideline) => {
    setActive(g);
    setViewerOpen(true);
  };

  return (
    <div className="min-h-screen px-8 py-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl bg-white/80 px-6 py-4 shadow-sm ring-1 ring-slate-100 glass-panel">
        <div>
          <div className="text-sm font-semibold text-brand-700">MedSnap</div>
          <p className="text-xs text-slate-500">
            Personal clinical reference vault (no patient data, inline viewing)
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <PlusIcon className="h-4 w-4" />
          Upload
        </button>
      </header>

      <main className="mx-auto mt-6 flex max-w-6xl gap-6">
        <Sidebar categories={categories} selected={category} onSelect={setCategory} />
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-slate-100 glass-panel">
            <SearchBar value={search} onChange={setSearch} />
            <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
              <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                Inline PDFs + images
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                Desktop-first
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((guideline) => (
              <GuidelineCard key={guideline.id} guideline={guideline} onOpen={openViewer} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-slate-500">
                No guidelines yet. Upload your first PDF or image.
              </div>
            )}
          </div>
        </div>
      </main>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSubmit={handleUpload} />
      <ViewerModal open={viewerOpen} guideline={active} onClose={() => setViewerOpen(false)} />
    </div>
  );
}

export default App;

