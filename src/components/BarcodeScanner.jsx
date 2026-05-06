import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import Icon from './Icon';

export default function BarcodeScanner({ onScan, onClose }) {
    const videoRef  = useRef(null);
    const readerRef = useRef(null);
    const scannedRef = useRef(false);
    const timeoutRef = useRef(null);

    const [scannerState, setScannerState] = useState('requesting');
    const [errorType, setErrorType]       = useState(null);
    const [retryKey, setRetryKey]         = useState(0);

    const stopCamera = () => {
        clearTimeout(timeoutRef.current);
        try { readerRef.current?.reset(); } catch { /* already stopped */ }
        try {
            const stream = videoRef.current?.srcObject;
            if (stream) stream.getTracks().forEach(t => t.stop());
        } catch { /* already stopped */ }
    };

    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => document.body.classList.remove('overflow-hidden');
    }, []);

    useEffect(() => {
        scannedRef.current = false;

        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        const start = async () => {
            setScannerState('requesting');
            setErrorType(null);

            if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
                setErrorType('insecure_context');
                setScannerState('error');
                return;
            }

            try {
                await reader.decodeFromConstraints(
                    { video: { facingMode: { ideal: 'environment' } } },
                    videoRef.current,
                    (result) => {
                        if (result && !scannedRef.current) {
                            scannedRef.current = true;
                            clearTimeout(timeoutRef.current);
                            stopCamera();
                            onScan(result.getText());
                        }
                    }
                );
                setScannerState('active');
                timeoutRef.current = setTimeout(() => {
                    stopCamera();
                    setScannerState('timeout');
                }, 30000);
            } catch (err) {
                console.error('[BarcodeScanner]', err.name, err.message);
                if (err.name === 'NotAllowedError') {
                    setErrorType('permission_denied');
                } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
                    setErrorType('no_camera');
                } else if (err.name === 'NotReadableError' || err.name === 'AbortError') {
                    setErrorType('camera_in_use');
                } else {
                    setErrorType('generic');
                }
                setScannerState('error');
            }
        };

        start();
        return () => stopCamera();
    }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    const handleRetry = () => {
        setRetryKey(k => k + 1);
    };

    const errorMessages = {
        insecure_context:  'La cámara requiere conexión segura (HTTPS). Abre la app desde su dirección web oficial, no desde una IP local.',
        permission_denied: 'Acceso a la cámara denegado. En iPhone: Ajustes > Safari > Cámara → Permitir.',
        no_camera:         'No se encontró cámara disponible en este dispositivo.',
        camera_in_use:     'La cámara está siendo usada por otra aplicación. Ciérrala e intenta de nuevo.',
        generic:           'No se pudo iniciar la cámara. Asegúrate de que Safari tiene permiso de cámara en Ajustes del iPhone.',
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">

                {/* Header */}
                <div className="px-4 py-3 bg-slate-800 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <Icon name="Barcode" size={20} />
                        Escanear Código
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-1 rounded hover:bg-slate-700 transition-colors"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Camera viewport */}
                <div className="relative bg-black aspect-4/3">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                    />

                    {/* Scanning reticle */}
                    {scannerState === 'active' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative w-56 h-32 rounded-lg"
                                style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)' }}>
                                <div className="absolute inset-0 border-2 border-emerald-400 rounded-lg" />
                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                                <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                                {/* Animated scan line */}
                                <div
                                    className="absolute left-1 right-1 h-0.5 bg-emerald-400 opacity-90"
                                    style={{ animation: 'scanLine 2s linear infinite' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Requesting overlay */}
                    {scannerState === 'requesting' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 bg-black/60">
                            <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm">Iniciando cámara...</p>
                        </div>
                    )}

                    {/* Error overlay */}
                    {scannerState === 'error' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4 bg-black/70 p-6 text-center">
                            <Icon name="CameraOff" size={40} className="text-red-400" />
                            <p className="text-sm leading-relaxed">
                                {errorMessages[errorType] ?? errorMessages.generic}
                            </p>
                            <div className="flex gap-3">
                                {errorType !== 'insecure_context' && (
                                    <button
                                        onClick={handleRetry}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
                                    >
                                        Reintentar
                                    </button>
                                )}
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-100"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Timeout overlay */}
                    {scannerState === 'timeout' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4 bg-black/70 p-6 text-center">
                            <Icon name="Timer" size={40} className="text-amber-400" />
                            <p className="text-sm">No se detectó ningún código.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRetry}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
                                >
                                    Reintentar
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-100"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                {scannerState === 'active' && (
                    <p className="text-center text-xs text-gray-500 py-3 px-4">
                        Apunta la cámara al código de barras del producto
                    </p>
                )}
            </div>
        </div>
    );
}
