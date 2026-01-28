import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'ยืนยันการทำรายการ',
    message,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    type = 'info' // 'info', 'danger', 'success'
}) => {
    if (!isOpen) return null;

    const colors = {
        info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
        danger: 'bg-red-500 hover:bg-red-600 shadow-red-200',
        success: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
    };

    const iconColors = {
        info: 'text-blue-500 bg-blue-50',
        danger: 'text-red-500 bg-red-50',
        success: 'text-emerald-500 bg-emerald-50'
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${iconColors[type]}`}>
                                <AlertCircle size={24} />
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            {message}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition-all"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 py-3 px-4 text-white rounded-2xl font-bold text-sm transition-all shadow-lg ${colors[type]}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
