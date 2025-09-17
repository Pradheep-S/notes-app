import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { AIGeneratedContent } from '../types/content';

// Mock service - replace with actual service
class AIContentService {
  async getPendingContent(): Promise<AIGeneratedContent[]> {
    // Simulate API call
    return [
      {
        id: '1',
        title: 'Introduction to Calculus - Derivatives',
        description: 'AI-generated content covering basic derivative concepts',
        subject: 'mathematics',
        semester: '2',
        tags: ['calculus', 'derivatives', 'math'],
        contentText: 'A derivative represents the rate of change of a function...',
        isPremium: false,
        status: 'pending',
        generatedAt: new Date('2024-01-15'),
        generatedBy: 'GPT-4',
        sourceContent: 'Based on Chapter 3 of Advanced Mathematics textbook',
      },
      {
        id: '2',
        title: 'Physics: Newton\'s Laws of Motion',
        description: 'Comprehensive explanation of Newton\'s three laws',
        subject: 'physics',
        semester: '1',
        tags: ['physics', 'mechanics', 'newton'],
        contentText: 'Newton\'s first law states that an object at rest...',
        isPremium: true,
        status: 'pending',
        generatedAt: new Date('2024-01-14'),
        generatedBy: 'Claude-3',
        sourceContent: 'Generated from Physics lecture notes',
      },
    ];
  }

  async approveContent(id: string, reviewNotes?: string): Promise<void> {
    // Simulate API call
    console.log(`Approving content ${id} with notes: ${reviewNotes}`);
  }

  async rejectContent(id: string, reviewNotes: string): Promise<void> {
    // Simulate API call
    console.log(`Rejecting content ${id} with notes: ${reviewNotes}`);
  }
}

const AIContentApproval: React.FC = () => {
  const [pendingContent, setPendingContent] = useState<AIGeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<AIGeneratedContent | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const aiContentService = new AIContentService();

  useEffect(() => {
    loadPendingContent();
  }, []);

  const loadPendingContent = async () => {
    setLoading(true);
    try {
      const content = await aiContentService.getPendingContent();
      setPendingContent(content);
    } catch (error) {
      console.error('Error loading pending content:', error);
      toast.error('Failed to load pending content');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contentId: string) => {
    setActionLoading(contentId);
    try {
      await aiContentService.approveContent(contentId, reviewNotes);
      setPendingContent(prev => prev.filter(c => c.id !== contentId));
      toast.success('Content approved successfully');
      setSelectedContent(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error approving content:', error);
      toast.error('Failed to approve content');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (contentId: string) => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide review notes for rejection');
      return;
    }

    setActionLoading(contentId);
    try {
      await aiContentService.rejectContent(contentId, reviewNotes);
      setPendingContent(prev => prev.filter(c => c.id !== contentId));
      toast.success('Content rejected');
      setSelectedContent(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast.error('Failed to reject content');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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
        <h1 className="text-2xl font-bold mb-2">AI Content Approval</h1>
        <p className="text-gray-600">
          Review and approve AI-generated content before publishing
        </p>
      </div>

      {pendingContent.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending content</h3>
          <p className="text-gray-500">All AI-generated content has been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pending Review ({pendingContent.length})</h2>
            <div className="space-y-3">
              {pendingContent.map((content) => (
                <div
                  key={content.id}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedContent?.id === content.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedContent(content)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {content.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {content.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{content.subject}</span>
                        <span>Sem {content.semester}</span>
                        <span>By {content.generatedBy}</span>
                        <span>{formatDate(content.generatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {content.isPremium && (
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Premium
                          </span>
                        )}
                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Detail */}
          <div className="bg-white border rounded-lg">
            {selectedContent ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold">{selectedContent.title}</h2>
                  <button
                    onClick={() => setSelectedContent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-700">Subject:</label>
                      <p className="text-gray-600">{selectedContent.subject}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Semester:</label>
                      <p className="text-gray-600">{selectedContent.semester}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Generated by:</label>
                      <p className="text-gray-600">{selectedContent.generatedBy}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Generated at:</label>
                      <p className="text-gray-600">{formatDate(selectedContent.generatedAt)}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="font-medium text-gray-700">Description:</label>
                    <p className="text-gray-600 mt-1">{selectedContent.description}</p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="font-medium text-gray-700">Tags:</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedContent.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Source Content */}
                  {selectedContent.sourceContent && (
                    <div>
                      <label className="font-medium text-gray-700">Source:</label>
                      <p className="text-gray-600 text-sm mt-1">{selectedContent.sourceContent}</p>
                    </div>
                  )}

                  {/* Content Text */}
                  <div>
                    <label className="font-medium text-gray-700">Content:</label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedContent.contentText}
                      </p>
                    </div>
                  </div>

                  {/* Review Notes */}
                  <div>
                    <label className="font-medium text-gray-700">Review Notes:</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add your review notes here (required for rejection)..."
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleApprove(selectedContent.id)}
                      disabled={actionLoading === selectedContent.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {actionLoading === selectedContent.id ? 'Approving...' : 'Approve & Publish'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleReject(selectedContent.id)}
                      disabled={actionLoading === selectedContent.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>
                        {actionLoading === selectedContent.id ? 'Rejecting...' : 'Reject'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select content from the list to review</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIContentApproval;
