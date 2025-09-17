import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { ContentService } from '../services/contentService';
import { ContentStats } from '../types/content';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);

  const contentService = new ContentService();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const statsData = await contentService.getContentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/content/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Content
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalContent || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.publishedContent || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.draftContent || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Premium</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.premiumContent || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content by Subject */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Content by Subject</h3>
          {stats?.contentBySubject && Object.keys(stats.contentBySubject).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.contentBySubject)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([subject, count]) => (
                  <div key={subject} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize text-gray-700">
                      {subject.replace('-', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No content available</p>
          )}
        </div>

        {/* Content by Semester */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Content by Semester</h3>
          {stats?.contentBySemester && Object.keys(stats.contentBySemester).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.contentBySemester)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([semester, count]) => (
                  <div key={semester} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Semester {semester}
                    </span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No content available</p>
          )}
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Uploads</h3>
            <Link
              to="/content"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          {stats?.recentUploads && stats.recentUploads.length > 0 ? (
            <div className="space-y-4">
              {stats.recentUploads.map((content) => (
                <div key={content.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{content.title}</p>
                      <p className="text-xs text-gray-500">
                        {content.subject} • Semester {content.semester}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        content.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {content.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(content.createdAt)}
                    </span>
                    <Link
                      to={`/content/${content.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent uploads</p>
              <Link
                to="/content/new"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload your first content
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Storage Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Storage Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Files</p>
            <p className="text-xl font-bold text-gray-900">{stats?.totalFiles || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Size</p>
            <p className="text-xl font-bold text-gray-900">
              {formatFileSize(stats?.totalFileSize || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">With Extracted Text</p>
            <p className="text-xl font-bold text-gray-900">
              {stats?.totalContent && stats?.totalContent > 0
                ? Math.round(((stats?.totalContent - stats?.draftContent) / stats?.totalContent) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
