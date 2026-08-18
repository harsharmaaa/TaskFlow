import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { taskUpdatedFromSocket } from '../store/boardSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

function AttachmentUpload({ taskId, attachments = [] }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return toast.error('File size exceeds the 10MB limit');
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    const toastId = toast.loading('Uploading attachment to Cloudinary...');

    try {
      const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('File attached successfully!', { id: toastId });
      dispatch(taskUpdatedFromSocket(response.data));
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to upload file',
        { id: toastId }
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'pdf':
        return '📕';
      case 'doc':
      case 'docx':
        return '📘';
      case 'xls':
      case 'xlsx':
        return '📗';
      case 'zip':
      case 'rar':
      case '7z':
        return '📦';
      default:
        return '📎';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="px-4 py-2 rounded-btn text-xs font-semibold bg-cardBg border border-borderSep hover:border-textMuted/30 text-textMuted hover:text-textPrimary transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <span>📎</span>
              <span>Upload Attachment</span>
            </>
          )}
        </button>
        <span className="text-[10px] text-textMuted/60 select-none">
          Max size: 10MB
        </span>
      </div>

      {/* Attachments List */}
      <div className="space-y-2">
        {attachments.map((att, idx) => (
          <div
            key={att._id || idx}
            className="flex items-center justify-between p-3.5 rounded-card border border-borderSep bg-appBg/50 group hover:border-textMuted/20 hover:bg-appBg transition-all duration-150"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-sm select-none flex-shrink-0">
                {getFileIcon(att.filename)}
              </span>
              <div className="min-w-0">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-textMuted hover:text-accent truncate hover:underline block"
                  title="Open Attachment in new tab"
                >
                  {att.filename}
                </a>
                <span className="text-[9px] text-textMuted/40 block mt-0.5 select-none">
                  Uploaded by {att.uploadedBy?.name || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Action buttons: Download */}
            <a
              href={att.url}
              download={att.filename}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-btn border border-borderSep hover:border-textMuted/30 bg-cardBg text-textMuted hover:text-textPrimary transition-all text-xs opacity-80 group-hover:opacity-100"
              title="Download file"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
        ))}

        {attachments.length === 0 && (
          <div className="p-4 rounded-card border border-dashed border-borderSep bg-appBg/20 text-center text-xs text-textMuted/50 select-none italic">
            No files attached yet. Upload images, documents, or logs.
          </div>
        )}
      </div>
    </div>
  );
}

export default AttachmentUpload;
