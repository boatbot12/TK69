/**
 * Admin Finance Dashboard
 * Super Admin only - Financial management interface
 * 
 * Features:
 * - Overview cards: Total GMV, Net Revenue, Pending Payouts
 * - Payout management table with confirm payment modal
 * - Tax report export
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import BulkSlipUploadModal from '../components/admin/BulkSlipUploadModal'
import GenericTabs from '../components/common/GenericTabs'
import InternalRevenueTab from '../components/admin/InternalRevenueTab'

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const cleanText = (text) => {
    if (!text) return ''
    return text.replace(/\?{2,}/g, '')
        .replace(/^\?+/, '')
        .replace(/\?+$/, '')
        .trim()
}

const AdminFinance = () => {
    const { user, token } = useAuth()
    const navigate = useNavigate()
    const { success, error: toastError } = useToast()

    // State
    const [activeTab, setActiveTab] = useState('payouts')
    const [stats, setStats] = useState(null)
    const [pendingPayouts, setPendingPayouts] = useState([])
    const [transactions, setTransactions] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Modal state
    const [showPayoutModal, setShowPayoutModal] = useState(false)
    const [selectedJob, setSelectedJob] = useState(null)
    const [slipFile, setSlipFile] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Bulk Modal state
    const [showBulkModal, setShowBulkModal] = useState(false)
    const [selectedJobIds, setSelectedJobIds] = useState(new Set())

    // Auth headers
    const getHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }), [token])

    // Load dashboard data
    const loadDashboard = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const [statsRes, payoutsRes, txRes] = await Promise.all([
                fetch(`${API_BASE}/admin/finance/dashboard/`, { headers: getHeaders() }),
                fetch(`${API_BASE}/admin/finance/pending-payouts/`, { headers: getHeaders() }),
                fetch(`${API_BASE}/admin/finance/transactions/?limit=20`, { headers: getHeaders() })
            ])

            if (!statsRes.ok) throw new Error('Failed to load dashboard stats')

            const statsData = await statsRes.json()
            const payoutsData = await payoutsRes.json()
            const txData = await txRes.json()

            setStats(statsData)
            setPendingPayouts(payoutsData.results || [])
            setTransactions(txData.results || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }, [getHeaders])

    useEffect(() => {
        // Check if user is super admin
        if (user && !user.is_superuser) {
            navigate('/jobs')
            return
        }
        loadDashboard()
    }, [user, navigate, loadDashboard])

    // Handle payout confirmation
    const handleConfirmPayout = async () => {
        if (!slipFile) {
            toastError('กรุณาอัพโหลดรูปสลิป (Upload Slip)')
            return
        }

        try {
            setIsProcessing(true)

            const formData = new FormData()
            formData.append('job_id', selectedJob.id)
            formData.append('slip_image', slipFile)

            const res = await fetch(`${API_BASE}/admin/finance/payout/confirm/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // No Content-Type, let browser set boundary for multipart/form-data
                },
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Payout failed')
            }

            success(`✅ โอนเงินสำเร็จ!\n\nยอดจ่าย: ฿${parseFloat(data.breakdown.net_payout).toLocaleString()}\nค่าบริการ: ฿${parseFloat(data.breakdown.platform_fee).toLocaleString()}`)

            setShowPayoutModal(false)
            setSelectedJob(null)
            setSlipFile(null)
            loadDashboard()
        } catch (err) {
            toastError(`❌ Error: ${err.message}`)
        } finally {
            setIsProcessing(false)
        }
    }

    // Handle Bulk Confirmation
    const handleBulkConfirm = async (fileMap) => {
        try {
            setIsProcessing(true)
            const formData = new FormData()

            // Convert fileMap to FormData
            // Format: transaction_ids=[1,2], proof_files[1]=file1, proof_files[2]=file2
            const ids = []
            Object.entries(fileMap).forEach(([jobId, file]) => {
                ids.push(jobId)
                formData.append(`proof_files_${jobId}`, file, `slip_${jobId}.jpg`)
            })
            formData.append('transaction_ids', JSON.stringify(ids))

            const res = await fetch(`${API_BASE}/admin/finance/payout/bulk-confirm/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // checking out Content-Type to let browser set boundary
                },
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Bulk payout failed')
            }

            success(`✅ Bulk Payout Successful!\nProcessed: ${data.processed_count}`)

            setShowBulkModal(false)
            setSelectedJobIds(new Set())
            loadDashboard()
        } catch (err) {
            alert(`❌ Error: ${err.message}`)
        } finally {
            setIsProcessing(false)
        }
    }

    // Selection Handlers
    const toggleSelectAll = () => {
        if (selectedJobIds.size === pendingPayouts.length) {
            setSelectedJobIds(new Set())
        } else {
            setSelectedJobIds(new Set(pendingPayouts.map(j => j.id)))
        }
    }

    const toggleSelect = (id) => {
        const newSet = new Set(selectedJobIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedJobIds(newSet)
    }

    // Get selected job objects
    const getSelectedJobs = () => pendingPayouts.filter(j => selectedJobIds.has(j.id))

    // Export tax report
    const handleExportTaxReport = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/finance/export/tax-report/`, {
                headers: getHeaders()
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.detail || 'Export failed')
            }

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `tax_report_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            toastError(`❌ Export Failed: ${err.message}`)
        }
    }

    // Format currency
    const formatMoney = (amount) => {
        const num = parseFloat(amount) || 0
        return `฿${num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    if (isLoading && activeTab === 'payouts') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลการเงิน...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold">💰 Financial Dashboard</h1>
                    <p className="text-emerald-100 mt-1">ระบบการเงินและบัญชี (Super Admin)</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-6">
                <GenericTabs
                    tabs={[
                        { id: 'payouts', label: 'Influencer Payouts' },
                        { id: 'revenue', label: 'Internal Revenue' }
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {activeTab === 'revenue' ? (
                    <InternalRevenueTab />
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* Total GMV */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">📊</span>
                                    <span className="text-gray-500 text-sm">Total GMV</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'monospace' }}>
                                    {formatMoney(stats?.total_gmv)}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">มูลค่ารวมทั้งหมด</p>
                            </div>

                            {/* Net Revenue */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">💎</span>
                                    <span className="text-emerald-600 text-sm font-medium">Platform Fee (Total)</span>
                                </div>
                                <p className="text-3xl font-bold text-emerald-600" style={{ fontFamily: 'monospace' }}>
                                    {formatMoney(stats?.total_revenue)}
                                </p>
                                <p className="text-xs text-emerald-400 mt-1">รายได้ Platform สะสมทั้งหมด</p>
                            </div>

                            {/* Pending Payouts */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100 bg-gradient-to-br from-amber-50 to-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">⏳</span>
                                    <span className="text-amber-600 text-sm font-medium">Pending Payouts</span>
                                </div>
                                <p className="text-3xl font-bold text-amber-600" style={{ fontFamily: 'monospace' }}>
                                    {stats?.pending_payout_count || 0}
                                </p>
                                <p className="text-xs text-amber-400 mt-1">
                                    รอจ่าย {formatMoney(stats?.pending_payout_amount)}
                                </p>
                            </div>
                        </div>

                        {/* Actions Bar */}
                        <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
                            <div className="flex gap-3">
                                <button
                                    onClick={loadDashboard}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    🔄 รีเฟรช
                                </button>
                                <button
                                    onClick={handleExportTaxReport}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
                                >
                                    📋 Export รายงานภาษี (CSV)
                                </button>
                            </div>

                            {/* Bulk Action Button */}
                            {selectedJobIds.size > 0 && (
                                <button
                                    onClick={() => setShowBulkModal(true)}
                                    className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 animate-fade-in flex items-center gap-2"
                                >
                                    <span>📤 Upload Slips ({selectedJobIds.size})</span>
                                </button>
                            )}
                        </div>

                        {/* Pending Payouts Table */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="font-bold text-gray-900">🔔 งานรอจ่ายเงิน</h2>
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                    {pendingPayouts.length} รายการ
                                </span>
                            </div>

                            {pendingPayouts.length === 0 ? (
                                <div className="px-6 py-12 text-center text-gray-400">
                                    <span className="text-4xl block mb-2">✨</span>
                                    ไม่มีงานรอจ่ายเงิน
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={pendingPayouts.length > 0 && selectedJobIds.size === pendingPayouts.length}
                                                        onChange={toggleSelectAll}
                                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">แคมเปญ</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Influencer</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">มูลค่างาน</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Platform Fee</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ยอดจ่าย</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {pendingPayouts.map((job) => (
                                                <tr key={job.id} className={`hover:bg-gray-50 ${selectedJobIds.has(job.id) ? 'bg-emerald-50/30' : ''}`}>
                                                    <td className="px-4 py-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedJobIds.has(job.id)}
                                                            onChange={() => toggleSelect(job.id)}
                                                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900 truncate max-w-xs">{cleanText(job.campaign_title)}</p>
                                                            <p className="text-sm text-gray-500">{cleanText(job.brand_name)}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="font-medium text-gray-900">{cleanText(job.influencer_name)}</p>
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-mono text-gray-900">
                                                        {formatMoney(job.gross_amount)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-mono text-orange-500">
                                                        {formatMoney(job.platform_fee)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-mono text-emerald-600 font-bold">
                                                        {formatMoney(job.net_payout)}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedJob(job)
                                                                setShowPayoutModal(true)
                                                            }}
                                                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm font-medium"
                                                        >
                                                            💸 Confirm Payment
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900">📜 ธุรกรรมล่าสุด</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">จำนวนเงิน</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้รับ</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                                    {tx.id.substring(0, 8)}...
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'PAYOUT' ? 'bg-emerald-100 text-emerald-700' :
                                                        tx.type === 'SERVICE_FEE' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {tx.type_display}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                                                    {formatMoney(tx.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    {tx.receiver || '-'}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                                    {tx.reference || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {new Date(tx.created_at).toLocaleDateString('th-TH')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bulk Upload Modal */}
                        <BulkSlipUploadModal
                            isOpen={showBulkModal}
                            onClose={() => setShowBulkModal(false)}
                            selectedJobs={getSelectedJobs()}
                            onConfirm={handleBulkConfirm}
                            isProcessing={isProcessing}
                        />

                        {/* Payout Confirmation Modal */}
                        {showPayoutModal && selectedJob && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                                    {/* Modal Header */}
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4">
                                        <h3 className="text-lg font-bold">💸 ยืนยันการโอนเงิน</h3>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="px-6 py-6">
                                        <div className="space-y-4">
                                            {/* Job Info */}
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <p className="text-sm text-gray-500">แคมเปญ</p>
                                                <p className="font-bold text-gray-900">{cleanText(selectedJob.campaign_title)}</p>
                                                <p className="text-sm text-gray-600 mt-1">{cleanText(selectedJob.brand_name)}</p>
                                            </div>

                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <p className="text-sm text-gray-500">Influencer</p>
                                                <p className="font-bold text-gray-900">{cleanText(selectedJob.influencer_name)}</p>
                                            </div>

                                            {/* Payment Breakdown */}
                                            <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">มูลค่างาน</span>
                                                    <span className="font-mono">{formatMoney(selectedJob.gross_amount)}</span>
                                                </div>
                                                <div className="flex justify-between text-orange-600">
                                                    <span>Platform Fee (Internal)</span>
                                                    <span className="font-mono">{formatMoney(selectedJob.platform_fee)}</span>
                                                </div>
                                                <div className="border-t border-emerald-200 pt-2 flex justify-between">
                                                    <span className="font-bold text-emerald-700">ยอดโอน</span>
                                                    <span className="font-mono font-bold text-emerald-700 text-lg">
                                                        {formatMoney(selectedJob.net_payout)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bank Slip Upload */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    หลักฐานการโอนเงิน (สลิป) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setSlipFile(e.target.files[0])}
                                                        className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-emerald-50 file:text-emerald-700
                                                        hover:file:bg-emerald-100"
                                                    />
                                                    {slipFile && (
                                                        <p className="mt-2 text-xs text-emerald-600 font-medium">
                                                            ✓ Selected: {slipFile.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    * กรุณาอัพโหลดรูปสลิปการโอนเงิน
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="px-6 py-4 bg-gray-50 flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowPayoutModal(false)
                                                setSelectedJob(null)
                                                setSlipFile(null)
                                            }}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100"
                                            disabled={isProcessing}
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            onClick={handleConfirmPayout}
                                            disabled={isProcessing || !slipFile}
                                            className={`flex-1 px-4 py-3 rounded-xl text-white font-bold ${isProcessing || !slipFile
                                                ? 'bg-gray-300 cursor-not-allowed'
                                                : 'bg-emerald-500 hover:bg-emerald-600'
                                                }`}
                                        >
                                            {isProcessing ? '⏳ กำลังดำเนินการ...' : '✅ ยืนยันการโอนเงิน'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default AdminFinance
