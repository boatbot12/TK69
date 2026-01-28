import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Upload, Calendar, DollarSign, MapPin, Users, FileText, CheckCircle, ArrowLeft, Save, Trash2, AlertTriangle, X } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'

const AdminEditCampaign = () => {
    const { id } = useParams()
    const { token } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()
    const fileInputRef = useRef()
    const coverInputRef = useRef()

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [preview, setPreview] = useState(null)
    const [coverPreview, setCoverPreview] = useState(null)

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        brand_name: '',
        brand_logo: null,
        cover_image: null,
        budget: '',
        location: 'Online',
        followers_required: '',
        brief_url: '',
        description: '',
        full_description: '',
        requirements: '',
        application_deadline: '',
        content_deadline: '',
        script_deadline: '',
        draft_deadline: '',
        final_deadline: '',
        show_slip_to_client: false,
        status: 'DRAFT'
    })

    const getImageUrl = (path) => {
        if (!path) return null
        if (typeof path !== 'string') return null
        if (path.startsWith('http')) return path
        const baseUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '')
        let cleanPath = path
        if (!path.startsWith('/media/') && !path.startsWith('media/')) cleanPath = `/media/${path}`
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1)
        return `${baseUrl}/${cleanPath}`
    }

    useEffect(() => {
        loadCampaignData()
    }, [id])

    const loadCampaignData = async () => {
        try {
            setIsLoading(true)
            const res = await api.get(`/admin/campaigns/${id}/`)
            const data = res.data
            const c = data.campaign_full || data.campaign

            setFormData({
                title: c.title || '',
                brand_name: c.brand_name || '',
                brand_logo: null,
                cover_image: null,
                budget: c.budget || '',
                location: c.location || 'Online',
                followers_required: c.followers_required || '',
                brief_url: c.brief_url || '',
                description: c.description || '',
                full_description: c.full_description || '',
                requirements: typeof c.requirements === 'object' ? JSON.stringify(c.requirements, null, 2) : (c.requirements || ''),
                application_deadline: c.application_deadline || '',
                content_deadline: c.content_deadline || '',
                script_deadline: c.script_deadline || '',
                draft_deadline: c.draft_deadline || '',
                final_deadline: c.final_deadline || '',
                insight_deadline: c.insight_deadline || '',
                show_slip_to_client: c.show_slip_to_client || false,
                status: c.status || 'DRAFT'
            })

            // Handle image logic - keep as null in formData if not changed
            // But set previews for display
            if (c.brand_logo) setPreview(getImageUrl(c.brand_logo))
            if (c.cover_image) setCoverPreview(getImageUrl(c.cover_image))
        } catch (err) {
            console.error(err)
            toast.error('ไม่สามารถโหลดข้อมูลแคมเปญได้')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({ ...prev, brand_logo: file }))
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleCoverChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({ ...prev, cover_image: file }))
            setCoverPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setIsSubmitting(true)

            const data = new FormData()
            Object.keys(formData).forEach(key => {
                const value = formData[key]
                if (key === 'brand_logo' || key === 'cover_image') {
                    // Only append if it's a new file
                    if (value instanceof File) {
                        data.append(key, value)
                    }
                } else if (value !== null && value !== undefined) {
                    // For other fields, send normally
                    // Booleans will be converted to "true"/"false" strings by FormData
                    data.append(key, value)
                }
            })

            console.log('[AdminEditCampaign] Updating campaign...', Object.fromEntries(data.entries()))

            const res = await api.patch(`/admin/campaigns/${id}/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.success('บันทึกการแก้ไขเรียบร้อย ✅')
            navigate(`/admin/campaigns/${id}`)

        } catch (err) {
            console.error('[AdminEditCampaign] Error:', err)

            const errorData = err.response?.data
            let errorMsg = ''

            if (errorData) {
                if (typeof errorData === 'object') {
                    errorMsg = Object.entries(errorData)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join('\n')
                } else {
                    errorMsg = String(errorData)
                }
            } else {
                errorMsg = err.message
            }

            toast.error(`บันทึกไม่สำเร็จ: ${errorMsg}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Delete Campaign Handler
    const handleDeleteCampaign = async () => {
        if (deleteConfirmText !== 'DELETE') {
            toast.error('กรุณาพิมพ์ DELETE เพื่อยืนยัน')
            return
        }

        try {
            setIsDeleting(true)
            await api.delete(`/admin/campaigns/${id}/`)
            toast.success('ลบแคมเปญเรียบร้อยแล้ว ✅')
            setShowDeleteModal(false)
            navigate('/admin/campaigns')
        } catch (err) {
            console.error('[AdminEditCampaign] Delete Error:', err)
            toast.error('ลบแคมเปญไม่สำเร็จ: ' + (err.response?.data?.error || err.message))
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading) return <div className="p-20 text-center text-gray-400">Loading...</div>

    return (
        <div className="p-6 max-w-4xl mx-auto pb-24">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(`/admin/campaigns/${id}`)}
                    className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors"
                >
                    <ArrowLeft size={20} />
                    กลับไปหน้าโครงการ
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black mb-2">แก้ไขแคมเปญ ✏️</h1>
                        <p className="opacity-90">แก้ไขรายละเอียดแคมเปญให้ถูกต้อง</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">

                    {/* Brand Info */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">1</span>
                            ข้อมูลแบรนด์
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อแบรนด์ <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="brand_name"
                                    value={formData.brand_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="เช่น Nike Thailand"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">โลโก้แบรนด์ (เลือกใหม่หากต้องการเปลี่ยน)</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors h-[50px]"
                                >
                                    {preview ? (
                                        <div className="flex items-center gap-3">
                                            <img src={preview} alt="Preview" className="w-8 h-8 rounded object-cover" />
                                            <span className="text-sm text-green-600 font-bold">มีรูปภาพแล้ว</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Upload size={18} />
                                            <span className="text-sm">เปลี่ยนรูปภาพ</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Campaign Cover Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">รูปปกแคมเปญ (Cover Image)</label>
                            <input
                                type="file"
                                ref={coverInputRef}
                                onChange={handleCoverChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <div
                                onClick={() => coverInputRef.current?.click()}
                                className={`
                                    relative w-full aspect-[16/6] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer
                                    ${coverPreview ? 'border-emerald-500' : 'border-gray-200 hover:border-purple-400 hover:bg-gray-50'}
                                `}
                            >
                                {coverPreview ? (
                                    <>
                                        <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <p className="text-white font-bold flex items-center gap-2">
                                                <Upload size={20} /> เปลี่ยนรูปปก
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Upload size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">คลิกเพื่ออัปโหลดรูปปกแคมเปญ</p>
                                        <p className="text-xs text-gray-400 mt-1">แนะนำขนาด 1200x450 (16:6)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อแคมเปญ <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none font-bold text-lg"
                                placeholder="เช่น รีวิวรองเท้าวิ่งรุ่นใหม่..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">สถานะแคมเปญ (Status) <span className="text-red-500">*</span></label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none font-bold bg-white"
                            >
                                <option value="DRAFT">Draft (ฉบับร่าง)</option>
                                <option value="OPEN">Open (เปิดรับสมัคร)</option>
                                <option value="IN_PROGRESS">In Progress (กำลังดำเนินการ)</option>
                                <option value="CLOSED">Closed (ปิดแคมเปญ)</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-2">โปรดทราบ: ระบบจะเปลี่ยนสถานะเป็น In Progress และ Closed ให้อัตโนมัติเมื่อเลยกำหนดการ (หากตั้งค่าเป็น Open ไว้)</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Campaign Details */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">2</span>
                            รายละเอียดงาน
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">งบประมาณ (บาท) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="5000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">สถานที่ <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Online / Siam Paragon"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">ผู้ติดตามขั้นต่ำ</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        name="followers_required"
                                        value={formData.followers_required}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="1000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">ลิงก์บรีฟงาน (Google Doc, Canva, etc.)</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="url"
                                    name="brief_url"
                                    value={formData.brief_url}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://docs.google.com/..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <input
                                type="checkbox"
                                name="show_slip_to_client"
                                id="show_slip_to_client"
                                checked={formData.show_slip_to_client}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="show_slip_to_client" className="text-sm font-bold text-purple-900 cursor-pointer">
                                แสดงพาร์ทสลิปโอนเงินให้ลูกค้าเห็น (ในหน้า Shared Campaign)
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">รายละเอียดแบบย่อ (โชว์หน้าแรก) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="คำอธิบายสั้นๆ ดึงดูดความสนใจ"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">รายละเอียดฉบับเต็ม <span className="text-red-500">*</span></label>
                            <textarea
                                name="full_description"
                                value={formData.full_description}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="รายละเอียดงาน, สิ่งที่ต้องทำ, Mood & Tone..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Requirements (List) <span className="text-red-500">*</span></label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="เช่น - เพศหญิง อายุ 20-30 ปี&#10;- รักการออกกำลังกาย"
                            />
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Timeline */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">3</span>
                            กำหนดการ (Timeline)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'ปิดรับสมัคร (Application)', name: 'application_deadline' },
                                { label: 'ส่งสคริปต์ (Script)', name: 'script_deadline' },
                                { label: 'ส่งดราฟต์วิดีโอ (Draft)', name: 'draft_deadline' },
                                { label: 'ส่งงานตัวจริง (Final)', name: 'final_deadline' },
                                { label: 'ส่ง Insight', name: 'insight_deadline' },
                                { label: 'สิ้นสุดแคมเปญ (Content Date)', name: 'content_deadline' },
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{field.label} <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Danger Zone - Delete Campaign */}
                    <section className="space-y-4 pt-6 border-t border-red-100">
                        <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
                            <AlertTriangle size={20} />
                            Danger Zone
                        </h2>
                        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                            <p className="text-sm text-red-700 mb-3">การลบแคมเปญจะลบข้อมูลทั้งหมดรวมถึงผู้สมัครและงานที่ส่งมา และไม่สามารถกู้คืนได้</p>
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
                            >
                                <Trash2 size={18} />
                                ลบแคมเปญนี้
                            </button>
                        </div>
                    </section>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                                w-full py-4 rounded-2xl font-black text-xl text-white shadow-lg shadow-purple-200 
                                transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2
                                ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-xl'}
                            `}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                <>
                                    <Save size={24} />
                                    บันทึกการแก้ไข
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg">ยืนยันการลบแคมเปญ</h3>
                                        <p className="text-sm opacity-90">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setDeleteConfirmText('')
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-sm text-red-800 font-medium">
                                    คุณกำลังจะลบแคมเปญ <strong>"{formData.title}"</strong>
                                </p>
                                <ul className="mt-2 text-xs text-red-600 space-y-1">
                                    <li>• ข้อมูลผู้สมัครทั้งหมดจะถูกลบ</li>
                                    <li>• ไฟล์งานที่ส่งมาจะถูกลบ</li>
                                    <li>• ลิงก์แชร์จะใช้งานไม่ได้</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    พิมพ์ <span className="text-red-600 font-mono bg-red-50 px-2 py-0.5 rounded">DELETE</span> เพื่อยืนยัน
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 outline-none font-mono text-center text-lg"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setDeleteConfirmText('')
                                    }}
                                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleDeleteCampaign}
                                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                    className={`
                                        flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                                        ${deleteConfirmText === 'DELETE' && !isDeleting
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            กำลังลบ...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={18} />
                                            ลบแคมเปญ
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminEditCampaign
