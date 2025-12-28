import { PlusIcon } from '@heroicons/react/24/solid';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuidelineCard from '../components/GuidelineCard';
import PricingModal from '../components/PricingModal';
import SearchBar from '../components/SearchBar';
import Sidebar from '../components/Sidebar';
import UploadModal from '../components/UploadModal';
import UsageIndicator from '../components/UsageIndicator';
import ViewerModal from '../components/ViewerModal';
import { useAuth } from '../hooks/useAuth';
import { deleteFile, getSignedUrl, uploadFile } from '../lib/storage';
import { supabase } from '../lib/supabase';
import type { Guideline, UploadFormValues } from '../types';

const FREE_UPLOAD_LIMIT = 5;

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [active, setActive] = useState<Guideline | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    upload_count: number;
    subscription_status: string | null;
    subscription_plan: string | null;
  } | null>(null);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Load guidelines and profile from Supabase on mount
  useEffect(() => {
    if (user) {
      loadGuidelines();
      loadProfile();
    }
  }, [user]);

  const loadGuidelines = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guidelines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading guidelines:', error);
        setGuidelines([]);
      } else {
        // Generate signed URLs for each guideline
        const guidelinesWithSignedUrls = await Promise.all(
          (data || []).map(async (guideline) => {
            const signedUrl = await getSignedUrl('guidelines', guideline.file_path);
            // Ensure tags is always an array
            return {
              ...guideline,
              tags: guideline.tags || [],
              file_path: signedUrl || guideline.file_path
            };
          })
        );
        setGuidelines(guidelinesWithSignedUrls);
      }
    } catch (error) {
      console.error('Error loading guidelines:', error);
      setGuidelines([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('upload_count, subscription_status, subscription_plan')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        // Default to free tier
        setProfile({
          upload_count: guidelines.length,
          subscription_status: 'inactive',
          subscription_plan: 'free',
        });
      } else {
        setProfile({
          upload_count: data?.upload_count ?? guidelines.length,
          subscription_status: data?.subscription_status ?? 'inactive',
          subscription_plan: data?.subscription_plan ?? 'free',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile({
        upload_count: guidelines.length,
        subscription_status: 'inactive',
        subscription_plan: 'free',
      });
    }
  };

  const categories = useMemo(() => {
    const set = new Set(guidelines.map((g) => g.category || 'General'));
    // Always include 'General' as a default category
    set.add('General');
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
    if (!user) {
      throw new Error('You must be logged in to upload files');
    }

    // Check upload limit
    const uploadCount = profile?.upload_count ?? guidelines.length;
    const subscriptionStatus = profile?.subscription_status;
    const isFree = !subscriptionStatus || subscriptionStatus === 'inactive';
    const uploadLimit = isFree ? FREE_UPLOAD_LIMIT : Infinity;

    if (uploadCount >= uploadLimit) {
      setPricingOpen(true);
      throw new Error(`You've reached your upload limit. Please upgrade to Pro for unlimited uploads.`);
    }

    try {
      let fileType: Guideline['file_type'] = 'image';
      if (file.type === 'application/pdf') {
        fileType = 'pdf';
      } else if (file.type.includes('word') || file.type.includes('msword')) {
        fileType = 'word';
      }

      // Create unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${timestamp}-${sanitizedFileName}`;

      // Upload file to Supabase Storage
      const { path, error: uploadError } = await uploadFile('guidelines', filePath, file);
      
      if (uploadError) {
        if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
          throw new Error(
            `Storage bucket not set up. Please create a "guidelines" bucket in your Supabase dashboard:\n\n` +
            `1. Go to Storage in your Supabase dashboard\n` +
            `2. Click "Create a new bucket"\n` +
            `3. Name it "guidelines" and make it public\n` +
            `4. Set up the storage policies as described in SUPABASE_SETUP.md\n\n` +
            `See SUPABASE_SETUP.md for detailed instructions.`
          );
        }
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Store the storage path (not the URL) in the database
      // We'll generate signed URLs when loading guidelines
      const storagePath = path;

      // Prepare guideline data
      const guidelineData = {
        user_id: user.id,
        title: form.title,
        category: form.category || 'General',
        tags: Array.isArray(form.tags) ? form.tags : [],
        notes: form.notes || null,
        source_url: form.source_url || null,
        file_path: storagePath,
        file_type: fileType
      };

      // Insert into database
      const { data: insertedData, error: dbError } = await supabase
        .from('guidelines')
        .insert(guidelineData)
        .select()
        .single();

      if (dbError) {
        // If DB insert fails, try to clean up the uploaded file
        await supabase.storage.from('guidelines').remove([path]);
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      // Update local state - generate signed URL for the new guideline
      if (insertedData) {
        const signedUrl = await getSignedUrl('guidelines', insertedData.file_path);
        const guidelineWithUrl = {
          ...insertedData,
          tags: insertedData.tags || [],
          file_path: signedUrl || insertedData.file_path
        };
        setGuidelines((prev) => [guidelineWithUrl, ...prev]);
      } else {
        // Fallback: create guideline object manually if insert doesn't return data
        const signedUrl = await getSignedUrl('guidelines', storagePath);
        const newGuideline: Guideline = {
          id: crypto.randomUUID(),
          ...guidelineData,
          file_path: signedUrl || storagePath,
          created_at: new Date().toISOString()
        };
        setGuidelines((prev) => [newGuideline, ...prev]);
      }

      // Update upload count in profile
      const newUploadCount = (profile?.upload_count ?? guidelines.length) + 1;
      await supabase
        .from('profiles')
        .update({ upload_count: newUploadCount })
        .eq('user_id', user.id);
      
      // Reload profile to get updated count
      await loadProfile();
    } catch (error) {
      console.error('Upload error:', error);
      throw error; // Re-throw to let UploadModal handle the error
    }
  };

  const openViewer = (g: Guideline) => {
    setActive(g);
    setViewerOpen(true);
  };

  const handleDelete = async (guideline: Guideline) => {
    if (!user) return;

    try {
      // Extract file path from the public URL to delete from storage
      // Supabase Storage URLs are in format: https://[project].supabase.co/storage/v1/object/public/guidelines/[path]
      let filePath = guideline.file_path;
      try {
        const url = new URL(guideline.file_path);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex((part) => part === 'guidelines');
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          filePath = pathParts.slice(bucketIndex + 1).join('/');
        }
      } catch (urlError) {
        // If file_path is not a valid URL, assume it's already a path
        filePath = guideline.file_path;
      }

      // Delete from storage
      const { error: storageError } = await deleteFile('guidelines', filePath);
      if (storageError) {
        console.warn('Error deleting file from storage:', storageError);
        // Continue with DB deletion even if storage deletion fails
      }

      // Delete from database
      const { error } = await supabase.from('guidelines').delete().eq('id', guideline.id);

      if (error) {
        console.error('Error deleting guideline:', error);
        alert('Failed to delete guideline. Please try again.');
        return;
      }

      // Update local state
      setGuidelines((prev) => prev.filter((g) => g.id !== guideline.id));

      // Update upload count
      if (profile) {
        const newUploadCount = Math.max(0, profile.upload_count - 1);
        await supabase
          .from('profiles')
          .update({ upload_count: newUploadCount })
          .eq('user_id', user.id);
        await loadProfile();
      }
    } catch (error) {
      console.error('Error deleting guideline:', error);
      alert('Failed to delete guideline. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-8 py-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl bg-slate-800 border border-slate-700 px-6 py-4 shadow-sm glass-panel">
        {/* Left side - Logo and Upload */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="MedSnap" className="h-6 w-6" />
            <span className="text-sm font-semibold text-brand-500">MedSnap</span>
          </div>
          <div className="h-6 w-px bg-slate-600" />
          <button
            onClick={() => {
              const uploadCount = profile?.upload_count ?? guidelines.length;
              const subscriptionStatus = profile?.subscription_status;
              const isFree = !subscriptionStatus || subscriptionStatus === 'inactive';
              const uploadLimit = isFree ? FREE_UPLOAD_LIMIT : Infinity;

              if (uploadCount >= uploadLimit) {
                setPricingOpen(true);
              } else {
                setUploadOpen(true);
              }
            }}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <PlusIcon className="h-4 w-4" />
            Upload
          </button>
        </div>
        
        {/* Right side - Usage, Account, and Sign Out */}
        <div className="flex items-center gap-4">
          {/* Usage Indicator */}
          {profile && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-700/50 px-3 py-1.5">
              <span className="text-xs font-medium text-slate-300">
                {profile.subscription_status === 'active' ? (
                  <span className="text-brand-400">Pro Plan</span>
                ) : (
                  <>
                    <span className="text-slate-400">Free:</span>{' '}
                    <span className={profile.upload_count >= FREE_UPLOAD_LIMIT ? 'text-red-400' : 'text-brand-400'}>
                      {Math.max(0, FREE_UPLOAD_LIMIT - profile.upload_count)} remaining
                    </span>
                  </>
                )}
              </span>
            </div>
          )}
          
          {/* Account Dropdown */}
          <div className="flex items-center gap-3 border-l border-slate-600 pl-4">
            <div className="text-right">
              <p className="text-xs font-medium text-slate-300">{user.email}</p>
              <p className="text-xs text-slate-500">
                {profile?.subscription_status === 'active' ? 'Pro Account' : 'Free Account'}
              </p>
            </div>
            {profile && profile.subscription_status !== 'active' && (
              <button
                onClick={() => setPricingOpen(true)}
                className="rounded-lg bg-brand-600/20 border border-brand-600/50 px-3 py-1.5 text-xs font-semibold text-brand-400 transition hover:bg-brand-600/30"
              >
                Upgrade
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-700 hover:text-slate-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 flex max-w-6xl gap-6">
        <div className="w-64 space-y-4">
          <Sidebar categories={categories} selected={category} onSelect={setCategory} />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4 rounded-2xl bg-slate-800 border border-slate-700 px-4 py-3 shadow-sm glass-panel">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <button
              onClick={() => {
                // Search is already handled by the filtered useMemo, this button is just for UX
                // The search happens automatically as the user types, but this provides a visual action
                document.querySelector('input[type="search"]')?.focus();
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Search
            </button>
          </div>

          {loading ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-700 bg-slate-800/60 p-6 text-center text-slate-400">
              Loading your references...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((guideline) => (
                <GuidelineCard
                  key={guideline.id}
                  guideline={guideline}
                  onOpen={openViewer}
                  onDelete={handleDelete}
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-slate-700 bg-slate-800/60 p-6 text-center text-slate-400">
                  No references yet. Upload your first file to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <UploadModal 
        open={uploadOpen} 
        onClose={() => setUploadOpen(false)} 
        onSubmit={handleUpload}
        existingCategories={categories}
      />
      <ViewerModal open={viewerOpen} guideline={active} onClose={() => setViewerOpen(false)} />
      {user && (
        <PricingModal
          open={pricingOpen}
          onClose={() => setPricingOpen(false)}
          userId={user.id}
        />
      )}
    </div>
  );
}

