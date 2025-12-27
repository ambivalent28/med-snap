export type FileType = 'pdf' | 'image';

export interface Guideline {
  id: string;
  user_id: string;
  title: string;
  category: string;
  tags: string[];
  notes?: string | null;
  source_url?: string | null;
  file_path: string;
  file_type: FileType;
  created_at: string;
}

export interface UploadFormValues {
  title: string;
  category: string;
  tags: string;
  notes: string;
  source_url: string;
  confirmNoPhi: boolean;
}
