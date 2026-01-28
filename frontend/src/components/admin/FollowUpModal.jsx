import { useState, useEffect } from 'react'
import { XCircle, RefreshCw, Send, MessageSquare, Loader2, Edit2, CheckCircle2, AlertCircle, ChevronRight, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'

const FollowUpModal = ({ isOpen, onClose, selectedUsers, campaign, token, onSuccess }) => {
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [regeneratingIds, setRegeneratingIds] = useState(new Set())

    // UI Steps: 'draft', 'confirm', 'result'
    const [step, setStep] = useState('draft')
    const [results, setResults] = useState(null)

    useEffect(() => {
        if (isOpen && selectedUsers.length > 0) {
            setStep('draft')
            setResults(null)
            generateMessages()
        }
    }, [isOpen, selectedUsers])

    const generateMessages = async () => {
        setIsLoading(true)
        try {
            const res = await api.post('/admin/campaigns/generate-follow-up/', {
                users: selectedUsers.map(u => ({
                    id: u.id,
                    name: u.display_name,
                    status: u.status,
                    due_date: u.due_date
                })),
                campaign_title: campaign.title
            })
            setMessages(res.data.results)
        } catch (err) {
            console.error(err)
            setMessages(selectedUsers.map(u => ({
                id: u.id,
                name: u.display_name,
                status: u.status,
                message: `สวัสดีครับคุณ ${u.display_name} รบกวนติดตามงานแคมเปญ ${campaign.title} ด้วยนะครับ`
            })))
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegenerate = async (user) => {
        setRegeneratingIds(prev => new Set(prev).add(user.id))
        try {
            const res = await api.post('/admin/campaigns/generate-follow-up/', {
                users: [{
                    id: user.id,
                    name: user.name,
                    status: user.status,
                }],
                campaign_title: campaign.title
            })
            if (res.data.results && res.data.results.length > 0) {
                const newMessage = res.data.results[0].message
                setMessages(prev => prev.map(m => m.id === user.id ? { ...m, message: newMessage } : m))
            }
        } catch (err) {
            console.error(err)
        } finally {
            setRegeneratingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(user.id)
                return newSet
            })
        }
    }

    const handleMessageChange = (id, newText) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, message: newText } : m))
    }

    const handleSendAll = async () => {
        setIsSending(true)
        try {
            const res = await api.post('/admin/campaigns/send-bulk-message/', {
                messages: messages
            })
            setResults(res.data)
            setStep('result')
            if (res.data.sent > 0 && onSuccess) {
                onSuccess(res.data.sent)
            }
        } catch (err) {
            console.error(err)
            setResults({ success: false, error: 'Connection failed' })
            setStep('result')
        } finally {
            setIsSending(false)
        }
    }

    if (!isOpen) return null

    const renderContent = () => {
        if (step === 'draft') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {messages.map((msg, index) => (
                        <div key={msg.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                                        {msg.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{msg.name}</h4>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                            {msg.status}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRegenerate(msg)}
                                    disabled={regeneratingIds.has(msg.id)}
                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                                    title="Regenerate"
                                >
                                    {regeneratingIds.has(msg.id) ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <RefreshCw size={18} />
                                    )}
                                </button>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={msg.message}
                                    onChange={(e) => handleMessageChange(msg.id, e.target.value)}
                                    className="w-full h-24 p-3 pr-8 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-purple-200 focus:ring-2 focus:ring-purple-100 outline-none text-sm text-gray-700 resize-none transition-all"
                                />
                                <Edit2 size={12} className="absolute bottom-3 right-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        if (step === 'confirm') {
            return (
                <div className="max-w-2xl mx-auto py-8">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                            <Send size={40} />
                        </div>
                        <h4 className="text-2xl font-black text-gray-900">ยืนยันการส่งข้อความ</h4>
                        <p className="text-gray-500">คุณกำลังจะส่งข้อความติดตามงานให้ Influencer {messages.length} ท่าน</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Influencers ที่เลือก</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {messages.map((m, idx) => (
                                <div key={m.id} className={`px-6 py-4 flex items-center justify-between ${idx !== messages.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                            {m.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-gray-700">{m.name}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{m.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        }

        if (step === 'result') {
            const hasFailed = results?.failed > 0;
            return (
                <div className="max-w-2xl mx-auto py-8 text-center">
                    {hasFailed ? (
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                            <AlertCircle size={40} />
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <CheckCircle2 size={40} />
                        </div>
                    )}

                    <h4 className="text-2xl font-black text-gray-900">
                        {hasFailed ? 'ส่งข้อความสำเร็จบางส่วน' : 'ส่งข้อความสำเร็จเรียบร้อย!'}
                    </h4>
                    <div className="mt-4 flex justify-center gap-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div>
                            <p className="text-sm text-gray-400 font-bold mb-1">SENT</p>
                            <p className="text-3xl font-black text-green-600">{results?.sent}</p>
                        </div>
                        <div className="w-px bg-gray-100" />
                        <div>
                            <p className="text-sm text-gray-400 font-bold mb-1">FAILED</p>
                            <p className={`text-3xl font-black ${hasFailed ? 'text-orange-600' : 'text-gray-300'}`}>{results?.failed}</p>
                        </div>
                    </div>

                    {hasFailed && results?.details && (
                        <div className="mt-8 text-left">
                            <p className="text-sm font-bold text-gray-500 mb-2 px-2">Influencers ที่ส่งไม่สำเร็จ:</p>
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                {results.details.filter(d => d.status === 'failed').map((d, idx) => (
                                    <div key={idx} className="px-4 py-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                                <XCircle size={16} />
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm">{d.name}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase">
                                            {d.error || 'Unknown Error'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 text-nowrap">
                    <div>
                        <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
                            <MessageSquare className="text-purple-600 shrink-0" />
                            AI Bulk Follow-up
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500">
                            {step === 'draft' ? 'ตรวจสอบข้อความก่อนส่ง (Powered by Gemini 2.5 Flash-Lite)' :
                                step === 'confirm' ? 'ยืนยันความถูกต้องครั้งสุดท้าย' : 'ผลลัพธ์การดำเนินการ'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <XCircle size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <SparklesIcon className="w-6 h-6 text-purple-600 animate-pulse" />
                                </div>
                            </div>
                            <p className="text-gray-500 font-medium animate-pulse">กำลังร่างข้อความด้วย AI...</p>
                        </div>
                    ) : (
                        renderContent()
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-gray-100 bg-white flex justify-between items-center sticky bottom-0 z-10">
                    <div>
                        {step === 'confirm' && (
                            <button
                                onClick={() => setStep('draft')}
                                className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ย้อนกลับไปแก้ไข
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            {step === 'result' ? 'ปิดหน้าต่าง' : 'ยกเลิก'}
                        </button>

                        {step === 'draft' && (
                            <button
                                onClick={() => setStep('confirm')}
                                disabled={isLoading || messages.length === 0}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                ดำเนินการต่อ <ChevronRight size={18} />
                            </button>
                        )}

                        {step === 'confirm' && (
                            <button
                                onClick={handleSendAll}
                                disabled={isSending}
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-100 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        กำลังส่ง...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        ยืนยันส่งข้อความ ({messages.length})
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

const SparklesIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.39 9.35L22 12L14.39 14.65L12 22L9.61 14.65L2 12L9.61 9.35L12 2Z" fill="currentColor" />
    </svg>
)

export default FollowUpModal
