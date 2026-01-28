/**
 * Campaign Detail Page
 * Shows timeline view and submission form
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { campaignAPI, applicationAPI, utilityAPI } from '../services/api'

const CampaignDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [campaign, setCampaign] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Submission state
    const [submissionLink, setSubmissionLink] = useState('')
    const [submissionNotes, setSubmissionNotes] = useState('')
    const [isValidating, setIsValidating] = useState(false)
    const [validationResult, setValidationResult] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isApplying, setIsApplying] = useState(false)

    useEffect(() => {
        loadCampaign()
    }, [id])

    const loadCampaign = async () => {
        try {
            setIsLoading(true)
            const response = await campaignAPI.get(id)
            setCampaign(response.data)
        } catch (err) {
            console.error('[CampaignDetail] Failed to load:', err)
            setError('ไม่สามารถโหลดข้อมูลแคมเปญได้')
        } finally {
            setIsLoading(false)
        }
    }

    const handleApply = async () => {
        try {
            setIsApplying(true)
            await campaignAPI.apply(id, { note: '' })

            // Invalidate Dashboard Cache (Session)
            sessionStorage.removeItem('campaign_dashboard_v2')

            await loadCampaign()
        } catch (err) {
            console.error('[CampaignDetail] Apply failed:', err)
            setError(err.response?.data?.message || 'ไม่สามารถสมัครได้')
        } finally {
            setIsApplying(false)
        }
    }

    const handleValidateLink = async () => {
        if (!submissionLink) return

        try {
            setIsValidating(true)
            setValidationResult(null)
            const response = await utilityAPI.validateDriveLink(submissionLink)
            setValidationResult(response.data)
        } catch (err) {
            console.error('[CampaignDetail] Validation failed:', err)
            setValidationResult({
                valid: false,
                message: 'ไม่สามารถตรวจสอบลิงก์ได้'
            })
        } finally {
            setIsValidating(false)
        }
    }

    const getCurrentStage = () => {
        if (!campaign?.user_application) return null

        const status = campaign.user_application.status
        const stageMap = {
            'APPROVED': 'script',
            'WORK_IN_PROGRESS': 'script',
            'SCRIPT_APPROVED': 'draft',
            'DRAFT_APPROVED': 'final'
        }
        return stageMap[status] || null
    }

    const handleSubmitWork = async () => {
        const stage = getCurrentStage()
        if (!stage || !submissionLink) return

        // Check validation result
        if (validationResult && validationResult.accessible === false) {
            return // Don't submit if link is private
        }

        try {
            setIsSubmitting(true)
            await applicationAPI.submitWork(campaign.user_application.id, {
                stage,
                link: submissionLink,
                notes: submissionNotes
            })

            // Invalidate Dashboard Cache (Session)
            sessionStorage.removeItem('campaign_dashboard_v2')

            // Reload campaign
            await loadCampaign()

            // Reset form
            setSubmissionLink('')
            setSubmissionNotes('')
            setValidationResult(null)
        } catch (err) {
            console.error('[CampaignDetail] Submit failed:', err)
            setError(err.response?.data?.message || 'ไม่สามารถส่งงานได้')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const getStageStatus = (stageId) => {
        if (!campaign?.user_application) return 'locked'

        const submissions = campaign.user_application.submissions || {}
        const currentStatus = campaign.user_application.status

        // Check if stage is completed
        if (submissions[stageId]?.status === 'approved') return 'completed'

        // Check if stage is current (can submit)
        const currentStage = getCurrentStage()
        if (stageId === currentStage) return 'current'

        // Check if stage is pending review
        if (submissions[stageId]?.status === 'pending') return 'pending'

        return 'locked'
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="spinner" />
            </div>
        )
    }

    if (error || !campaign) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="card text-center">
                    <p className="text-red-500 mb-4">{error || 'ไม่พบแคมเปญ'}</p>
                    <button onClick={() => navigate('/jobs')} className="btn-secondary">
                        กลับหน้าหลัก
                    </button>
                </div>
            </div>
        )
    }

    const hasApplied = !!campaign.user_application
    const currentStage = getCurrentStage()
    const canSubmit = currentStage && (!validationResult || validationResult.accessible !== false)

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate('/jobs')}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="font-semibold text-gray-900 truncate flex-1">
                    {campaign.title}
                </h1>
            </div>

            {/* Campaign Info */}
            <div className="px-4 py-6">
                {/* Brand header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                        {campaign.brand_logo ? (
                            <img src={campaign.brand_logo} alt={campaign.brand_name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl">🏢</span>
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">{campaign.brand_name}</h2>
                        <p className="text-sm text-gray-500">{campaign.budget_range}</p>
                    </div>
                </div>

                {/* Description */}
                <div className="card mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">รายละเอียด</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                        {campaign.full_description || campaign.description}
                    </p>
                </div>

                {/* Deadlines */}
                <div className="card mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">ปิดรับสมัคร</p>
                            <p className="font-medium text-gray-900">
                                {formatDate(campaign.application_deadline)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">ส่งงาน</p>
                            <p className="font-medium text-gray-900">
                                {formatDate(campaign.content_deadline)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                {hasApplied && (
                    <div className="card mb-4">
                        <h3 className="font-semibold text-gray-900 mb-4">📅 Timeline</h3>

                        <div className="space-y-4">
                            {campaign.timeline_stages?.map((stage, index) => {
                                const status = getStageStatus(stage.id)
                                const submission = campaign.user_application?.submissions?.[stage.id]

                                return (
                                    <div key={stage.id} className="relative">
                                        {/* Connector line */}
                                        {index < campaign.timeline_stages.length - 1 && (
                                            <div className={`absolute left-4 top-10 w-0.5 h-8 ${status === 'completed' ? 'bg-primary-500' : 'bg-gray-200'
                                                }`} />
                                        )}

                                        <div className="flex gap-4">
                                            {/* Icon */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${status === 'completed' ? 'bg-primary-500 text-white' :
                                                status === 'current' ? 'bg-secondary-500 text-white ring-4 ring-secondary-100' :
                                                    status === 'pending' ? 'bg-yellow-500 text-white' :
                                                        'bg-gray-200 text-gray-500'
                                                }`}>
                                                {status === 'completed' ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <span className="text-sm">{stage.icon}</span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <h4 className={`font-medium ${status === 'locked' ? 'text-gray-400' : 'text-gray-900'
                                                    }`}>
                                                    {stage.name_th}
                                                </h4>
                                                <p className="text-xs text-gray-500">{stage.description}</p>

                                                {/* Submission info */}
                                                {submission && (
                                                    <div className="mt-2 text-xs">
                                                        {submission.status === 'approved' && (
                                                            <span className="text-primary-600">✓ อนุมัติแล้ว</span>
                                                        )}
                                                        {submission.status === 'pending' && (
                                                            <span className="text-yellow-600">⏳ รอตรวจสอบ</span>
                                                        )}
                                                        {submission.feedback && (
                                                            <p className="mt-1 text-gray-600 bg-gray-50 p-2 rounded">
                                                                Feedback: {submission.feedback}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Submission Form */}
                {currentStage && (
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            📎 ส่งงาน ({currentStage === 'script' ? 'Script' : currentStage === 'draft' ? 'Draft' : 'Final'})
                        </h3>

                        {/* Link input with validation */}
                        <div className="mb-4">
                            <label className="label">ลิงก์งาน (Google Drive, etc.)</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={submissionLink}
                                    onChange={(e) => {
                                        setSubmissionLink(e.target.value)
                                        setValidationResult(null)
                                    }}
                                    placeholder="https://drive.google.com/..."
                                    className="input-field flex-1"
                                />
                                <button
                                    onClick={handleValidateLink}
                                    disabled={!submissionLink || isValidating}
                                    className="btn-secondary px-4 flex-shrink-0"
                                >
                                    {isValidating ? '...' : 'ตรวจสอบ'}
                                </button>
                            </div>

                            {/* Validation result */}
                            {validationResult && (
                                <div className={`mt-2 p-2 rounded-lg text-sm ${validationResult.accessible === true
                                    ? 'bg-green-50 text-green-700'
                                    : validationResult.accessible === false
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-yellow-50 text-yellow-700'
                                    }`}>
                                    {validationResult.accessible === true && '✅ '}
                                    {validationResult.accessible === false && '❌ '}
                                    {validationResult.accessible === null && '⚠️ '}
                                    {validationResult.message}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="mb-4">
                            <label className="label">หมายเหตุ (ไม่บังคับ)</label>
                            <textarea
                                value={submissionNotes}
                                onChange={(e) => setSubmissionNotes(e.target.value)}
                                placeholder="หมายเหตุเพิ่มเติม..."
                                rows={3}
                                className="input-field"
                            />
                        </div>

                        {/* Submit button */}
                        <button
                            onClick={handleSubmitWork}
                            disabled={!submissionLink || !canSubmit || isSubmitting}
                            className="btn-success w-full"
                        >
                            {isSubmitting ? 'กำลังส่ง...' : 'ส่งงาน'}
                        </button>
                    </div>
                )}
            </div>

            {/* Apply Button (if not applied) */}
            {!hasApplied && campaign.status === 'OPEN' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                    <button
                        onClick={handleApply}
                        disabled={isApplying}
                        className="btn-primary w-full"
                    >
                        {isApplying ? 'กำลังสมัคร...' : 'สมัครรับงาน'}
                    </button>
                </div>
            )}
        </div>
    )
}

export default CampaignDetail
