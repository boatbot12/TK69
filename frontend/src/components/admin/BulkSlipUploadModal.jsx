import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'
import { useToast } from '../../contexts/ToastContext'

// Utils
const formatMoney = (amount) => {
    const num = parseFloat(amount) || 0
    return `฿${num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const BulkSlipUploadModal = ({ isOpen, onClose, selectedJobs, onConfirm, isProcessing: parentProcessing }) => {
    const { error: toastError } = useToast()
    const [files, setFiles] = useState({}) // { jobId: { file, preview, compressed } }
    const [isCompressing, setIsCompressing] = useState(false)
    const [dragActiveId, setDragActiveId] = useState(null) // jobId of active dropzone

    if (!isOpen) return null

    // Handle File Selection
    const handleFileSelect = async (jobId, selectedFile) => {
        if (!selectedFile) return

        // Preview immediately
        const preview = URL.createObjectURL(selectedFile)
        setFiles(prev => ({
            ...prev,
            [jobId]: { file: selectedFile, preview, status: 'compressing' }
        }))

        // Compress Image
        try {
            setIsCompressing(true)
            const options = {
                maxSizeMB: 0.5, // Max 500KB
                maxWidthOrHeight: 1280,
                useWebWorker: true,
                fileType: 'image/jpeg'
            }

            const compressedFile = await imageCompression(selectedFile, options)

            setFiles(prev => ({
                ...prev,
                [jobId]: {
                    file: selectedFile,
                    compressed: compressedFile,
                    preview,
                    status: 'ready'
                }
            }))
        } catch (error) {
            console.error('Compression failed:', error)
            toastError('Compression failed. Using original file.')
            setFiles(prev => ({
                ...prev,
                [jobId]: {
                    file: selectedFile,
                    compressed: selectedFile, // Fallback
                    preview,
                    status: 'error'
                }
            }))
        } finally {
            setIsCompressing(false)
        }
    }

    // Drag & Drop Handlers
    const handleDrag = (e, jobId) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActiveId(jobId)
        } else if (e.type === 'dragleave') {
            setDragActiveId(null)
        }
    }

    const handleDrop = (e, jobId) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActiveId(null)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(jobId, e.dataTransfer.files[0])
        }
    }

    // Handle Submit
    const handleSubmit = () => {
        // Validate all have files
        const missing = selectedJobs.some(job => !files[job.id]?.compressed)
        if (missing) {
            toastError('Please upload slips for all selected transactions.')
            return
        }

        // Prepare map: jobId -> compressedFile
        const fileMap = {}
        Object.keys(files).forEach(jobId => {
            fileMap[jobId] = files[jobId].compressed
        })

        onConfirm(fileMap)
    }

    // Check if ready
    const isReady = selectedJobs.every(job => files[job.id]?.status === 'ready')

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-lg font-bold">💸 Bulk Payout Confirmation</h3>
                        <p className="text-emerald-100 text-sm">Upload slip for {selectedJobs.length} transactions</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">&times;</button>
                </div>

                {/* Body - Scrollable List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    {selectedJobs.map(job => {
                        const fileState = files[job.id]
                        const isActive = dragActiveId === job.id

                        return (
                            <div key={job.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center">
                                {/* Left: Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{job.influencer_name}</h4>
                                    <p className="text-xs text-gray-500 mb-1">{job.bank_name} • {job.account_number || 'xxx-xxxx-xxx'}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-600 font-bold font-mono">{formatMoney(job.net_payout)}</span>
                                        <span className="text-xs text-gray-400">({job.campaign_title})</span>
                                    </div>
                                </div>

                                {/* Right: Dropzone */}
                                <div
                                    className={`relative w-48 h-24 rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden
                                        ${isActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-emerald-300'}
                                        ${fileState?.preview ? 'border-solid border-emerald-500' : ''}
                                    `}
                                    onDragEnter={(e) => handleDrag(e, job.id)}
                                    onDragLeave={(e) => handleDrag(e, job.id)}
                                    onDragOver={(e) => handleDrag(e, job.id)}
                                    onDrop={(e) => handleDrop(e, job.id)}
                                    onClick={() => document.getElementById(`file-${job.id}`).click()}
                                >
                                    <input
                                        type="file"
                                        id={`file-${job.id}`}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileSelect(job.id, e.target.files[0])}
                                    />

                                    {fileState?.preview ? (
                                        <div className="relative w-full h-full group">
                                            <img src={fileState.preview} alt="Slip" className="w-full h-full object-cover" />
                                            {fileState.status === 'compressing' && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-xs font-bold">Change File</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-2">
                                            <span className="text-2xl block mb-1">📤</span>
                                            <span className="text-[10px] text-gray-400 block">Drag & Drop or Click</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isReady || isCompressing || parentProcessing}
                        className={`px-6 py-2 rounded-xl text-white font-bold shadow-lg shadow-emerald-200
                            ${!isReady || isCompressing || parentProcessing ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all'}
                        `}
                    >
                        {parentProcessing ? 'Processing...' : `Confirm & Pay (${selectedJobs.length})`}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BulkSlipUploadModal
