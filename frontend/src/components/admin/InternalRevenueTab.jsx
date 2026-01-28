import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { RefreshCw, CheckCircle, Clock, DollarSign, FileText } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const InternalRevenueTab = () => {
    const { token } = useAuth();
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ available_revenue: '0.00', history: [] });
    const [isSettling, setIsSettling] = useState(false);
    const [settleNote, setSettleNote] = useState('');
    const [showSettleModal, setShowSettleModal] = useState(false);
    const [error, setError] = useState(null);

    const getHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }), [token]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/admin/finance/internal-revenue/`, {
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to load revenue data');
            const jsonData = await res.json();
            setData(jsonData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const [settleAmount, setSettleAmount] = useState('');
    const [slipFile, setSlipFile] = useState(null);

    useEffect(() => {
        if (showSettleModal) {
            setSettleAmount(availableRevenue.toString());
            setSlipFile(null);
        }
    }, [showSettleModal, availableRevenue]);

    const handleSettle = async () => {
        if (!settleNote.trim()) {
            if (!confirm('ยืนยันการชำระค่าธรรมเนียมโดยไม่มีหมายเหตุ?')) return;
        }

        if (!slipFile) {
            toastError('กรุณาอัพโหลดหลักฐานการโอน (Slip)');
            return;
        }

        try {
            setIsSettling(true);

            // Compress image if needed (basic check > 1MB or just always compress)
            let fileToUpload = slipFile;
            if (slipFile.size > 1024 * 1024) { // > 1MB
                try {
                    fileToUpload = await compressImage(slipFile);
                } catch (e) {
                    console.error("Compression failed, sending original", e);
                }
            }

            const formData = new FormData();
            formData.append('amount', settleAmount);
            formData.append('note', settleNote);
            formData.append('slip_image', fileToUpload);

            const res = await fetch(`${API_BASE}/admin/finance/internal-revenue/settle/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to settle revenue');
            }

            // Success
            await loadData(); // Reload data
            setShowSettleModal(false);
            setSettleNote('');
            setSlipFile(null);
            success('บันทึกการชำระค่าธรรมเนียมสำเร็จเรียบร้อยแล้ว');
        } catch (err) {
            toastError(`Error: ${err.message}`);
        } finally {
            setIsSettling(false);
        }
    };

    if (loading && !data.history.length) {
        return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
    }

    const availableRevenue = parseFloat(data.available_revenue || 0);

    return (
        <div className="space-y-6">
            {/* Payment Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                <h3 className="text-blue-800 font-bold mb-3 flex items-center gap-2">
                    📢 ช่องทางการชำระเงิน (Admin Payment Channels)
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">ปกติ (Personal)</span>
                        </div>
                        <p className="font-bold text-gray-800">กสิกรไทย (KBANK)</p>
                        <p className="text-xl font-mono font-bold text-blue-600 tracking-wider">033-1-48106-8</p>
                        <p className="text-gray-600">ธนภัทร ศรีอุทารวงศ์</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">VAT 7% (Company)</span>
                        </div>
                        <p className="font-bold text-gray-800">กสิกรไทย (KBANK)</p>
                        <p className="text-xl font-mono font-bold text-blue-600 tracking-wider">124-3-84309-6</p>
                        <p className="text-gray-600">บริษัท เมลิรร์โร จำกัด</p>
                    </div>
                </div>
            </div>

            {/* Header / Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">
                            Unpaid Platform Fees
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                                ฿{availableRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">
                                (รอยืนยันการชำระเงิน)
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            ค่าบริการ Platform Fee ที่ต้องชำระให้แก่ผู้พัฒนาระบบ (System Owner)
                        </p>
                    </div>

                    <button
                        onClick={() => setShowSettleModal(true)}
                        disabled={availableRevenue <= 0 || loading}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white shadow-sm transition-all
                            ${availableRevenue > 0
                                ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
                                : 'bg-gray-300 cursor-not-allowed'}
                        `}
                    >
                        <DollarSign size={20} />
                        ชำระค่าธรรมเนียม (Pay Platform Fee)
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            {/* History Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Clock size={18} />
                        ประวัติการชำระค่าธรรมเนียม (Payment History)
                    </h3>
                    <button
                        onClick={loadData}
                        className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                        title="Reload"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    วันที่ชำระ
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ยอดทึ่ชำระจริง
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    หลักฐาน
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ผู้ดำเนินการ
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    หมายเหตุ
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    สถานะ
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.history.length > 0 ? (
                                data.history.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(item.date).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">
                                            ฿{parseFloat(item.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* Link to slip logic would go here if URL was in API, currently history API needs update to return slip URL, keeping simple for now */}
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Slip</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.created_by}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                                            {item.note || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                <CheckCircle size={12} className="mr-1 self-center" />
                                                Success
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">
                                        ยังไม่มีประวัติการชำระเงิน
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Settle Confirmation Modal */}
            {showSettleModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !isSettling && setShowSettleModal(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <DollarSign className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            ยืนยันการชำระค่าธรรมเนียม
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 mb-4">
                                                กรุณาตรวจสอบยอดเงินและแนบหลักฐานการโอน
                                            </p>

                                            {/* Amount Input */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    ยอดเงินที่โอน (บาท) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={settleAmount}
                                                    onChange={(e) => setSettleAmount(e.target.value)}
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 font-mono text-lg"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            {/* Slip Upload */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    หลักฐานการโอน (Slip) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setSlipFile(e.target.files[0])}
                                                        className="block w-full text-sm text-gray-500
                                                        file:mr-4 file:py-2 file:px-4
                                                        file:rounded-full file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-indigo-50 file:text-indigo-700
                                                        hover:file:bg-indigo-100"
                                                    />
                                                    {slipFile && (
                                                        <p className="mt-2 text-xs text-green-600 font-medium">
                                                            ✓ {slipFile.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Note */}
                                            <div className="mb-2">
                                                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                                                    หมายเหตุ (ถ้ามี)
                                                </label>
                                                <textarea
                                                    id="note"
                                                    rows="2"
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                                    placeholder="เช่น โอนเข้าบัญชีบริษัท..."
                                                    value={settleNote}
                                                    onChange={(e) => setSettleNote(e.target.value)}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleSettle}
                                    disabled={isSettling || !slipFile}
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${isSettling || !slipFile ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSettling ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSettleModal(false)}
                                    disabled={isSettling}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper: Compress Image
const compressImage = (file) => {
    return new Promise((resolve) => {
        const maxWidth = 1200;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', 0.8);
            };
        };
    });
};

export default InternalRevenueTab;
