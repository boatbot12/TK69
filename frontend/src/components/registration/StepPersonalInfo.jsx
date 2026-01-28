/**
 * Step 3: Personal Info - Vibrant Gen Z Design
 * Clean Inputs, Fun File Uploads
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { searchAddress, formatAddressLabel, formatAddressForForm } from '../../utils/thaiAddress'
import PolicyModal from '../common/PolicyModal'

const InputGroup = ({ label, required, children }) => (
    <div className="mb-4">
        <label className="text-gray-900 font-bold mb-2 ml-1 block text-sm">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {children}
    </div>
)

const FileUpload = ({ label, required, field, icon, files, onFileChange, existingUrl }) => {
    const hasNewFile = files[field]
    const hasExisting = existingUrl && !hasNewFile
    const hasAnyFile = hasNewFile || hasExisting

    return (
        <div className="mb-4">
            <label className="text-gray-900 font-bold mb-2 ml-1 block text-sm">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <div className={`
                relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
                ${hasAnyFile ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-primary-300'}
            `}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onFileChange(field, e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="p-4 flex items-center gap-4">
                    {/* Show thumbnail if existing or new file */}
                    {hasExisting ? (
                        <img
                            src={existingUrl}
                            alt="Existing document"
                            className="w-12 h-12 rounded-xl object-cover border border-primary-200"
                        />
                    ) : (
                        <div className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                            ${hasNewFile ? 'bg-primary-100' : 'bg-white shadow-sm'}
                        `}>
                            {hasNewFile ? '✅' : icon}
                        </div>
                    )}
                    <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm truncate">
                            {hasNewFile ? files[field].name : (hasExisting ? 'อัพโหลดแล้ว (แตะเพื่อเปลี่ยน)' : 'แตะเพื่ออัพโหลด')}
                        </p>
                        <p className="text-xs text-gray-500">
                            {hasAnyFile ? 'เรียบร้อยแล้ว' : 'รูปถ่ายชัดๆ ไม่เบลอนะ'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

const StepPersonalInfo = ({ data, onChange, onSubmit, onBack, isSubmitting, isEditMode = false, submitButtonText = 'ส่งข้อมูลเลย! 🎉', existingDocuments = {}, files = {}, onFileChange }) => {
    const [showPolicyModal, setShowPolicyModal] = useState(false)
    // Default to true for edit mode if existing documents exist
    const [agreedToPolicy, setAgreedToPolicy] = useState(isEditMode)
    const [addressSuggestions, setAddressSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    // Removed local files state
    const searchRef = useRef(null)

    // Form validation check
    // Phone can be either 10 digits (from backend) or 11 chars with dash (08X-XXXXXXX format)
    const phoneDigits = data.phone?.replace(/-/g, '') || ''
    const isPhoneValid = phoneDigits.length === 10

    const isFormValid = (
        data.fullNameTh &&
        isPhoneValid &&
        data.dateOfBirth &&
        data.houseNo &&
        data.zipcode &&
        data.subDistrict &&
        data.province &&
        (files?.idCardFront || existingDocuments?.idCardFrontUrl) &&
        (files?.bankBook || existingDocuments?.bankBookUrl) &&
        agreedToPolicy
    )

    // Debug logs to help identify missing fields
    useEffect(() => {
        if (!isFormValid) {
            console.log('[Validation] Missing fields:', {
                fullNameTh: !data.fullNameTh,
                phone: !isPhoneValid,
                dateOfBirth: !data.dateOfBirth,
                houseNo: !data.houseNo,
                zipcode: !data.zipcode,
                subDistrict: !data.subDistrict,
                province: !data.province,
                idCardFront: !(files?.idCardFront || existingDocuments?.idCardFrontUrl),
                bankBook: !(files?.bankBook || existingDocuments?.bankBookUrl),
                policy: !agreedToPolicy
            })
        }
    }, [data, files, agreedToPolicy, isFormValid, isEditMode, isPhoneValid])

    const [errors, setErrors] = useState({})

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const updateField = (field, value) => onChange({ ...data, [field]: value })
    // handleFileChange now uses prop

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10)
        let formatted = value
        if (value.length > 3 && value.length <= 6) {
            formatted = `${value.slice(0, 3)}-${value.slice(3)}`
        } else if (value.length > 6) {
            formatted = `${value.slice(0, 3)}-${value.slice(3, 10)}`
        }
        updateField('phone', formatted)
    }

    const handleAddressSearch = (query) => {
        // Don't use useCallback here - we need fresh 'data' on every call
        onChange({ ...data, zipcode: query })
        if (query.length >= 2) {
            setAddressSuggestions(searchAddress(query))
            setShowSuggestions(true)
        } else {
            setShowSuggestions(false)
        }
    }

    const selectAddress = (address) => {
        const addressFields = formatAddressForForm(address)
        // Use spread to preserve ALL existing fields, then update only address fields
        onChange({
            ...data,
            subDistrict: addressFields.subDistrict,
            district: addressFields.district,
            province: addressFields.province,
            zipcode: addressFields.zipcode
        })
        setShowSuggestions(false)
    }

    const handleSubmit = () => onSubmit({ ...data, files })

    return (
        <div className="flex flex-col min-h-screen relative z-10 pb-32">
            {/* Header */}
            <div className="px-6 pt-6 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                    ข้อมูลส่วนตัว 📝
                </h1>
                <p className="text-gray-500 font-medium">
                    อีกนิดเดียว! กรอกไว้รับงานและเงิน
                </p>
            </div>

            <div className="p-6 pt-2">
                {/* Profile Info */}
                <div className="card mb-6">
                    <InputGroup label="ชื่อ-นามสกุล (ไทย)" required>
                        <input
                            className="input-field"
                            placeholder="สมชาย ใจดี"
                            value={data.fullNameTh || ''}
                            onChange={e => updateField('fullNameTh', e.target.value)}
                        />
                    </InputGroup>
                    <InputGroup label="เบอร์โทรศัพท์" required>
                        <input
                            className="input-field font-mono tracking-wider"
                            type="tel"
                            placeholder="08X-XXXXXXX"
                            value={data.phone || ''}
                            onChange={handlePhoneChange}
                        />
                    </InputGroup>
                    <InputGroup label="วันเกิด" required>
                        <input
                            className="input-field"
                            type="date"
                            value={data.dateOfBirth || ''}
                            onChange={e => updateField('dateOfBirth', e.target.value)}
                        />
                    </InputGroup>
                </div>

                {/* Address */}
                <div className="card mb-6">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                        <span className="bg-sky-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">📍</span>
                        ที่อยู่จัดส่งของ
                    </h3>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <InputGroup label="บ้านเลขที่" required>
                            <input
                                className="input-field"
                                placeholder="123/4"
                                value={data.houseNo || ''}
                                onChange={e => updateField('houseNo', e.target.value)}
                            />
                        </InputGroup>
                        <InputGroup label="หมู่ที่">
                            <input
                                className="input-field"
                                placeholder="-"
                                value={data.moo || ''}
                                onChange={e => updateField('moo', e.target.value)}
                            />
                        </InputGroup>
                        <InputGroup label="ซอย">
                            <input
                                className="input-field"
                                placeholder="-"
                                value={data.soi || ''}
                                onChange={e => updateField('soi', e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    <div ref={searchRef} className="relative mb-4">
                        <label className="text-gray-900 font-bold mb-2 ml-1 block text-sm">
                            ค้นหารหัสไปรษณีย์ / ตำบล <span className="text-rose-500">*</span>
                        </label>
                        <input
                            className="input-field"
                            placeholder="พิมพ์เพื่อค้นหา..."
                            value={data.zipcode || ''}
                            onChange={e => handleAddressSearch(e.target.value)}
                        />

                        {showSuggestions && addressSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-h-60 overflow-y-auto">
                                {addressSuggestions.map((addr, i) => (
                                    <div
                                        key={i}
                                        onClick={() => selectAddress(addr)}
                                        className="p-3 border-b border-gray-50 hover:bg-teal-50 cursor-pointer text-sm text-gray-700"
                                    >
                                        {formatAddressLabel(addr)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 space-y-2 border border-gray-100">
                        <div className="flex justify-between"><span>ตำบล:</span> <span className="font-bold text-gray-900">{data.subDistrict || '-'}</span></div>
                        <div className="flex justify-between"><span>อำเภอ:</span> <span className="font-bold text-gray-900">{data.district || '-'}</span></div>
                        <div className="flex justify-between"><span>จังหวัด:</span> <span className="font-bold text-gray-900">{data.province || '-'}</span></div>
                    </div>
                </div>

                {/* Documents */}
                <div className="card mb-6">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                        <span className="bg-amber-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">📁</span>
                        เอกสารสำคัญ
                    </h3>
                    <FileUpload label="บัตรประชาชน (หน้า)" required field="idCardFront" icon="🪪" files={files} onFileChange={onFileChange} existingUrl={existingDocuments.idCardFrontUrl} />
                    <FileUpload label="หน้าสมุดบัญชี" required field="bankBook" icon="🏦" files={files} onFileChange={onFileChange} existingUrl={existingDocuments.bankBookUrl} />
                </div>

                {/* Agreement Checkbox */}
                <div className="px-2 mb-8">
                    <label className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 bg-white transition-all checked:border-transparent checked:bg-brand-gradient hover:border-primary-400"
                                checked={agreedToPolicy}
                                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                            />
                            <svg className="absolute left-1/2 top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 scale-0 text-white transition-transform peer-checked:scale-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-[15px] font-bold text-gray-600 select-none leading-relaxed">
                            ฉันยอมรับ <button type="button" onClick={() => setShowPolicyModal(true)} className="bg-brand-gradient bg-clip-text text-transparent underline decoration-primary-400/50 underline-offset-4 hover:decoration-primary-500 transition-colors font-black">เงื่อนไขบริษัท</button> และยินดีปฏิบัติตามนโยบายอย่างเคร่งครัด
                        </span>
                    </label>
                </div>
            </div>

            <PolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} />

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-[2px] z-50 flex gap-4">
                <button
                    onClick={onBack}
                    className="h-14 px-8 rounded-2xl border-2 border-gray-100 bg-white font-black text-gray-400 hover:bg-gray-50 active:scale-95 transition-all text-lg flex-1"
                >
                    กลับ
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isFormValid}
                    className={`
                        h-14 px-8 rounded-2xl font-black text-white text-lg flex-[2] transition-all duration-500
                        ${(!isFormValid || isSubmitting)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed grayscale shadow-none'
                            : 'bg-brand-gradient shadow-xl shadow-primary-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'}
                    `}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>กำลังส่ง...</span>
                        </div>
                    ) : (
                        <span>{submitButtonText}</span>
                    )}
                </button>
            </div>
        </div>
    )
}

export default StepPersonalInfo
