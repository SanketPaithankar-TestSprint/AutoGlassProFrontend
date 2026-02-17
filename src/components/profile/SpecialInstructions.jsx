import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, notification, Spin } from 'antd';
import { FileTextOutlined, SaveOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { getSpecialInstructions, saveSpecialInstructions, updateSpecialInstructions } from '../../api/specialInstructions';
import { getValidToken } from '../../api/getValidToken';

const SpecialInstructions = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [exists, setExists] = useState(false); // Track if instructions already exist
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const token = getValidToken();
    const queryClient = useQueryClient();

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize from LocalStorage if available
    const [instructions, setInstructions] = useState(() => {
        return localStorage.getItem("user_special_instructions") || '';
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ['specialInstructions'],
        queryFn: async () => {
            if (!token) throw new Error("No token found");
            const res = await getSpecialInstructions(token);
            // Update local storage on fetch
            if (res !== null) {
                localStorage.setItem("user_special_instructions", res);
            }
            return res;
        },
        retry: false,
        initialData: () => localStorage.getItem("user_special_instructions")
    });

    useEffect(() => {
        if (data !== undefined && data !== null) {
            setInstructions(data);
            setExists(true);
        } else {
            setExists(false);
        }
    }, [data]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            if (exists) {
                await updateSpecialInstructions(token, instructions);
                localStorage.setItem("user_special_instructions", instructions);
                notification.success({ message: "Special instructions updated successfully" });
            } else {
                await saveSpecialInstructions(token, instructions);
                localStorage.setItem("user_special_instructions", instructions);
                notification.success({ message: "Special instructions saved successfully" });
                setExists(true); // Now it exists
            }
            queryClient.invalidateQueries({ queryKey: ['specialInstructions'] });
        } catch (err) {
            console.error(err);
            notification.error({ message: "Failed to save instructions", description: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-center py-12"><Spin tip="Loading instructions..." /></div>;

    if (error && error.message.indexOf('404') === -1) {
        return <div className="text-center py-12 text-red-500">Failed to load instructions: {error.message}</div>;
    }

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <Card
                title={<span className="flex items-center gap-2"><FileTextOutlined className="text-violet-500" /> Special Instructions</span>}
                className="shadow-sm border border-gray-100 rounded-2xl"
            >
                <div>
                    <p className="text-gray-500 mb-4">
                        These instructions will be included in the PDF generation.
                    </p>
                    <div className="mb-4 bg-white rounded-lg">
                        {/* Wrapper div to ensure styles don't leak or break layout */}
                        <ReactQuill
                            theme="snow"
                            value={instructions}
                            onChange={(content) => setInstructions(content)}
                            modules={modules}
                            className={`${isMobile ? 'h-40' : 'h-64'} mb-12`}
                        />
                    </div>
                    <div className="flex justify-end pt-8">
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            loading={isSaving}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            Save Instructions
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SpecialInstructions;
