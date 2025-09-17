import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';
import { ContentService } from '../services/contentService';
import { ContentItem, ContentFormData } from '../types/content';
import { useAuth } from '../contexts/AuthContext';
import ContentForm from '../components/ContentForm';
import { v4 as uuidv4 } from 'uuid';

const ContentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const contentService = new ContentService();
  const isEditing = id !== 'new';
  const contentId = id === 'new' ? uuidv4() : id!;

  useEffect(() => {
    if (isEditing) {
      loadContent();
    }
  }, [id, isEditing]);

  const loadContent = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const contentData = await contentService.getContent(id);
      setContent(contentData);
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
      navigate('/content');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: ContentFormData & { fileUrls: string[] }) => {
    if (!user) return;

    setSaving(true);
    try {
      const contentData = {
        ...formData,
        createdBy: user.uid,
      };

      if (isEditing) {
        await contentService.updateContent(contentId, contentData);
        toast.success('Content updated successfully');
      } else {
        await contentService.createContent(contentData);
        toast.success('Content created successfully');
      }
      
      navigate('/content');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/content')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Content</span>
        </button>
      </div>

      <ContentForm
        onSubmit={handleSubmit}
        initialData={content || undefined}
        isLoading={saving}
        contentId={contentId}
      />
    </div>
  );
};

export default ContentEditor;
