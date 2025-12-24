import React, { useEffect } from 'react';
import { CloseOutlined, DownloadOutlined } from '@ant-design/icons';

const AttachmentPreviewModal = ({
    isOpen,
    onClose,
    previewUrl,
    fileName,
    contentType,
    onDownload
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isImage = contentType?.startsWith('image/');
    const isPDF = contentType?.includes('pdf');
    const isVideo = contentType?.startsWith('video/');

    const renderPreviewContent = () => {
        if (isImage) {
            return (
                <img
                    src={previewUrl}
                    alt={fileName}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
            );
        } else if (isPDF) {
            return (
                <iframe
                    src={previewUrl}
                    title={fileName}
                    className="w-full h-[80vh] rounded-lg shadow-2xl bg-white"
                />
            );
        } else if (isVideo) {
            return (
                <video
                    controls
                    className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                    autoPlay
                >
                    <source src={previewUrl} type={contentType} />
                    Your browser does not support the video tag.
                </video>
            );
        } else {
            return (
                <div className="bg-white p-12 rounded-lg shadow-2xl text-center">
                    <div className="text-slate-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 mx-auto">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <p className="text-slate-700 font-medium mb-2">{fileName}</p>
                    <p className="text-slate-500 text-sm mb-6">Preview not available for this file type</p>
                    <button
                        onClick={onDownload}
                        className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <DownloadOutlined />
                        Download File
                    </button>
                </div>
            );
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Blurred Background Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                style={{ backdropFilter: 'blur(8px)' }}
            />

            {/* Modal Content */}
            <div
                className="relative z-10 max-w-7xl w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with filename and close button */}
                <div className="flex items-center justify-between mb-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-white font-medium truncate">
                            {fileName}
                        </div>
                        {contentType && (
                            <span className="text-white/60 text-sm px-2 py-1 bg-white/10 rounded">
                                {contentType.split('/')[1]?.toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Download Button */}
                        <button
                            onClick={onDownload}
                            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                            title="Download"
                        >
                            <DownloadOutlined className="text-lg" />
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                            title="Close (Esc)"
                        >
                            <CloseOutlined className="text-lg" />
                        </button>
                    </div>
                </div>

                {/* Preview Content */}
                <div className="flex items-center justify-center">
                    {renderPreviewContent()}
                </div>

                {/* Footer hint */}
                <div className="text-center mt-4 text-white/60 text-sm">
                    Press <kbd className="px-2 py-1 bg-white/10 rounded">Esc</kbd> or click outside to close
                </div>
            </div>
        </div>
    );
};

export default AttachmentPreviewModal;
