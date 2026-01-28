/**
 * Edit Profile Page - Reuses Registration Wizard Components
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { profileAPI, socialAPI } from '../services/api'
import { ArrowLeft, Loader2 } from 'lucide-react'

// Reuse registration components
import ProgressBar from '../components/registration/ProgressBar'
import StepInterests from '../components/registration/StepInterests'
import StepSocialAndPricing from '../components/registration/StepSocialAndPricing'
import StepPersonalInfo from '../components/registration/StepPersonalInfo'

const EditProfile = () => {
    const navigate = useNavigate()
    const { user, refreshUser } = useAuth()
    const profile = user?.profile

    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [files, setFiles] = useState({ idCardFront: null, bankBook: null })

    const handleFileChange = (field, file) => {
        setFiles(prev => ({ ...prev, [field]: file }))
    }

    // Form state
    const [interests, setInterests] = useState([])

    // Social Accounts & Pricing Combined Step
    const [socialAndPricing, setSocialAndPricing] = useState({
        allowBoost: false,
        boostPrice: '',
        allowOriginalFile: false,
        originalFilePrice: '',
        socialAccounts: [],
        acceptGiftedVideo: false,
        acceptAffiliate: false
    })

    const [personalInfo, setPersonalInfo] = useState({
        fullNameTh: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        houseNo: '',
        village: '',
        moo: '',
        soi: '',
        road: '',
        subDistrict: '',
        district: '',
        province: '',
        zipcode: '',
        files: {
            idCardFront: null,
            bankBook: null
        }
    })

    // Existing document URLs for preview
    const [existingDocuments, setExistingDocuments] = useState({
        idCardFrontUrl: null,
        bankBookUrl: null
    })

    // Fetch fresh profile data on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                // Refresh user to get latest profile data
                const userData = await refreshUser()
                const profileData = userData?.profile

                if (!profileData) {
                    console.error('[EditProfile] No profile found')
                    navigate('/profile')
                    return
                }

                // Interests
                const interestIds = profileData.interests || []
                setInterests(interestIds)

                // Initialize Social & Pricing state
                const initialSocialAndPricing = {
                    allowBoost: profileData.allow_boost || false,
                    boostPrice: profileData.boost_price?.toString() || '',
                    allowOriginalFile: profileData.allow_original_file || false,
                    originalFilePrice: profileData.original_file_price?.toString() || '',
                    // We will fetch individual accounts below to ensure we have the list
                    socialAccounts: [],
                    acceptGiftedVideo: profileData.accept_gifted_video || false,
                    acceptAffiliate: profileData.accept_affiliate || false
                }

                // Fetch social accounts
                try {
                    const socialRes = await socialAPI.listAccounts()
                    if (socialRes.data?.accounts) {
                        initialSocialAndPricing.socialAccounts = socialRes.data.accounts
                    }
                } catch (e) {
                    console.warn('Failed to fetch individual social accounts', e)
                }

                setSocialAndPricing(initialSocialAndPricing)

                // Personal info
                setPersonalInfo({
                    fullNameTh: profileData.full_name_th || '',
                    phone: profileData.phone || '',
                    email: profileData.email || '',
                    dateOfBirth: profileData.date_of_birth || '',
                    houseNo: profileData.house_no || '',
                    village: profileData.village || '',
                    moo: profileData.moo || '',
                    soi: profileData.soi || '',
                    road: profileData.road || '',
                    subDistrict: profileData.sub_district || '',
                    district: profileData.district || '',
                    province: profileData.province || '',
                    zipcode: profileData.zipcode || '',
                    files: {
                        idCardFront: null,
                        bankBook: null
                    }
                })

                // Store existing document URLs
                setExistingDocuments({
                    idCardFrontUrl: profileData.id_card_front_url || null,
                    bankBookUrl: profileData.bank_book_url || null
                })

                setIsLoading(false)
            } catch (err) {
                console.error('[EditProfile] Failed to load profile:', err)
                navigate('/profile')
            }
        }

        loadProfile()
    }, [])

    const handleNext = () => setStep(step + 1)
    const handleBack = () => step > 1 ? setStep(step - 1) : navigate('/profile')

    const handleSubmit = async (finalData) => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            const formData = new FormData()

            // Interests
            formData.append('interests', JSON.stringify(interests))

            // Work Conditions (Improved logic: if price is set, allow is implied)
            const hasBoost = socialAndPricing.boostPrice !== '' && socialAndPricing.boostPrice !== null
            const hasOriginalFile = socialAndPricing.originalFilePrice !== '' && socialAndPricing.originalFilePrice !== null

            formData.append('allow_boost', hasBoost ? 'true' : 'false')
            if (hasBoost) {
                formData.append('boost_price', socialAndPricing.boostPrice)
            }

            formData.append('allow_original_file', hasOriginalFile ? 'true' : 'false')
            if (hasOriginalFile) {
                formData.append('original_file_price', socialAndPricing.originalFilePrice)
            }

            // New Work Preferences
            formData.append('accept_gifted_video', socialAndPricing.acceptGiftedVideo ? 'true' : 'false')
            formData.append('accept_affiliate', socialAndPricing.acceptAffiliate ? 'true' : 'false')

            // Social Accounts (Batch Save)
            if (socialAndPricing.socialAccounts && socialAndPricing.socialAccounts.length > 0) {
                formData.append('social_accounts', JSON.stringify(socialAndPricing.socialAccounts))
            }

            // Personal info
            formData.append('full_name_th', finalData.fullNameTh)
            formData.append('phone', finalData.phone.replace(/-/g, ''))
            if (finalData.email) formData.append('email', finalData.email)
            formData.append('date_of_birth', finalData.dateOfBirth)

            // Address
            formData.append('house_no', finalData.houseNo)
            if (finalData.village) formData.append('village', finalData.village)
            if (finalData.moo) formData.append('moo', finalData.moo)
            if (finalData.soi) formData.append('soi', finalData.soi)
            if (finalData.road) formData.append('road', finalData.road)
            formData.append('sub_district', finalData.subDistrict)
            formData.append('district', finalData.district)
            formData.append('province', finalData.province)
            formData.append('zipcode', finalData.zipcode)

            // Files (only if changed)
            if (finalData.files.idCardFront) {
                formData.append('id_card_front', finalData.files.idCardFront)
            }
            if (finalData.files.bankBook) {
                formData.append('bank_book', finalData.files.bankBook)
            }

            // Log for inspection
            console.log('[EditProfile] Final Social & Pricing State:', socialAndPricing)
            console.log('[EditProfile] Submitting Profile Update with FormData:')
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // NEW: Use JSON if no files are being uploaded for maximum reliability!
            const hasNewFiles = files.idCardFront || files.bankBook
            let response;

            if (hasNewFiles) {
                console.log('[EditProfile] Submitting via FormData (Files detected)')
                response = await profileAPI.update(formData)
            } else {
                console.log('[EditProfile] Submitting via JSON (No files)')
                const payload = {
                    interests,
                    allow_boost: hasBoost,
                    boost_price: socialAndPricing.boostPrice,
                    allow_original_file: hasOriginalFile,
                    original_file_price: socialAndPricing.originalFilePrice,
                    accept_gifted_video: socialAndPricing.acceptGiftedVideo,
                    accept_affiliate: socialAndPricing.acceptAffiliate,
                    social_accounts: socialAndPricing.socialAccounts,
                    // Map personal info
                    full_name_th: finalData.fullNameTh,
                    phone: finalData.phone.replace(/-/g, ''),
                    email: finalData.email,
                    date_of_birth: finalData.dateOfBirth,
                    // Map address
                    house_no: finalData.houseNo,
                    village: finalData.village,
                    moo: finalData.moo,
                    soi: finalData.soi,
                    road: finalData.road,
                    sub_district: finalData.subDistrict,
                    district: finalData.district,
                    province: finalData.province,
                    zipcode: finalData.zipcode
                }
                response = await profileAPI.jsonUpdate(payload)
            }
            console.log('[EditProfile] Update response:', response.data)

            await refreshUser()

            // Explicit confirmation to the user
            if (response.data.debug_info) {
                const info = response.data.debug_info
                const msg = `บันทึกสำเร็จ!\n- ค่า Boost: ฿${info.boost_price}\n- ค่าไฟล์: ฿${info.original_file_price}`
                alert(msg)
            }

            // Brief delay to ensure state propagates
            setTimeout(() => {
                navigate('/profile', { replace: true })
            }, 500)

        } catch (error) {
            console.error('[EditProfile] Submit error:', error)
            setSubmitError(
                error.response?.data?.message ||
                error.response?.data?.errors ||
                'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(180deg, #f8fffe 0%, #f2f2f7 100%)'
        }}>
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3">
                <div className="flex items-center gap-3 max-w-md mx-auto">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">แก้ไขโปรไฟล์</h1>
                </div>
            </div>

            {/* Progress Bar */}
            <ProgressBar currentStep={step} totalSteps={3} />

            {/* Error Message */}
            {submitError && (
                <div className="mx-4 mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl animate-fade-in">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold">เกิดข้อผิดพลาด</p>
                            <p className="text-sm mt-1 opacity-80">
                                {typeof submitError === 'string'
                                    ? submitError
                                    : JSON.stringify(submitError)
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step Content */}
            <div className="animate-fade-in-up">
                {step === 1 && (
                    <StepInterests
                        selected={interests}
                        onChange={setInterests}
                        onNext={handleNext}
                    />
                )}

                {step === 2 && (
                    <StepSocialAndPricing
                        data={socialAndPricing}
                        onChange={setSocialAndPricing}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {step === 3 && (
                    <StepPersonalInfo
                        data={personalInfo}
                        onChange={setPersonalInfo}
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                        isEditMode={true}
                        submitButtonText="บันทึกการเปลี่ยนแปลง"
                        existingDocuments={existingDocuments}
                        files={files}
                        onFileChange={handleFileChange}
                    />
                )}
            </div>
        </div>
    )
}

export default EditProfile
