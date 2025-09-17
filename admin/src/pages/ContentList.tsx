import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
  Image,
  Video,
} from 'lucide-react';
import { ContentService } from '../services/contentService';
import { ContentItem, ContentFilters } from '../types/content';
import { toast } from 'react-toastify';

const ContentList: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ContentFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const contentService = new ContentService();

  useEffect(() => {
    loadContents();
  }, [filters]);

  const loadContents = async () => {
    setLoading(true);
    try {
      const result = await contentService.getContentList(filters);
      setContents(result.items);
    } catch (error) {
      console.error('Error loading contents:', error);
      toast.error('Failed to load contents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setLoading(true);
      try {
        const results = await contentService.searchContent(searchQuery);
        setContents(results);
      } catch (error) {
        console.error('Error searching contents:', error);
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    } else {
      loadContents();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await contentService.deleteContent(id);
      setContents(prev => prev.filter(content => content.id !== id));
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const handleStatusChange = async (id: string, status: 'published' | 'draft') => {
    try {
      if (status === 'published') {
        await contentService.publishContent(id);
      } else {
        await contentService.unpublishContent(id);
      }
      
      setContents(prev =>
        prev.map(content =>
          content.id === id ? { ...content, status } : content
        )
      );
      
      toast.success(`Content ${status === 'published' ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error updating content status:', error);
      toast.error('Failed to update content status');
    }
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'image':
        return <Image className="w-4 h-4 text-green-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <Link
          to="/content/new"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Content</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search content..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <select
              value={filters.subject || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value || undefined }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="computer-science">Computer Science</option>
            </select>

            <select
              value={filters.semester || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value || undefined }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem.toString()}>Semester {sem}</option>
              ))}
            </select>

            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value === 'all' ? undefined : e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <select
              value={filters.isPremium !== undefined ? filters.isPremium.toString() : ''}
              onChange={(e) => setFilters(prev => ({ ...prev, isPremium: e.target.value ? e.target.value === 'true' : undefined }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="false">Free</option>
              <option value="true">Premium</option>
            </select>
          </div>
        )}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first content.</p>
          <Link
            to="/content/new"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Content</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contents.map((content) => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {getFileIcon(content.fileType)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {content.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {content.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {content.isPremium && (
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Premium
                            </span>
                          )}
                          {content.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {content.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{content.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{content.subject}</div>
                    <div className="text-sm text-gray-500">Sem {content.semester}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        content.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {content.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(content.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(content.fileUrls[0], '_blank')}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/content/${content.id}`}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleStatusChange(
                          content.id,
                          content.status === 'published' ? 'draft' : 'published'
                        )}
                        className={`${
                          content.status === 'published'
                            ? 'text-yellow-600 hover:text-yellow-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={content.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContentList;
