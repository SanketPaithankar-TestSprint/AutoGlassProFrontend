import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Modal, Button, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const VinScanner = ({ visible, onScan, onClose }) => {
    const scannerRef = useRef(null);
    const wrapperId = "vin-scanner-wrapper";
    const [errorMsg, setErrorMsg] = useState("");
    const initializingRef = useRef(false);

    useEffect(() => {
        let html5QrCode = null;

        const startScanning = async () => {
            // 1. Basic environment checks
            if (!window.isSecureContext) {
                setErrorMsg("Camera requires a secure context (HTTPS) or localhost. It will not work on HTTP.");
                return;
            }

            if (initializingRef.current) return;
            initializingRef.current = true;

            try {
                await new Promise(r => setTimeout(r, 100)); // Short wait for DOM

                // 2. Create instance
                html5QrCode = new Html5Qrcode(wrapperId);
                scannerRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 150 },
                    aspectRatio: 1.0,
                };

                // 3. Start Camera
                // facingMode: "environment" prefers back camera
                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        // Success
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // scan failure, ignore
                    }
                );

                setErrorMsg("");

            } catch (err) {
                console.error("Failed to start scanner", err);
                // Common error: PermissionDenied
                if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
                    setErrorMsg("Camera permission denied. Please allow camera access in your browser settings.");
                } else if (err?.name === "NotFoundError") {
                    setErrorMsg("No camera found on this device.");
                } else {
                    setErrorMsg(`Unable to start camera: ${err?.message || err}`);
                }
                initializingRef.current = false;
            }
        };

        if (visible && !scannerRef.current) {
            startScanning();
        }

        // Cleanup
        return () => {
            initializingRef.current = false;
            if (scannerRef.current) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch(err => {
                    console.warn("Error stopping scanner", err);
                });
                scannerRef.current = null;
            }
        };
    }, [visible, onScan]);

    return (
        <Modal
            open={visible}
            footer={null}
            onCancel={onClose}
            closable={false}
            centered
            destroyOnClose
            width={400}
            className="p-0 [&_.ant-modal-content]:p-0 [&_.ant-modal-content]:overflow-hidden [&_.ant-modal-content]:rounded-xl"
        >
            <div className="relative bg-black h-[400px] flex flex-col items-center justify-center overflow-hidden">

                {/* Overlay UI */}
                <div className="absolute top-4 left-0 right-0 z-20 text-center pointer-events-none">
                    <h3 className="text-white font-medium drop-shadow-md">Scan VIN Barcode</h3>
                    <p className="text-white/80 text-xs mt-1">Align barcode in the center</p>
                </div>

                <Button
                    type="text"
                    icon={<CloseOutlined className="text-white text-lg" />}
                    onClick={onClose}
                    className="absolute top-2 right-2 z-30 hover:bg-white/20"
                />

                {/* Error Message */}
                {errorMsg && (
                    <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-6 text-center">
                        <p className="text-red-400 mb-4">{errorMsg}</p>
                        <Button onClick={onClose} ghost>Close</Button>
                    </div>
                )}

                {/* Scanner Div */}
                <div id={wrapperId} className="w-full h-full"></div>

            </div>
        </Modal>
    );
};

export default VinScanner;
