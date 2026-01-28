import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts((prev) => [...prev, { id, message, type }])

        if (duration) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }, [])

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const success = (message, duration) => addToast(message, 'success', duration)
    const error = (message, duration) => addToast(message, 'error', duration)
    const info = (message, duration) => addToast(message, 'info', duration)

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
            {children}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

const ToastItem = ({ toast, onRemove }) => {
    const styles = {
        success: 'bg-white border-emerald-100 text-emerald-800 shadow-emerald-100',
        error: 'bg-white border-rose-100 text-rose-800 shadow-rose-100',
        info: 'bg-white border-blue-100 text-blue-800 shadow-blue-100',
    }

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-rose-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg lg:min-w-[300px] max-w-md ${styles[toast.type] || styles.info}`}
        >
            {icons[toast.type]}
            <p className="text-sm font-bold">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="ml-auto p-1 hover:bg-black/5 rounded-full transition-colors"
            >
                <X size={14} className="opacity-50" />
            </button>
        </motion.div>
    )
}
