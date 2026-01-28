import { useState } from 'react'
import WorkflowStep from './workflow/WorkflowStep'
import SubmissionForm from './workflow/SubmissionForm'
import ReadOnlySubmission from './workflow/ReadOnlySubmission'
import { Clock, CheckCircle, ExternalLink, FileText, FileEdit, Video, Rocket, Wallet, Sparkles, Loader2 } from 'lucide-react'

const JobWorkflow = ({ application, campaign, onSubmitWork, isSubmitting }) => {
    // Determine active stage to open by default
    const getInitialExpanded = () => {
        if (!application) return 'brief'

        // PRIORITY: If any stage needs revision, expand it
        const revisionStage = Object.entries(application.submissions || {}).find(([_, s]) => s.status === 'revision_requested')
        if (revisionStage) return revisionStage[0]

        const map = {
            'WAITING': 'brief',
            'APPROVED': 'script',
            'WORK_IN_PROGRESS': 'script',
            'SUBMITTED_SCRIPT': 'script',
            'SCRIPT_APPROVED': 'draft',
            'REVISE_SCRIPT': 'script',
            'SUBMITTED_DRAFT': 'draft',
            'DRAFT_APPROVED': 'final',
            'REVISE_DRAFT': 'draft',
            'SUBMITTED_FINAL': 'final',
            'REVISE_FINAL': 'final',
            'FINAL_APPROVED': 'insight',
            'SUBMITTED_INSIGHT': 'insight',
            'REVISE_INSIGHT': 'insight',
            'INSIGHT_APPROVED': 'payment',
            'COMPLETED': 'payment',
            'PAYMENT_TRANSFERRED': 'payment'
        }
        return map[application.status] || 'brief'
    }

    const [expandedStage, setExpandedStage] = useState(getInitialExpanded())

    const stages = [
        { id: 'brief', title: 'รับบรีฟและรายละเอียด', icon: <FileText size={20} /> },
        { id: 'script', title: 'ส่งสคริปต์ (Script)', icon: <FileEdit size={20} />, deadline: campaign?.script_deadline },
        { id: 'draft', title: 'ส่งดราฟต์วิดีโอ (Draft)', icon: <Video size={20} />, deadline: campaign?.draft_deadline },
        { id: 'final', title: 'ส่งงานตัวจริง (Final)', icon: <Rocket size={20} />, deadline: campaign?.final_deadline },
        { id: 'insight', title: 'ส่ง Insight (หลังจบงาน)', icon: <div className="text-xl">📊</div>, deadline: campaign?.insight_deadline },
        { id: 'payment', title: 'หลักฐานการชำระเงิน (Payment)', icon: <Wallet size={20} /> },
    ]

    const getStageStatus = (stageId) => {
        if (!application) return 'locked'

        const appStatus = application.status
        const submissionList = application.submissions?.[stageId]

        // Handle List vs Object (backwards compatibility)
        let latestSubmission = null
        if (Array.isArray(submissionList) && submissionList.length > 0) {
            latestSubmission = submissionList[submissionList.length - 1]
        } else if (submissionList && !Array.isArray(submissionList)) {
            // Fallback for old object structure
            latestSubmission = submissionList
        }

        // 1. Check if this specific stage is in revision
        if (latestSubmission?.status === 'revision_requested') {
            return 'revision'
        }

        // Brief is always done if application is approved or beyond
        if (stageId === 'brief') {
            return 'done'
        }

        // SCRIPT Stage Logic
        if (stageId === 'script') {
            if (['APPROVED', 'WORK_IN_PROGRESS', 'REVISE_SCRIPT'].includes(appStatus)) {
                return 'active'
            }
            if (appStatus === 'SUBMITTED_SCRIPT') {
                return 'pending'
            }
            if (['SCRIPT_APPROVED', 'SUBMITTED_DRAFT', 'REVISE_DRAFT', 'DRAFT_APPROVED', 'SUBMITTED_FINAL', 'REVISE_FINAL', 'FINAL_APPROVED', 'SUBMITTED_INSIGHT', 'REVISE_INSIGHT', 'INSIGHT_APPROVED', 'COMPLETED', 'PAYMENT_TRANSFERRED'].includes(appStatus)) {
                return 'done'
            }
            return 'locked'
        }

        // DRAFT Stage Logic
        if (stageId === 'draft') {
            if (['SCRIPT_APPROVED', 'REVISE_DRAFT'].includes(appStatus)) {
                return 'active'
            }
            if (appStatus === 'SUBMITTED_DRAFT') {
                return 'pending'
            }
            if (['DRAFT_APPROVED', 'SUBMITTED_FINAL', 'REVISE_FINAL', 'FINAL_APPROVED', 'SUBMITTED_INSIGHT', 'REVISE_INSIGHT', 'INSIGHT_APPROVED', 'COMPLETED', 'PAYMENT_TRANSFERRED'].includes(appStatus)) {
                return 'done'
            }
            return 'locked'
        }

        // FINAL Stage Logic
        if (stageId === 'final') {
            if (['DRAFT_APPROVED', 'REVISE_FINAL'].includes(appStatus)) {
                return 'active'
            }
            if (appStatus === 'SUBMITTED_FINAL') {
                return 'pending'
            }
            if (['FINAL_APPROVED', 'SUBMITTED_INSIGHT', 'REVISE_INSIGHT', 'INSIGHT_APPROVED', 'COMPLETED', 'PAYMENT_TRANSFERRED'].includes(appStatus)) {
                return 'done'
            }
            return 'locked'
        }

        // INSIGHT Stage Logic
        if (stageId === 'insight') {
            if (['FINAL_APPROVED', 'REVISE_INSIGHT'].includes(appStatus)) {
                return 'active'
            }
            if (appStatus === 'SUBMITTED_INSIGHT') {
                return 'pending'
            }
            if (['INSIGHT_APPROVED', 'COMPLETED', 'PAYMENT_TRANSFERRED'].includes(appStatus)) {
                return 'done'
            }
            return 'locked'
        }

        // PAYMENT Stage Logic
        if (stageId === 'payment') {
            if (['INSIGHT_APPROVED', 'COMPLETED'].includes(appStatus)) {
                return 'pending'  // Waiting for admin to upload payment slip
            }
            if (appStatus === 'PAYMENT_TRANSFERRED') {
                return 'done'  // Payment slip uploaded
            }
            return 'locked'
        }

        return 'locked'
    }

    return (
        <div className="space-y-3 relative">
            {/* Vertical Line Connector */}
            {/* Premium Dashed Line Connector */}
            <div className="absolute left-[3.25rem] top-8 bottom-8 w-px border-l-2 border-dashed border-gray-200 z-0" />

            {stages.map((stage) => {
                const status = getStageStatus(stage.id)
                const isExpanded = expandedStage === stage.id

                // Handle new array structure for submissions
                const submissionsList = application?.submissions?.[stage.id]
                let latestSubmission = null

                if (Array.isArray(submissionsList) && submissionsList.length > 0) {
                    latestSubmission = submissionsList[submissionsList.length - 1]
                } else {
                    // Backwards compatibility or empty
                    latestSubmission = submissionsList
                }

                // Check attempting count
                const attemptCount = Array.isArray(submissionsList) ? submissionsList.length : (submissionsList ? 1 : 0)
                const isMaxAttemptsReached = attemptCount >= 3

                return (
                    <WorkflowStep
                        key={stage.id}
                        stage={stage}
                        status={status}
                        isExpanded={isExpanded}
                        onToggle={() => setExpandedStage(isExpanded ? null : stage.id)}
                        deadline={stage.deadline}
                    >
                        {/* Brief Content (Read Only) */}
                        {stage.id === 'brief' && (
                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed border border-gray-100 space-y-4">
                                <div>
                                    <p className="font-bold text-gray-900 mb-2">รายละเอียดงาน:</p>
                                    {campaign.full_description || campaign.description}
                                </div>

                                {campaign.brief_url && (
                                    <div className="pt-2">
                                        <a
                                            href={campaign.brief_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-gradient text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
                                        >
                                            <FileText size={16} />
                                            ดูบรีฟงานอย่างละเอียด
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Active Submission Form (for script, draft, final) */}
                        {/* Active Submission Form (for script, draft, final) */}
                        {(status === 'active' || status === 'revision') && ['script', 'draft', 'final'].includes(stage.id) && (
                            <>
                                {status === 'revision' && (
                                    <ReadOnlySubmission
                                        submission={latestSubmission}
                                        history={submissionsList}
                                    />
                                )}

                                {isMaxAttemptsReached ? (
                                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-center animate-shake">
                                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-3xl">🚫</span>
                                        </div>
                                        <h3 className="text-lg font-black text-rose-700 mb-2">ครบกำหนดจำนวนครั้งการแก้ไข</h3>
                                        <p className="text-rose-600">
                                            คุณได้ส่งงานครบ 3 ครั้งแล้ว กรุณาติดต่อแอดมินหากต้องการส่งงานเพิ่มเติม
                                        </p>
                                    </div>
                                ) : (
                                    <SubmissionForm
                                        stageId={stage.id}
                                        onSubmit={onSubmitWork}
                                        isSubmitting={isSubmitting}
                                        existingSubmission={status === 'revision' ? null : latestSubmission}
                                        attemptCount={attemptCount + 1}
                                    />
                                )}
                            </>
                        )}

                        {/* INSIGHT Submission Form (File Upload) */}
                        {(status === 'active' || status === 'revision') && stage.id === 'insight' && (
                            <InsightUploadForm
                                stageId={stage.id}
                                onSubmit={onSubmitWork}
                                isSubmitting={isSubmitting}
                                existingSubmission={latestSubmission}
                                initialFiles={application.insight_files || (application.insight_image ? [application.insight_image] : [])}
                            />
                        )}

                        {/* Read Only Submission */}
                        {(status === 'pending' || status === 'done') && stage.id !== 'brief' && stage.id !== 'payment' && (
                            stage.id === 'insight' ? (
                                // Use new insight fields for insight stage
                                application.insight_image ? (
                                    <ReadOnlySubmission
                                        submission={{
                                            link: application.insight_image,
                                            files: application.insight_files,
                                            // Map insight_note to notes for ReadOnlySubmission
                                            notes: application.insight_note,
                                            submitted_at: application.insight_submitted_at,
                                            status: application.status === 'SUBMITTED_INSIGHT' ? 'pending' :
                                                application.status === 'REVISE_INSIGHT' ? 'revision_requested' : 'approved',
                                            feedback: application.insight_feedback
                                        }}
                                        history={null}
                                        stageId={stage.id}
                                        appStatus={application.status}
                                    />
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 border border-gray-100">
                                        <p className="text-center">✅ ขั้นตอนนี้เสร็จสมบูรณ์แล้ว</p>
                                    </div>
                                )
                            ) : (
                                // Use submission_data for other stages
                                latestSubmission ? (
                                    <ReadOnlySubmission
                                        submission={latestSubmission}
                                        history={submissionsList}
                                        stageId={stage.id}
                                        appStatus={application.status}
                                    />
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 border border-gray-100">
                                        <p className="text-center">✅ ขั้นตอนนี้เสร็จสมบูรณ์แล้ว</p>
                                    </div>
                                )
                            )
                        )}

                        {/* Payment Step Content */}
                        {/* Payment Step Content */}
                        {stage.id === 'payment' && status === 'pending' && (
                            <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-5 flex gap-4 text-sm text-amber-800 shadow-sm items-center">
                                <div className="bg-amber-100 p-2 rounded-full">
                                    <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-base">⏳ รอหลักฐานการชำระเงิน</p>
                                    <p className="mt-0.5 text-amber-600/90">งานเสร็จสมบูรณ์แล้ว แบรนด์กำลังดำเนินการโอนเงินให้คุณ</p>
                                </div>
                            </div>
                        )}

                        {stage.id === 'payment' && status === 'done' && (
                            <div className="space-y-4">
                                {/* Success Banner */}
                                <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-5 flex gap-4 text-sm text-emerald-800 shadow-sm items-center">
                                    <div className="bg-emerald-100 p-2 rounded-full">
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base">🎉 ได้รับเงินเรียบร้อยแล้ว!</p>
                                        <p className="mt-0.5 text-emerald-600/90">การชำระเงินเสร็จสิ้น ขอบคุณที่ร่วมงานกับเรา</p>
                                    </div>
                                </div>

                                {/* Payment Slip Image */}
                                {application.payment_slip && (
                                    <div className="bg-white rounded-2xl p-4 shadow-soft relative overflow-hidden group">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">
                                            หลักฐานการโอนเงิน
                                        </p>
                                        <a
                                            href={application.payment_slip}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                                        >
                                            <img
                                                src={application.payment_slip}
                                                alt="Payment Slip"
                                                className="w-full object-cover"
                                            />
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </WorkflowStep >
                )
            })}
        </div >
    )
}

// Inline Component for Insight Upload (Multi-File)
const InsightUploadForm = ({ stageId, onSubmit, isSubmitting, existingSubmission, initialFiles = [] }) => {
    const [files, setFiles] = useState(initialFiles) // Can be File object or URL string
    const [previews, setPreviews] = useState(initialFiles) // URLs for preview
    const [notes, setNotes] = useState(existingSubmission?.notes || '')

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files)
        if (selectedFiles.length > 0) {
            // Append new files
            const newFiles = [...files, ...selectedFiles]
            setFiles(newFiles)

            // Generate previews for new files
            const newPreviews = selectedFiles.map(f => URL.createObjectURL(f))
            setPreviews([...previews, ...newPreviews])
        }
    }

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index)
        const newPreviews = previews.filter((_, i) => i !== index)
        setFiles(newFiles)
        setPreviews(newPreviews)
    }

    const handleSubmit = () => {
        if (files.length === 0) return

        // Create FormData-like structure logic happens in parent, here we just pass the files array
        // NOTE: The parent onSubmitWork handles the actual API call. 
        // We need to pass the files array as the 4th argument.
        onSubmit(stageId, '', notes, files)
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    อัปโหลดรูปภาพ Insight 📊 (เลือกได้หลายรูป)
                </label>

                <div className="space-y-4">
                    {/* File Drop Area */}
                    <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                            <span className="text-xl">📷</span>
                        </div>
                        <p className="text-gray-600 font-bold text-sm">กดเพื่อเพิ่มรูปภาพ</p>
                        <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG (ส่งได้หลายรูป)</p>
                    </div>

                    {/* Preview Grid */}
                    {previews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-[9/16]">
                                    <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover bg-gray-50" />

                                    {!isSubmitting && (
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Premium AI Analysis Loading State */}
                {isSubmitting && (
                    <div className="mt-4 rounded-2xl bg-[#0B0F19] text-white p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] border border-purple-500/30">
                        {/* Dynamic Background Effects */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0B0F19] to-[#0B0F19] animate-pulse-slow" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />

                        {/* Animated Grid Lines */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center w-full max-w-xs">
                            {/* Central Orb Animation */}
                            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-[spin_3s_linear_infinite]" />
                                <div className="absolute inset-2 rounded-full border-t-2 border-purple-400 animate-[spin_2s_linear_infinite_reverse]" />
                                <div className="absolute inset-0 rounded-full bg-purple-600/20 blur-xl animate-pulse" />

                                {/* Inner AI Icon */}
                                <div className="relative z-10 bg-gradient-to-tr from-indigo-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] animate-bounce-slight">
                                    <Sparkles size={24} className="text-white" />
                                </div>
                            </div>

                            {/* Text & Steps */}
                            <div className="text-center space-y-2 mb-4">
                                <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-purple-200 animate-gradient-x">
                                    Gemini AI Analysis
                                </h3>
                                <div className="flex flex-col gap-1 items-center">
                                    <p className="text-xs font-mono text-purple-300/80 flex items-center gap-2">
                                        <Loader2 size={10} className="animate-spin" />
                                        Scanning {files.length} images...
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden relative">
                                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-[60%] animate-[shimmer_2s_infinite_linear]"
                                    style={{ backgroundSize: '200% 100%' }} />
                            </div>

                            {/* Metrics Tags (Mockup of what it's finding) */}
                            <div className="mt-4 flex flex-wrap justify-center gap-2 opacity-60">
                                {['Views', 'Engagement', 'Demographics', 'ROI'].map((tag, i) => (
                                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full border border-purple-500/30 text-purple-200/70 animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">หมายเหตุ (ถ้ามี)</label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="รายละเอียดเพิ่มเติม..."
                    rows={2}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={files.length === 0 || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2
                    ${files.length === 0 || isSubmitting
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95'}
                `}
            >
                {isSubmitting ? (
                    <span>ประมวลผล...</span>
                ) : (
                    <>
                        <span>ส่งข้อมูล Insight ({files.length} รูป)</span>
                        <Rocket size={18} className="rotate-45" />
                    </>
                )}
            </button>
        </div>
    )
}


export default JobWorkflow
