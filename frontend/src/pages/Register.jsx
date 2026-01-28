/**
 * Registration Wizard Page - iOS Premium Design
 * 3-step registration with localStorage persistence
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { registerAPI } from '../services/api'
import useRegistrationStorage from '../hooks/useRegistrationStorage'

// Components
import ProgressBar from '../components/registration/ProgressBar'
import StepInterests from '../components/registration/StepInterests'
import StepSocialAndPricing from '../components/registration/StepSocialAndPricing'
import StepPersonalInfo from '../components/registration/StepPersonalInfo'

const Register = () => {
    const navigate = useNavigate()
    const { refreshUser } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const [files, setFiles] = useState({ idCardFront: null, bankBook: null })

    const {
        step,
        interests,
        workConditions,
        personalInfo,
        saveStatus,
        setStep,
        updateInterests,
        updateWorkConditions,
        updatePersonalInfo,
        clearStorage
    } = useRegistrationStorage()

    const handleFileChange = (field, file) => {
        setFiles(prev => ({ ...prev, [field]: file }))
    }

    const handleNext = () => {
        setStep(step + 1)
    }

    const handleBack = () => {
        setStep(step - 1)
    }

    const handleSubmit = async (finalData) => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            const formData = new FormData()

            // Sanitize interests to be only IDs just in case
            const interestIds = interests.map(i => (typeof i === 'object' && i !== null) ? i.id : i).filter(Boolean)
            console.log('[Register] Submitting interests:', interestIds)
            formData.append('interests', JSON.stringify(interestIds))
            // Work Conditions (Improved logic: if price is set, allow is implied)
            const hasBoost = workConditions.boostPrice !== '' && workConditions.boostPrice !== null
            const hasOriginalFile = workConditions.originalFilePrice !== '' && workConditions.originalFilePrice !== null

            formData.append('allow_boost', hasBoost ? 'true' : 'false')
            if (hasBoost) {
                formData.append('boost_price', workConditions.boostPrice)
            }
            formData.append('allow_original_file', hasOriginalFile ? 'true' : 'false')
            if (hasOriginalFile) {
                formData.append('original_file_price', workConditions.originalFilePrice)
            }

            // New Work Preferences
            formData.append('accept_gifted_video', workConditions.acceptGiftedVideo ? 'true' : 'false')
            formData.append('accept_affiliate', workConditions.acceptAffiliate ? 'true' : 'false')

            // Social Accounts (Batch Save)
            if (workConditions.socialAccounts && workConditions.socialAccounts.length > 0) {
                formData.append('social_accounts', JSON.stringify(workConditions.socialAccounts))
            }

            formData.append('full_name_th', finalData.fullNameTh)
            formData.append('phone', finalData.phone.replace(/-/g, '')) // Store as numbers only
            if (finalData.email) formData.append('email', finalData.email)
            formData.append('date_of_birth', finalData.dateOfBirth)

            formData.append('house_no', finalData.houseNo)
            if (finalData.village) formData.append('village', finalData.village)
            if (finalData.moo) formData.append('moo', finalData.moo)
            if (finalData.soi) formData.append('soi', finalData.soi)
            if (finalData.road) formData.append('road', finalData.road)
            formData.append('sub_district', finalData.subDistrict)
            formData.append('district', finalData.district)
            formData.append('province', finalData.province)
            formData.append('zipcode', finalData.zipcode)

            if (files.idCardFront) {
                formData.append('id_card_front', files.idCardFront)
            }
            if (files.bankBook) {
                formData.append('bank_book', files.bankBook)
            }

            await registerAPI.submit(formData)
            clearStorage()
            await refreshUser()
            navigate('/waiting', { replace: true })

        } catch (error) {
            console.error('[Register] Submit error:', error)
            setSubmitError(
                error.response?.data?.message ||
                error.response?.data?.errors ||
                'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(180deg, #f8fffe 0%, #f2f2f7 100%)'
        }}>
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

            {/* Step Content with Animation */}
            <div className="animate-fade-in-up">
                {step === 1 && (
                    <StepInterests
                        selected={interests}
                        onChange={updateInterests}
                        onNext={handleNext}
                    />
                )}

                {step === 2 && (
                    <StepSocialAndPricing
                        data={workConditions}
                        onChange={updateWorkConditions}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {step === 3 && (
                    <StepPersonalInfo
                        data={personalInfo}
                        onChange={updatePersonalInfo}
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                        files={files}
                        onFileChange={handleFileChange}
                    />
                )}
            </div>
        </div>
    )
}

export default Register
