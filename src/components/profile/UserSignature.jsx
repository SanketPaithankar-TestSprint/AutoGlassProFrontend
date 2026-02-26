import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button, notification, Spin } from "antd";
import { EditOutlined, DeleteOutlined, SaveOutlined, LoadingOutlined } from "@ant-design/icons";
import getUserSignature from "../../api/getUserSignature";
import uploadUserSignature from "../../api/uploadUserSignature";
import { useTranslation } from 'react-i18next';

const UserSignature = () => {
    const sigCanvasRef = useRef(null);
    const [signatureUrl, setSignatureUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    // Fetch existing signature on mount
    useEffect(() => {
        const fetchSignature = async () => {
            try {
                const response = await getUserSignature();
                const blob = await response.blob();
                if (blob && blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    setSignatureUrl(url);
                }
            } catch (err) {
                // No existing signature — that's fine, user will draw one
                console.log("No existing signature found.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSignature();
    }, []);

    const handleClear = () => {
        if (sigCanvasRef.current) {
            sigCanvasRef.current.clear();
        }
    };

    const handleSave = async () => {
        if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
            notification.warning({ message: t('pricing.pleaseDrawSignature', { defaultValue: 'Please draw your signature before saving.' }) });
            return;
        }

        setIsSaving(true);
        try {
            // Get the signature as a data URL and convert to Blob
            const dataUrl = sigCanvasRef.current.toDataURL("image/png");
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            await uploadUserSignature(blob);

            // Update the displayed signature
            const url = URL.createObjectURL(blob);
            setSignatureUrl(url);
            setIsEditing(false);

            notification.success({ message: t('pricing.signatureSaved', { defaultValue: 'Signature saved successfully!' }) });
        } catch (error) {
            console.error(error);
            notification.error({ message: t('pricing.saveSignatureFailed', { defaultValue: 'Failed to save signature' }), description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateClick = () => {
        setIsEditing(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
            </div>
        );
    }

    // Viewing mode — show saved signature
    if (signatureUrl && !isEditing) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <EditOutlined className="text-violet-500" /> {t('pricing.yourSignature', { defaultValue: 'Your Signature' })}
                    </h2>
                    <div className="flex flex-col items-center gap-6">
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 w-full max-w-lg">
                            <img
                                src={signatureUrl}
                                alt={t('pricing.yourSignature', { defaultValue: 'Your Signature' })}
                                className="mx-auto max-h-48 object-contain"
                            />
                        </div>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleUpdateClick}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            {t('pricing.updateSignature', { defaultValue: 'Update Signature' })}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Drawing mode — canvas for drawing a new signature
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <EditOutlined className="text-violet-500" /> {signatureUrl ? t('pricing.updateSignature', { defaultValue: 'Update Signature' }) : t('pricing.drawSignature', { defaultValue: 'Draw Your Signature' })}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    {t('pricing.drawSignatureDesc', { defaultValue: 'Use your mouse or finger to draw your signature in the box below.' })}
                </p>
                <div className="flex flex-col items-center gap-4">
                    <div className="border-2 border-dashed border-violet-300 rounded-xl bg-white w-full max-w-lg overflow-hidden">
                        <SignatureCanvas
                            ref={sigCanvasRef}
                            penColor="black"
                            canvasProps={{
                                width: 500,
                                height: 200,
                                className: "w-full",
                                style: { width: "100%", height: "200px" }
                            }}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={handleClear}
                            danger
                        >
                            {t('employees.clear', { defaultValue: 'Clear' })}
                        </Button>
                        {signatureUrl && (
                            <Button onClick={() => setIsEditing(false)}>
                                {t('employees.cancel', { defaultValue: 'Cancel' })}
                            </Button>
                        )}
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            loading={isSaving}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            {t('pricing.saveSignature', { defaultValue: 'Save Signature' })}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSignature;
