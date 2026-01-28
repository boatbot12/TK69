import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ChevronLeft,
    HelpCircle,
    Send,
    Upload,
    X,
    FileText,
    Image as ImageIcon,
    Bug,
    CreditCard,
    User,
    MoreHorizontal,
    CheckCircle2
} from 'lucide-react'
import imageCompression from 'browser-image-compression'
import api from '../services/api'
import MainLayout from '../layouts/MainLayout'
import { motion, AnimatePresence } from 'framer-motion'

const HelpPage = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        topic: 'BUG',
        subject: '',
        description: ''
    })
    const [files, setFiles] = useState([])
    const [isCompressing, setIsCompressing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const topics = [
        { value: 'BUG', label: 'Report a Bug', sub: 'แจ้งบั๊ก/ปัญหาการใช้งาน', icon: <Bug size={18} /> },
        { value: 'PAYMENT', label: 'Payment', sub: 'ปัญหาเรื่องเงิน/การจ่ายเงิน', icon: <CreditCard size={18} /> },
        { value: 'ACCOUNT', label: 'Account', sub: 'ข้อมูลบัญชี/การตั้งค่า', icon: <User size={18} /> },
        { value: 'OTHER', label: 'Other', sub: 'เรื่องอื่นๆ', icon: <MoreHorizontal size={18} /> }
    ]

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files)
        if (selectedFiles.length === 0) return

        setIsCompressing(true)
        const compressedFiles = []

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        }

        try {
            for (const file of selectedFiles) {
                if (file.type.startsWith('image/')) {
                    const compressedFile = await imageCompression(file, options)
                    // Create a preview URL
                    compressedFile.preview = URL.createObjectURL(compressedFile)
                    compressedFiles.push(compressedFile)
                } else {
                    // For non-images, just add as is (though compression only works for images)
                    compressedFiles.push(file)
                }
            }
            setFiles(prev => [...prev, ...compressedFiles].slice(0, 5)) // Limit to 5 files
        } catch (err) {
            console.error('Compression failed:', err)
            setError('บีบอัดรูปภาพไม่สำเร็จ กรุณาลองใหม่')
        } finally {
            setIsCompressing(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removeFile = (index) => {
        setFiles(prev => {
            const newFiles = [...prev]
            if (newFiles[index].preview) {
                URL.revokeObjectURL(newFiles[index].preview)
            }
            newFiles.splice(index, 1)
            return newFiles
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const submitData = new FormData()
        submitData.append('topic', formData.topic)
        submitData.append('subject', formData.subject)
        submitData.append('description', formData.description)

        files.forEach(file => {
            submitData.append('files', file)
        })

        try {
            await api.post('/support/tickets/', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setSuccess(true)
        } catch (err) {
            console.error('Failed to submit ticket:', err)
            setError('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8"
                    >
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-2xl font-black text-gray-900 mb-3">ขอบคุณที่แจ้งเรา!</h2>
                        <p className="text-gray-500 mb-10 max-w-xs leading-relaxed">
                            เราได้รับรายงานปัญหาของคุณแล้ว ทีมงานฝ่ายเทคนิคจะรีบตรวจสอบและดำเนินการแก้ไขให้โดยเร็วที่สุด
                        </p>

                        <button
                            onClick={() => navigate('/jobs')}
                            className="w-full max-w-xs py-4 rounded-3xl font-black text-white bg-brand-gradient shadow-xl shadow-emerald-200 active:scale-[0.98] transition-all"
                        >
                            กลับสู่หน้าหลัก
                        </button>
                    </motion.div>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50/50 pb-20">
                {/* Premium Header */}
                <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-4 sticky top-0 z-40 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 leading-tight">Help & Support</h1>
                        <p className="text-[10px] uppercase font-black text-brand-start tracking-widest">แจ้งปัญหาการใช้งาน</p>
                    </div>
                </div>

                <div className="p-5 max-w-lg mx-auto">
                    {/* Top Info Card */}
                    <div className="bg-brand-gradient rounded-3xl p-6 mb-8 text-white shadow-xl shadow-emerald-100 flex items-center gap-5 relative overflow-hidden">
                        <div className="relative z-10 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                            <Bug size={32} />
                        </div>
                        <div className="relative z-10 flex-1">
                            <h2 className="text-xl font-black leading-tight">พบปัญหาการใช้งาน?</h2>
                            <p className="text-xs opacity-90 mt-1 font-medium leading-relaxed">
                                รายงานบั๊กหรือข้อผิดพลาดเพื่อให้เรามอบประสบการณ์ที่ดียิ่งขึ้นให้คุณ
                            </p>
                        </div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl font-bold flex items-center gap-3"
                            >
                                <X size={18} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* Topic Grid Selection */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">หัวข้อที่ต้องการแจ้ง</label>
                            <div className="grid grid-cols-2 gap-3">
                                {topics.map(t => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, topic: t.value })}
                                        className={`
                                            p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group
                                            ${formData.topic === t.value
                                                ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/10'
                                                : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'}
                                        `}
                                    >
                                        <div className={`
                                            w-10 h-10 rounded-xl mb-3 flex items-center justify-center transition-colors
                                            ${formData.topic === t.value ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}
                                        `}>
                                            {t.icon}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black ${formData.topic === t.value ? 'text-gray-900' : 'text-gray-600'}`}>{t.label}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{t.sub}</p>
                                        </div>
                                        {formData.topic === t.value && (
                                            <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-emerald-500 rounded-tl-xl flex items-center justify-center text-white">
                                                <CheckCircle2 size={12} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">ชื่อเรื่อง</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                                    <FileText size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="สรุปปัญหาที่พบสั้นๆ"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm transition-all text-[15px] font-medium placeholder:text-gray-300"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">รายละเอียด</label>
                            <textarea
                                required
                                rows="5"
                                placeholder="ช่วยอธิบายปัญหาที่พบว่าเกิดขึ้นอย่างไร ขั้นตอนไหน..."
                                className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm transition-all text-[15px] font-medium resize-none placeholder:text-gray-300 leading-relaxed"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">แนบรูปภาพ (สูงสุด 5 รูป)</label>
                                {isCompressing && (
                                    <span className="text-[10px] font-black text-emerald-500 animate-pulse">กำลังประมวลผล...</span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {/* Previews */}
                                <AnimatePresence mode='popLayout'>
                                    {files.map((file, idx) => (
                                        <motion.div
                                            layout
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            key={file.preview || idx}
                                            className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md group border-2 border-white ring-1 ring-gray-100"
                                        >
                                            <img src={file.preview} className="w-full h-full object-cover" alt="upload preview" />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Upload Button */}
                                {files.length < 5 && (
                                    <button
                                        type="button"
                                        disabled={isCompressing}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-white hover:border-emerald-500 hover:text-emerald-500 transition-all active:scale-95"
                                    >
                                        <Upload size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">เพิ่มรูป</span>
                                    </button>
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || isCompressing}
                                className="w-full py-5 rounded-3xl font-black text-lg text-white bg-brand-gradient shadow-2xl shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>กำลังส่งรายงาน...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-6 h-6 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        <span>ส่งรายงานปัญหา</span>
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                                We value your feedback for a better TK69 experience
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    )
}

export default HelpPage
