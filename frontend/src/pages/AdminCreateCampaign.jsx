import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Upload, Calendar, DollarSign, MapPin, Users, FileText, CheckCircle, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'

const AdminCreateCampaign = () => {
    const navigate = useNavigate()
    const toast = useToast()
    const fileInputRef = useRef()
    const coverInputRef = useRef()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [preview, setPreview] = useState(null)
    const [coverPreview, setCoverPreview] = useState(null)

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
        insight_deadline: '',
        show_slip_to_client: false,
        status: 'DRAFT'
    })

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

        // Basic Validation
        if (!formData.brand_logo) {
            toast.error('กรุณาอัปโหลดโลโก้แบรนด์')
            return
        }
        if (!formData.cover_image) {
            toast.error('กรุณาอัปโหลดรูปปกแคมเปญ')
            return
        }

        try {
            setIsSubmitting(true)

            const data = new FormData()
            Object.keys(formData).forEach(key => {
                const value = formData[key]
                if (key === 'brand_logo' || key === 'cover_image') {
                    if (value instanceof File) {
                        data.append(key, value)
                    }
                } else if (value !== null && value !== undefined) {
                    data.append(key, value)
                }
            })

            const res = await api.post('/admin/campaigns/create/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            toast.success('บันทึกแคมเปญเรียบร้อย ✅')
            navigate('/admin/campaigns')

        } catch (err) {
            console.error('[AdminCreateCampaign] Error:', err)

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

            toast.error(`บันทึกไม่สำเร็จ:\n${errorMsg}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/admin/campaigns')}
                className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                กลับไปหน้าจัดการแคมเปญ
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
                    <h1 className="text-2xl font-black mb-2">สร้างแคมเปญใหม่ ✨</h1>
                    <p className="opacity-90">กรอกรายละเอียดแคมเปญให้ครบถ้วนเพื่อเริ่มเปิดรับสมัคร Influencer</p>
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
                                <label className="block text-sm font-bold text-gray-700 mb-2">โลโก้แบรนด์ <span className="text-red-500">*</span></label>
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
                                            <span className="text-sm text-green-600 font-bold">อัปโหลดแล้ว</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Upload size={18} />
                                            <span className="text-sm">เลือกรูปภาพ</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Campaign Cover Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">รูปปกแคมเปญ (Cover Image) <span className="text-red-500">*</span></label>
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
                            <label className="block text-sm font-bold text-gray-700 mb-2">สถานะเริ่มต้น (Initial Status) <span className="text-red-500">*</span></label>
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
                            <p className="text-xs text-gray-400 mt-2">โปรดทราบ: หากเลือกเป็น Open ระบบจะเปลี่ยนสถานะเป็น In Progress/Closed ให้อัตโนมัติเมื่อเลยกำหนดเวลา</p>
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

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                                w-full py-4 rounded-2xl font-black text-xl text-white shadow-lg shadow-purple-200 
                                transition-all duration-300 hover:-translate-y-1
                                ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-xl'}
                            `}
                        >
                            {isSubmitting ? 'กำลังสร้างแคมเปญ...' : '🚀 สร้างแคมเปญ'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default AdminCreateCampaign
