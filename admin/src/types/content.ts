export interface ContentItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: string;
  tags: string[];
  fileUrls: string[];
  contentText?: string; // Extracted text from OCR
  isPremium: boolean;
  status: 'draft' | 'published';
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  versions: ContentVersion[];
  thumbnailUrl?: string;
  fileType?: 'pdf' | 'video' | 'image';
  fileSize?: number;
  duration?: number; // For videos in seconds
  pageCount?: number; // For PDFs
}

export interface ContentVersion {
  id: string;
  versionNumber: number;
  title: string;
  description: string;
  fileUrls: string[];
  contentText?: string;
  createdAt: Date;
  createdBy: string;
  changes: string; // Description of changes made
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  url?: string;
  thumbnailUrl?: string;
}

export interface ContentFormData {
  title: string;
  description: string;
  subject: string;
  semester: string;
  tags: string[];
  isPremium: boolean;
  status: 'draft' | 'published';
  files: File[];
}

export interface AIGeneratedContent {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: string;
  tags: string[];
  contentText: string;
  isPremium: boolean;
  status: 'pending' | 'approved' | 'rejected';
  generatedAt: Date;
  generatedBy: string; // AI model/source
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  sourceContent?: string; // Original content that was used to generate this
}

export interface ContentFilters {
  subject?: string;
  semester?: string;
  status?: 'draft' | 'published' | 'all';
  isPremium?: boolean;
  tags?: string[];
  searchQuery?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ContentStats {
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  premiumContent: number;
  totalFiles: number;
  totalFileSize: number;
  contentBySubject: Record<string, number>;
  contentBySemester: Record<string, number>;
  recentUploads: ContentItem[];
}
