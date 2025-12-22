import React from "react";
import { UploadOutlined } from "@ant-design/icons";

const AttachmentDetails = ({
    attachmentFile,
    setAttachmentFile,
    attachmentDescription,
    setAttachmentDescription
}) => {
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 max-w-xl mx-auto text-center">
            <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center justify-center gap-2">
                <UploadOutlined className="text-xl text-violet-600" />
                <span>Upload Attachment</span>
            </h4>

            <div className="flex flex-col items-center gap-4 w-full">
                {/* File Input */}
                <label className="cursor-pointer bg-white border border-slate-300 hover:border-violet-500 rounded-md px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors">
                    <span>Choose File</span>
                    <input
                        type="file"
                        onChange={(e) => setAttachmentFile(e.target.files[0])}
                        className="hidden"
                    />
                </label>

                {/* File Preview */}
                {attachmentFile ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-100 animate-fadeIn">
                        <span className="font-medium text-violet-700">{attachmentFile.name}</span>
                        <button
                            onClick={() => {
                                setAttachmentFile(null);
                                setAttachmentDescription(""); // Clear description on file remove
                            }}
                            className="text-slate-400 hover:text-red-500 ml-2"
                            title="Remove"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <span className="text-xs text-slate-400">No file chosen</span>
                )}

                {/* Description Input */}
                {attachmentFile && (
                    <div className="w-full max-w-sm mt-2 space-y-1 text-left">
                        <label className="text-xs font-semibold text-slate-600 block pl-1">Description</label>
                        <input
                            type="text"
                            value={attachmentDescription}
                            onChange={(e) => setAttachmentDescription(e.target.value)}
                            placeholder="Enter description for this file..."
                            className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttachmentDetails;
