import React from "react";
import { UploadOutlined, FileTextOutlined, DeleteOutlined } from "@ant-design/icons";

const AttachmentDetails = ({
    attachments = [],
    setAttachments
}) => {

    const handleFilesSelected = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substring(2, 9),
                file: file,
                description: ""
            }));

            // Append new files to existing ones
            setAttachments(prev => [...prev, ...newFiles]);

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

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-4xl mx-auto">
            {/* Upload Area */}
            <div className="text-center mb-6">
                <label className="cursor-pointer bg-white border border-dashed border-slate-300 hover:border-violet-500 hover:bg-slate-50 rounded-lg px-6 py-8 flex flex-col items-center gap-2 transition-all group w-full">
                    <div className="p-3 bg-slate-100 rounded-full group-hover:scale-110 transition-transform">
                        <UploadOutlined className="text-2xl text-slate-400 group-hover:text-violet-500 transition-colors" />
                    </div>
                    <span className="font-semibold text-slate-700">Click to Upload Files</span>
                    <span className="text-xs text-slate-400">Support for single or multiple files</span>
                    <input
                        type="file"
                        multiple
                        onChange={handleFilesSelected}
                        className="hidden"
                    />
                </label>
            </div>

            {/* File List */}
            {attachments.length > 0 && (
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
            )}
        </div>
    );
};

export default AttachmentDetails;
