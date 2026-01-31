import React, { useEffect, useRef } from 'react';
import { CloseOutlined } from '@ant-design/icons';
// Placeholder: No video file imported

const VideoModal = ({ isOpen, onClose }) => {
    const videoRef = useRef(null);
    const modalRef = useRef(null);

    // Handle escape key and click outside
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Stop video when modal closes
    useEffect(() => {
        if (!isOpen && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop with blur */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                style={{ backdropFilter: 'blur(8px)' }}
            />
            
            {/* Video container */}
            <div 
                ref={modalRef}
                className="relative z-10 w-full max-w-5xl mx-4"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 flex items-center gap-2 group"
                >
                    <span className="text-sm opacity-70 group-hover:opacity-100">Close</span>
                    <CloseOutlined className="text-2xl" />
                </button>

                {/* Video */}
                <video
                    ref={videoRef}
                    src=""
                    controls
                    autoPlay
                    className="w-full rounded-lg shadow-2xl"
                    style={{
                        maxHeight: '80vh',
                        objectFit: 'contain',
                        backgroundColor: '#000'
                    }}
                >
                    No video available.
                </video>
            </div>
        </div>
    );
};

export default VideoModal;
