import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Select from 'react-select';
import { Save, Eye, EyeOff } from 'lucide-react';
import { ContentFormData } from '../types/content';
import FileUpload from './FileUpload';

const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  subject: z.string().min(1, 'Subject is required'),
  semester: z.string().min(1, 'Semester is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  isPremium: z.boolean(),
  status: z.enum(['draft', 'published']),
});

interface ContentFormProps {
  onSubmit: (data: ContentFormData & { fileUrls: string[] }) => void;
  initialData?: Partial<ContentFormData>;
  isLoading?: boolean;
  contentId: string;
}

const SUBJECTS = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'english', label: 'English' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'economics', label: 'Economics' },
  { value: 'business-studies', label: 'Business Studies' },
];

const SEMESTERS = [
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
];

const COMMON_TAGS = [
  { value: 'notes', label: 'Notes' },
  { value: 'lecture', label: 'Lecture' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'exam', label: 'Exam' },
  { value: 'practice', label: 'Practice' },
  { value: 'theory', label: 'Theory' },
  { value: 'practical', label: 'Practical' },
  { value: 'solved', label: 'Solved' },
  { value: 'important', label: 'Important' },
];

const ContentForm: React.FC<ContentFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  contentId,
}) => {
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      subject: initialData?.subject || '',
      semester: initialData?.semester || '',
      tags: initialData?.tags || [],
      isPremium: initialData?.isPremium || false,
      status: initialData?.status || 'draft',
    },
  });

  const formData = watch();

  const handleFormSubmit = (data: ContentFormData) => {
    onSubmit({ ...data, fileUrls });
  };

  const handleFilesUploaded = (urls: string[]) => {
    setFileUrls(prev => [...prev, ...urls]);
  };

  const removeFile = (url: string) => {
    setFileUrls(prev => prev.filter(fileUrl => fileUrl !== url));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {initialData ? 'Edit Content' : 'Create New Content'}
        </h2>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
        </button>
      </div>

      <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter content title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter content description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Subject and Semester */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject *</label>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={SUBJECTS}
                    value={SUBJECTS.find(s => s.value === field.value)}
                    onChange={(option) => field.onChange(option?.value)}
                    placeholder="Select subject"
                    className="text-sm"
                  />
                )}
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Semester *</label>
              <Controller
                name="semester"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={SEMESTERS}
                    value={SEMESTERS.find(s => s.value === field.value)}
                    onChange={(option) => field.onChange(option?.value)}
                    placeholder="Select semester"
                    className="text-sm"
                  />
                )}
              />
              {errors.semester && (
                <p className="text-red-500 text-sm mt-1">{errors.semester.message}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags *</label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={COMMON_TAGS}
                  value={COMMON_TAGS.filter(tag => field.value?.includes(tag.value))}
                  onChange={(options) => field.onChange(options.map(option => option.value))}
                  isMulti
                  placeholder="Select tags"
                  className="text-sm"
                />
              )}
            />
            {errors.tags && (
              <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                {...register('isPremium')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium">Premium Content</label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                )}
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Files</label>
            <FileUpload
              onFilesUploaded={handleFilesUploaded}
              contentId={contentId}
              maxFiles={5}
            />
            
            {/* Uploaded Files List */}
            {fileUrls.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                <div className="space-y-2">
                  {fileUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm truncate">{url.split('/').pop()}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(url)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium
              ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Content'}</span>
          </button>
        </form>

        {/* Preview */}
        {showPreview && (
          <div className="border-l pl-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold">{formData.title || 'Untitled'}</h4>
                {formData.isPremium && (
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                    Premium
                  </span>
                )}
              </div>
              
              <div>
                <p className="text-gray-600">{formData.description || 'No description'}</p>
              </div>
              
              <div className="flex space-x-4 text-sm text-gray-500">
                <span>Subject: {formData.subject || 'Not selected'}</span>
                <span>Semester: {formData.semester || 'Not selected'}</span>
              </div>
              
              {formData.tags && formData.tags.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Tags: </span>
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mr-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                Status: <span className={`${formData.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {formData.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentForm;
