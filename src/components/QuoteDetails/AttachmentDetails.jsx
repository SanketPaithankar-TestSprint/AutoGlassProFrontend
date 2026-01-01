import React, { useState } from "react";
import { UploadOutlined, FileTextOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, FilePdfOutlined, FileImageOutlined, FileOutlined, LoadingOutlined } from "@ant-design/icons";
import { Modal, message, Button, Alert } from "antd";
import { deleteAttachment } from "../../api/deleteAttachment";
import { downloadAndSaveAttachment, getAttachmentPreviewUrl } from "../../api/downloadAttachmentFile";
import { uploadAttachments } from "../../api/uploadAttachments";
import { getAttachmentsByDocumentNumber } from "../../api/getAttachmentsByDocumentNumber";
import AttachmentPreviewModal from "./AttachmentPreviewModal";
import { validateAndCompressFile, formatFileSize, isAllowedFileType } from "../../utils/fileCompression";

const AttachmentDetails = ({
    attachments = [],
    setAttachments,
    savedAttachments = [], // New prop for backend attachments
    setSavedAttachments, // New prop to update saved attachments after delete
    createdDocumentNumber = null, // Document number from successful creation
    customerData = {} // Customer data for customerId
}) => {
    const [downloadingIds, setDownloadingIds] = useState(new Set());
    const [previewCache, setPreviewCache] = useState(new Map()); // Cache preview URLs
    const [uploading, setUploading] = useState(false); // Upload loading state
    const [showAlert, setShowAlert] = useState(!!createdDocumentNumber); // Show alert when document number is available

    // Preview modal state
    const [previewModal, setPreviewModal] = useState({
        isOpen: false,
        url: null,
        fileName: '',
        contentType: '',
        attachmentId: null
    });

    // Cleanup all cached URLs on unmount
    React.useEffect(() => {
        return () => {
            // Revoke all cached blob URLs to prevent memory leaks
            previewCache.forEach(entry => {
                window.URL.revokeObjectURL(entry.url);
            });
        };
    }, [previewCache]);

    const handleFilesSelected = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const MAX_SIZE = 1024 * 1024; // 1MB

            const processedFiles = [];

            for (const file of files) {
                try {
                    // Validate file type
                    if (!isAllowedFileType(file)) {
                        message.error(`${file.name}: Only images and PDF files are allowed`);
                        continue;
                    }

                    // Validate and compress if needed
                    const result = await validateAndCompressFile(file, MAX_SIZE);

                    // Show compression message if file was compressed
                    if (result.wasCompressed) {
                        message.success(
                            `${file.name} compressed from ${formatFileSize(result.originalSize)} to ${formatFileSize(result.newSize)}`,
                            3
                        );
                    }

                    processedFiles.push({
                        id: Math.random().toString(36).substring(2, 9),
                        file: result.file,
                        description: "",
                        isNew: true,
                        wasCompressed: result.wasCompressed,
                        originalSize: result.originalSize
                    });
                } catch (error) {
                    console.error(`Error processing ${file.name}:`, error);
                    message.error(`${file.name}: ${error.message}`);
                }
            }

            if (processedFiles.length > 0) {
                // Append processed files to existing ones
                setAttachments(prev => [...prev, ...processedFiles]);
            }

            // Reset input so same file can be selected again if needed
            e.target.value = null;
        }
    };

    const handleRemove = (id) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
    };

    const handleDescriptionChange = (id, newDesc) => {
        setAttachments(prev => prev.map(att =>
            att.id === id ? { ...att, description: newDesc } : att
        ));
    };

    const handleDeleteSavedAttachment = (attachmentId, fileName) => {
        Modal.confirm({
            title: 'Delete Attachment',
            content: `Are you sure you want to delete "${fileName}"? This action cannot be undone.`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteAttachment(attachmentId);
                    message.success('Attachment deleted successfully');

                    // Update the saved attachments list
                    if (setSavedAttachments) {
                        setSavedAttachments(prev => prev.filter(att => att.attachmentId !== attachmentId));
                    }
                } catch (error) {
                    console.error('Failed to delete attachment:', error);
                    message.error('Failed to delete attachment: ' + error.message);
                }
            }
        });
    };

    const handleViewAttachment = async (attachmentId, fileName, contentType) => {
        try {
            setDownloadingIds(prev => new Set(prev).add(`view-${attachmentId}`));

            let previewUrl;
            const cached = previewCache.get(attachmentId);

            // Check if we have a valid cached URL
            if (cached && cached.expiresAt > Date.now()) {
                console.log(`Using cached preview URL for attachment ${attachmentId}`);
                previewUrl = cached.url;
            } else {
                // If cached URL expired, revoke it
                if (cached) {
                    window.URL.revokeObjectURL(cached.url);
                }

                // Fetch new preview URL
                console.log(`Fetching new preview URL for attachment ${attachmentId}`);
                previewUrl = await getAttachmentPreviewUrl(attachmentId);

                // Cache the URL with 5-minute expiration
                const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
                setPreviewCache(prev => {
                    const newCache = new Map(prev);
                    newCache.set(attachmentId, { url: previewUrl, expiresAt });
                    return newCache;
                });

                // Auto-cleanup expired cache entries
                setTimeout(() => {
                    setPreviewCache(prev => {
                        const newCache = new Map(prev);
                        const entry = newCache.get(attachmentId);
                        if (entry && entry.expiresAt <= Date.now()) {
                            window.URL.revokeObjectURL(entry.url);
                            newCache.delete(attachmentId);
                        }
                        return newCache;
                    });
                }, 5 * 60 * 1000 + 1000); // Cleanup after 5 minutes + 1 second
            }

            // Open in modal instead of new tab
            setPreviewModal({
                isOpen: true,
                url: previewUrl,
                fileName,
                contentType,
                attachmentId
            });
        } catch (error) {
            console.error('Failed to view attachment:', error);
            message.error('Failed to view attachment: ' + error.message);
        } finally {
            setDownloadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(`view-${attachmentId}`);
                return newSet;
            });
        }
    };

    const handleDownloadAttachment = async (attachmentId, fileName) => {
        try {
            setDownloadingIds(prev => new Set(prev).add(`download-${attachmentId}`));

            await downloadAndSaveAttachment(attachmentId, fileName);
            message.success('File downloaded successfully');
        } catch (error) {
            console.error('Failed to download attachment:', error);
            message.error('Failed to download attachment: ' + error.message);
        } finally {
            setDownloadingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(`download-${attachmentId}`);
                return newSet;
            });
        }
    };

    const closePreviewModal = () => {
        setPreviewModal({
            isOpen: false,
            url: null,
            fileName: '',
            contentType: '',
            attachmentId: null
        });
    };

    const handleModalDownload = () => {
        if (previewModal.attachmentId && previewModal.fileName) {
            handleDownloadAttachment(previewModal.attachmentId, previewModal.fileName);
        }
    };

    // Manual upload handler for created documents
    const handleManualUpload = async () => {
        if (!createdDocumentNumber) {
            message.error("No document number available. Please create a document first.");
            return;
        }

        if (!attachments || attachments.length === 0) {
            message.warning("Please select files to upload first.");
            return;
        }

        try {
            setUploading(true);

            // Extract files and descriptions
            const files = attachments.map(att => att.file);
            const descriptions = attachments.map(att => att.description || "");

            // Get customerId and userId from customerData or localStorage
            const customerId = customerData?.customerId || localStorage.getItem('customerId');
            const userId = localStorage.getItem('userId');

            console.log('[AttachmentDetails] Uploading with:', {
                documentNumber: createdDocumentNumber,
                customerId,
                userId,
                fileCount: files.length
            });

            // Call upload API
            const response = await uploadAttachments(
                createdDocumentNumber,
                files,
                descriptions,
                customerId,
                userId
            );

            message.success(`Successfully uploaded ${files.length} file(s) to document ${createdDocumentNumber}`);

            // Clear the attachments list
            setAttachments([]);

            // Refresh saved attachments
            try {
                const fetchedAttachments = await getAttachmentsByDocumentNumber(createdDocumentNumber);
                if (setSavedAttachments && Array.isArray(fetchedAttachments)) {
                    setSavedAttachments(fetchedAttachments);
                }
            } catch (fetchError) {
                console.error("Failed to refresh attachments:", fetchError);
                message.warning("Files uploaded but failed to refresh the list. Please refresh the page.");
            }

        } catch (error) {
            console.error("Upload failed:", error);
            message.error(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };


    const getFileIcon = (contentType) => {
        if (contentType?.startsWith('image/')) {
            return <FileImageOutlined className="text-blue-500" />;
        } else if (contentType?.includes('pdf')) {
            return <FilePdfOutlined className="text-red-500" />;
        } else if (contentType?.startsWith('video/')) {
            return <FileOutlined className="text-purple-500" />;
        }
        return <FileTextOutlined className="text-slate-500" />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-4xl mx-auto space-y-6">
            {/* Document Number Alert */}
            {createdDocumentNumber && showAlert && (
                <Alert
                    message="Document Ready for Attachments"
                    description={
                        <span>
                            You can now upload attachments for document: <span className="font-mono font-semibold">{createdDocumentNumber}</span>
                        </span>
                    }
                    type="success"
                    showIcon
                    closable
                    onClose={() => setShowAlert(false)}
                    className="mb-4"
                />
            )}

            {/* Saved Attachments Section */}
            {savedAttachments && savedAttachments.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <FileTextOutlined />
                        Saved Attachments ({savedAttachments.length})
                    </h3>
                    <div className="space-y-2">
                        {savedAttachments.map((att) => (
                            <div key={att.attachmentId} className="flex items-center gap-3 bg-green-50 p-3 rounded-md border border-green-200 shadow-sm">
                                {/* Icon & Name */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center flex-shrink-0">
                                        {getFileIcon(att.contentType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-800 truncate" title={att.originalFileName}>
                                            {att.originalFileName}
                                        </div>
                                        {att.description && (
                                            <div className="text-xs text-slate-600 truncate" title={att.description}>
                                                {att.description}
                                            </div>
                                        )}
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            Uploaded: {formatDate(att.uploadedAt)}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleViewAttachment(att.attachmentId, att.originalFileName, att.contentType)}
                                        disabled={downloadingIds.has(`view-${att.attachmentId}`)}
                                        className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="View file"
                                    >
                                        {downloadingIds.has(`view-${att.attachmentId}`) ? <LoadingOutlined spin /> : <EyeOutlined />}
                                    </button>
                                    <button
                                        onClick={() => handleDownloadAttachment(att.attachmentId, att.originalFileName)}
                                        disabled={downloadingIds.has(`download-${att.attachmentId}`)}
                                        className="text-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Download file"
                                    >
                                        {downloadingIds.has(`download-${att.attachmentId}`) ? <LoadingOutlined spin /> : <DownloadOutlined />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSavedAttachment(att.attachmentId, att.originalFileName)}
                                        className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"
                                        title="Delete attachment"
                                    >
                                        <DeleteOutlined />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Area */}
            <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <UploadOutlined />
                    Upload New Files
                </h3>
                <label className="cursor-pointer bg-white border border-dashed border-slate-300 hover:border-violet-500 hover:bg-slate-50 rounded-lg px-6 py-8 flex flex-col items-center gap-2 transition-all group w-full">
                    <div className="p-3 bg-slate-100 rounded-full group-hover:scale-110 transition-transform">
                        <UploadOutlined className="text-2xl text-slate-400 group-hover:text-violet-500 transition-colors" />
                    </div>
                    <span className="font-semibold text-slate-700">Click to Upload Files</span>
                    <span className="text-xs text-slate-500">Images and PDFs only • Max 1MB per file</span>
                    <span className="text-xs text-slate-400">Files larger than 1MB will be automatically compressed</span>
                    <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleFilesSelected}
                        className="hidden"
                    />
                </label>
            </div>

            {/* New Files List */}
            {attachments.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3">
                        New Files to Upload ({attachments.length})
                    </h3>
                    <div className="space-y-2">
                        {attachments.map((att) => (
                            <div key={att.id} className="flex items-center gap-3 bg-white p-3 rounded-md border border-slate-200 shadow-sm animate-fadeIn">
                                {/* Icon & Name */}
                                <div className="flex items-center gap-3 w-1/3 min-w-[150px]">
                                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                        <FileTextOutlined />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 truncate" title={att.file.name}>
                                        {att.file.name}
                                    </span>
                                </div>

                                {/* Description Input */}
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={att.description}
                                        onChange={(e) => handleDescriptionChange(att.id, e.target.value)}
                                        placeholder="Add a description..."
                                        className="w-full text-sm border-b border-slate-200 focus:border-violet-500 outline-none py-1 px-1 bg-transparent transition-colors"
                                    />
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemove(att.id)}
                                    className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                    title="Remove file"
                                >
                                    <DeleteOutlined />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Button - Show when document number is available */}
            {createdDocumentNumber && (
                <div className="mt-4">
                    <Button
                        type="primary"
                        size="large"
                        icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
                        onClick={handleManualUpload}
                        loading={uploading}
                        disabled={uploading || attachments.length === 0}
                        block
                        className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 border-none shadow-lg hover:shadow-xl transition-all"
                    >
                        {uploading
                            ? `Uploading ${attachments.length} file(s)...`
                            : attachments.length > 0
                                ? `Upload ${attachments.length} file(s) to ${createdDocumentNumber}`
                                : `No files selected - Add files above to upload to ${createdDocumentNumber}`
                        }
                    </Button>
                </div>
            )}

            {/* Preview Modal */}
            <AttachmentPreviewModal
                isOpen={previewModal.isOpen}
                onClose={closePreviewModal}
                previewUrl={previewModal.url}
                fileName={previewModal.fileName}
                contentType={previewModal.contentType}
                onDownload={handleModalDownload}
            />
        </div>
    );
};

export default AttachmentDetails;
