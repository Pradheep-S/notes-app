import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, Video, File as FileIcon } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { UploadProgress } from '../types/content';

interface FileUploadProps {
  onFilesUploaded: (urls: string[]) => void;
  contentId: string;
  maxFiles?: number;
  disabled?: boolean;
}

interface FileWithPreview extends File {
  preview: string;
  id: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  contentId,
  maxFiles = 10,
  disabled = false,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [isUploading, setIsUploading] = useState(false);

  const storageService = new StorageService();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || isUploading) return;

    const validFiles: FileWithPreview[] = [];
    
    for (const file of acceptedFiles) {
      const validation = storageService.validateFile(file);
      if (validation.isValid) {
        const fileWithPreview = Object.assign(file, {
          preview: await storageService.generateThumbnail(file),
          id: `${Date.now()}-${Math.random()}`,
        });
        validFiles.push(fileWithPreview);
      } else {
        // Show error for invalid files
        console.error(`Invalid file ${file.name}: ${validation.error}`);
      }
    }

    setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
  }, [disabled, isUploading, maxFiles, storageService]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    maxFiles,
    disabled: disabled || isUploading,
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const onProgress = (progress: UploadProgress) => {
          setUploadProgress(prev => ({
            ...prev,
            [file.id]: progress,
          }));
        };

        const url = await storageService.uploadFile(file, contentId, onProgress);
        uploadedUrls.push(url);
      }

      onFilesUploaded(uploadedUrls);
      setFiles([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    const type = storageService.getFileType(file);
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'image':
        return <Image className="w-6 h-6 text-green-500" />;
      case 'video':
        return <Video className="w-6 h-6 text-blue-500" />;
      default:
        return <FileIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-600">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, images, and videos up to 200MB
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Selected Files</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file) => {
              const progress = uploadProgress[file.id];
              return (
                <div
                  key={file.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {file.preview && storageService.getFileType(file) === 'image' ? (
                      <img
                        src={file.preview}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      getFileIcon(file)
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {storageService.formatFileSize(file.size)}
                    </p>
                    
                    {/* Progress Bar */}
                    {progress && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              progress.status === 'error'
                                ? 'bg-red-500'
                                : progress.status === 'completed'
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {progress.status === 'uploading' && `${Math.round(progress.progress)}%`}
                          {progress.status === 'completed' && 'Completed'}
                          {progress.status === 'error' && progress.error}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  {!isUploading && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload Button */}
          <button
            onClick={uploadFiles}
            disabled={isUploading || files.length === 0}
            className={`
              w-full py-2 px-4 rounded-md font-medium transition-colors
              ${
                isUploading || files.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isUploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
