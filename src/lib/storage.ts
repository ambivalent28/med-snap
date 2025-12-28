import { supabase } from './supabase';

export async function uploadFile(
  bucket: string,
  filePath: string,
  file: File
): Promise<{ path: string; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

    if (error) {
      // Provide more helpful error messages
      if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
        return { 
          path: '', 
          error: new Error(`Storage bucket "${bucket}" not found. Please create it in your Supabase dashboard under Storage.`) 
        };
      }
      return { path: '', error };
    }

    return { path: data.path, error: null };
  } catch (err) {
    return { 
      path: '', 
      error: err instanceof Error ? err : new Error('Upload failed') 
    };
  }
}

export async function getSignedUrl(bucket: string, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600); // URL valid for 1 hour
  
  if (error) {
    console.error('Error creating signed URL:', error);
    return '';
  }
  
  return data?.signedUrl || '';
}

export async function deleteFile(bucket: string, path: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error };
}

