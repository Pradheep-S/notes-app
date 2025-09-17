import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ContentItem, ContentFilters, ContentStats } from '../types/content';

export class ContentService {
  private collectionName = 'content';

  async createContent(data: Omit<ContentItem, 'id' | 'createdAt' | 'versions'>): Promise<string> {
    const contentData = {
      ...data,
      createdAt: Timestamp.now(),
      versions: [],
    };

    const docRef = await addDoc(collection(db, this.collectionName), contentData);
    return docRef.id;
  }

  async updateContent(id: string, data: Partial<ContentItem>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(docRef, updateData);
  }

  async deleteContent(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getContent(id: string): Promise<ContentItem | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as ContentItem;
    }
    
    return null;
  }

  async getContentList(
    filters: ContentFilters = {},
    pageSize: number = 20,
    lastDoc?: QueryDocumentSnapshot
  ): Promise<{ items: ContentItem[]; lastDoc?: QueryDocumentSnapshot }> {
    let q = query(collection(db, this.collectionName));

    // Apply filters
    if (filters.subject) {
      q = query(q, where('subject', '==', filters.subject));
    }
    
    if (filters.semester) {
      q = query(q, where('semester', '==', filters.semester));
    }
    
    if (filters.status && filters.status !== 'all') {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.isPremium !== undefined) {
      q = query(q, where('isPremium', '==', filters.isPremium));
    }
    
    if (filters.tags && filters.tags.length > 0) {
      q = query(q, where('tags', 'array-contains-any', filters.tags));
    }

    // Add ordering and pagination
    q = query(q, orderBy('createdAt', 'desc'), limit(pageSize));
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const items: ContentItem[] = [];
    let newLastDoc: QueryDocumentSnapshot | undefined;

    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as ContentItem);
      newLastDoc = doc;
    });

    return { items, lastDoc: newLastDoc };
  }

  async searchContent(searchQuery: string, pageSize: number = 20): Promise<ContentItem[]> {
    // Note: This is a basic search. For production, consider using Algolia or Elasticsearch
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    const querySnapshot = await getDocs(q);
    const items: ContentItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const searchText = `${data.title} ${data.description} ${data.subject} ${data.tags?.join(' ')} ${data.contentText || ''}`.toLowerCase();
      
      if (searchText.includes(searchQuery.toLowerCase())) {
        items.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as ContentItem);
      }
    });

    return items;
  }

  async getContentStats(): Promise<ContentStats> {
    const q = query(collection(db, this.collectionName));
    const querySnapshot = await getDocs(q);

    const stats: ContentStats = {
      totalContent: 0,
      publishedContent: 0,
      draftContent: 0,
      premiumContent: 0,
      totalFiles: 0,
      totalFileSize: 0,
      contentBySubject: {},
      contentBySemester: {},
      recentUploads: [],
    };

    const recentItems: ContentItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.totalContent++;

      if (data.status === 'published') {
        stats.publishedContent++;
      } else {
        stats.draftContent++;
      }

      if (data.isPremium) {
        stats.premiumContent++;
      }

      stats.totalFiles += data.fileUrls?.length || 0;
      stats.totalFileSize += data.fileSize || 0;

      // Count by subject
      if (data.subject) {
        stats.contentBySubject[data.subject] = (stats.contentBySubject[data.subject] || 0) + 1;
      }

      // Count by semester
      if (data.semester) {
        stats.contentBySemester[data.semester] = (stats.contentBySemester[data.semester] || 0) + 1;
      }

      recentItems.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as ContentItem);
    });

    // Get recent uploads (last 5)
    stats.recentUploads = recentItems
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    return stats;
  }

  async publishContent(id: string): Promise<void> {
    await this.updateContent(id, { status: 'published' });
  }

  async unpublishContent(id: string): Promise<void> {
    await this.updateContent(id, { status: 'draft' });
  }

  async addVersion(contentId: string, versionData: any): Promise<void> {
    const content = await this.getContent(contentId);
    if (!content) throw new Error('Content not found');

    const newVersion = {
      id: Date.now().toString(),
      versionNumber: content.versions.length + 1,
      ...versionData,
      createdAt: new Date(),
    };

    const updatedVersions = [...content.versions, newVersion];
    await this.updateContent(contentId, { versions: updatedVersions });
  }
}
