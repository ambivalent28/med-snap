import { PlusIcon, ArrowsUpDownIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuidelineCard from '../components/GuidelineCard';
import LimitReachedBanner from '../components/LimitReachedBanner';
import PricingModal from '../components/PricingModal';
import ProfileModal from '../components/ProfileModal';
import SearchBar from '../components/SearchBar';
import Sidebar from '../components/Sidebar';
import UploadModal from '../components/UploadModal';
import ViewerModal from '../components/ViewerModal';
import { useAuth } from '../hooks/useAuth';
import { deleteFile, getSignedUrl, uploadFile } from '../lib/storage';
import { supabase } from '../lib/supabase';
import type { Guideline, UploadFormValues } from '../types';

const FREE_UPLOAD_LIMIT = 10;

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'alpha-asc' | 'alpha-desc'>('date-desc');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
        // Profile doesn't exist - create one
        if (error.code === 'PGRST116') {
          // Creating new profile for user
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.email,
              upload_count: 0,
              subscription_status: 'free',
              subscription_plan: 'free',
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
          }
          
          setProfile({
            upload_count: newProfile?.upload_count ?? 0,
            subscription_status: newProfile?.subscription_status ?? 'free',
            subscription_plan: newProfile?.subscription_plan ?? 'free',
          });
        } else {
          console.error('Error loading profile:', error);
          setProfile({
            upload_count: 0,
            subscription_status: 'free',
            subscription_plan: 'free',
          });
        }
      } else {
        setProfile({
          upload_count: data?.upload_count ?? 0,
          subscription_status: data?.subscription_status ?? 'free',
          subscription_plan: data?.subscription_plan ?? 'free',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile({
        upload_count: 0,
        subscription_status: 'free',
        subscription_plan: 'free',
      });
    }
  };

  const categories = useMemo(() => {
    const set = new Set(guidelines.map((g) => g.category).filter(c => c && c.trim() !== ''));
    set.add('General');
    return Array.from(set).sort();
  }, [guidelines]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    const filteredList = guidelines.filter((g) => {
      const matchesCategory = !category || g.category === category;
      const matchesSearch =
        g.title.toLowerCase().includes(term) ||
        g.notes?.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });

    // Apply sorting
    return filteredList.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [guidelines, category, search, sortBy]);

  const handleUpload = async (file: File, form: UploadFormValues) => {
    if (!user) {
      throw new Error('You must be logged in to upload files');
    }

    // Check upload limit - use actual guidelines count for accuracy
    const subscriptionStatus = profile?.subscription_status;
    const isFree = !subscriptionStatus || (subscriptionStatus !== 'active' && subscriptionStatus !== 'cancelling');
    const uploadLimit = isFree ? FREE_UPLOAD_LIMIT : Infinity;

    if (guidelines.length >= uploadLimit) {
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

  const handleUpdateGuidelineCategory = async (guidelineId: string, newCategory: string) => {
    if (!user) return;

    try {
      // Update in database
      const { error } = await supabase
        .from('guidelines')
        .update({ category: newCategory })
        .eq('id', guidelineId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating guideline category:', error);
        alert('Failed to update category. Please try again.');
        return;
      }

      setGuidelines((prev) =>
        prev.map((g) => g.id === guidelineId ? { ...g, category: newCategory } : g)
      );
    } catch (error) {
      console.error('Error updating guideline category:', error);
      alert('Failed to update category. Please try again.');
    }
  };

  const handleUpdateGuideline = async (guideline: Guideline, updates: Partial<Guideline>, newFile?: File) => {
    if (!user) return;

    try {
      let newFilePath = guideline.file_path;
      let newFileType = guideline.file_type;

      // If a new file is provided, upload it and delete the old one
      if (newFile) {
        // Determine file type
        if (newFile.type === 'application/pdf') {
          newFileType = 'pdf';
        } else if (newFile.type.includes('word') || newFile.type.includes('msword')) {
          newFileType = 'word';
        } else {
          newFileType = 'image';
        }

        // Create unique file path
        const timestamp = Date.now();
        const sanitizedFileName = newFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${user.id}/${timestamp}-${sanitizedFileName}`;

        // Upload new file
        const { path, error: uploadError } = await uploadFile('guidelines', filePath, newFile);
        
        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        // Delete old file (extract path from URL if needed)
        try {
          let oldFilePath = guideline.file_path;
          try {
            const url = new URL(guideline.file_path);
            const pathParts = url.pathname.split('/');
            const bucketIndex = pathParts.findIndex((part) => part === 'guidelines');
            if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
              oldFilePath = pathParts.slice(bucketIndex + 1).join('/');
            }
          } catch {
            // If not a valid URL, assume it's already a path
          }
          await deleteFile('guidelines', oldFilePath);
        } catch (deleteErr) {
          console.warn('Could not delete old file:', deleteErr);
        }

        // Get signed URL for the new file
        const signedUrl = await getSignedUrl('guidelines', path);
        newFilePath = signedUrl || path;
      }

      const { error } = await supabase
        .from('guidelines')
        .update({
          title: updates.title,
          category: updates.category || 'General',
          tags: updates.tags,
          notes: updates.notes,
          source_url: updates.source_url,
          ...(newFile && { 
            file_path: newFilePath.includes('://') ? newFilePath.split('/').pop() : newFilePath,
            file_type: newFileType 
          })
        })
        .eq('id', guideline.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating guideline:', error);
        throw new Error('Failed to update guideline');
      }

      const updatedGuideline = {
        ...guideline,
        ...updates,
        category: updates.category || guideline.category,
        ...(newFile && { file_path: newFilePath, file_type: newFileType })
      };

      setGuidelines((prev) =>
        prev.map((g) => g.id === guideline.id ? updatedGuideline : g)
      );

      // Update active guideline if it's the one being edited
      if (active?.id === guideline.id) {
        setActive(updatedGuideline);
      }
    } catch (error) {
      console.error('Error updating guideline:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      // Use window.location to force a full page reload and clear all state
      window.location.href = '/';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between rounded-xl sm:rounded-2xl bg-slate-800 border border-slate-700 px-3 sm:px-6 py-3 sm:py-4 shadow-sm glass-panel">
        {/* Left side - Logo and Account Info */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img src="/logo.svg" alt="MedSnap" className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm font-semibold text-brand-500 hidden xs:inline">MedSnap</span>
          </div>
          
          {/* Account Info - hidden on mobile */}
          <div className="hidden md:flex items-center gap-3">
            <div className="h-6 w-px bg-slate-600" />
            <div className="text-left">
              <p className="text-xs font-medium text-slate-300">{user.email}</p>
              <p className="text-xs text-slate-500">
                {profile?.subscription_status === 'active' || profile?.subscription_status === 'cancelling' 
                  ? 'Pro Account' 
                  : 'Free Account'}
              </p>
            </div>
          </div>
          
          {/* Usage Indicator */}
          <div className="hidden sm:flex items-center">
            <div className="h-6 w-px bg-slate-600 mr-3" />
            <div className="flex items-center gap-2 rounded-lg bg-slate-700/50 px-2 sm:px-3 py-1 sm:py-1.5">
              <span className="text-[10px] sm:text-xs font-medium text-slate-300">
                {profile?.subscription_status === 'active' || profile?.subscription_status === 'cancelling' ? (
                  <span className="text-brand-400">Pro</span>
                ) : (
                  <span className={guidelines.length >= FREE_UPLOAD_LIMIT ? 'text-red-400' : 'text-brand-400'}>
                    {Math.max(0, FREE_UPLOAD_LIMIT - guidelines.length)} left
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        
        {/* Right side - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {profile && profile.subscription_status !== 'active' && profile.subscription_status !== 'cancelling' && (
            <button
              onClick={() => setPricingOpen(true)}
              className="rounded-lg bg-brand-600/20 border border-brand-600/50 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-brand-400 transition hover:bg-brand-600/30"
            >
              Upgrade
            </button>
          )}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 hover:bg-slate-700 hover:text-slate-300"
          >
            <UserCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Account</span>
          </button>
          <button
            onClick={handleSignOut}
            className="hidden sm:block rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 hover:bg-slate-700 hover:text-slate-300"
          >
            Sign Out
          </button>
          <div className="h-5 sm:h-6 w-px bg-slate-600 hidden sm:block" />
          <button
            onClick={() => {
              const subscriptionStatus = profile?.subscription_status;
              const isFree = !subscriptionStatus || subscriptionStatus === 'inactive';
              const uploadLimit = isFree ? FREE_UPLOAD_LIMIT : Infinity;

              if (guidelines.length >= uploadLimit) {
                setPricingOpen(true);
              } else {
                setUploadOpen(true);
              }
            }}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-emerald-600 px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:bg-emerald-500 hover:scale-105 hover:shadow-emerald-500/30 active:scale-95"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">Upload</span>
          </button>
        </div>
      </header>

      <main className="mx-auto mt-4 sm:mt-6 flex max-w-6xl gap-4 sm:gap-6">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block w-56 lg:w-64 space-y-4 flex-shrink-0">
          <Sidebar 
            categories={categories} 
            selected={category} 
            onSelect={setCategory}
            guidelines={guidelines}
            onUpdateGuidelineCategory={handleUpdateGuidelineCategory}
          />
        </div>
        <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 rounded-xl sm:rounded-2xl bg-slate-800 border border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm glass-panel">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            
            <div className="flex items-center gap-2">
              {/* Category filter for mobile */}
              <select
                value={category || ''}
                onChange={(e) => setCategory(e.target.value || null)}
                className="md:hidden rounded-lg border border-slate-600 bg-slate-700 px-2 py-1.5 text-xs text-slate-200 focus:border-brand-500 focus:outline-none flex-1"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ArrowsUpDownIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-lg border border-slate-600 bg-slate-700 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="date-desc">Newest</option>
                  <option value="date-asc">Oldest</option>
                  <option value="alpha-asc">A → Z</option>
                  <option value="alpha-desc">Z → A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Limit Reached Banner */}
          {profile?.subscription_status !== 'active' && profile?.subscription_status !== 'cancelling' && guidelines.length >= FREE_UPLOAD_LIMIT && (
            <LimitReachedBanner onUpgrade={() => setPricingOpen(true)} />
          )}

          {loading ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-700 bg-slate-800/60 p-4 sm:p-6 text-center text-sm text-slate-400">
              Loading your references...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {filtered.map((guideline) => (
                <GuidelineCard
                  key={guideline.id}
                  guideline={guideline}
                  onOpen={openViewer}
                  onDelete={handleDelete}
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-slate-700 bg-slate-800/60 p-4 sm:p-6 text-center text-sm text-slate-400">
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
      <ViewerModal 
        open={viewerOpen} 
        guideline={active} 
        onClose={() => setViewerOpen(false)}
        onUpdate={handleUpdateGuideline}
        onDelete={handleDelete}
        existingCategories={categories}
      />
      {user && (
        <PricingModal
          open={pricingOpen}
          onClose={() => setPricingOpen(false)}
          userId={user.id}
        />
      )}
      {user && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={{ email: user.email || '', id: user.id }}
          profile={profile}
          onSubscriptionCancelled={async () => {
            await loadProfile();
            // Force a small delay to ensure state updates
            await new Promise(resolve => setTimeout(resolve, 100));
          }}
        />
      )}
    </div>
  );
}

