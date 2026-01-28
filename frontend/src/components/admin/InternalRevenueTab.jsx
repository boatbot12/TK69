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

    const handleSettle = async () => {
        if (!settleNote.trim()) {
            if (!confirm('ยืนยันการชำระค่าธรรมเนียมโดยไม่มีหมายเหตุ?')) return;
        }

        try {
            setIsSettling(true);
            const res = await fetch(`${API_BASE}/admin/finance/internal-revenue/settle/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ note: settleNote })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to settle revenue');
            }

            // Success
            await loadData(); // Reload data
            setShowSettleModal(false);
            setSettleNote('');
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
                                    ยอดเงิน
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
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">
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
                                            <p className="text-sm text-gray-500">
                                                คุณต้องการบันทึกการชำระค่า Platform Fee จำนวน <span className="font-bold text-indigo-600">฿{availableRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span> ใช่หรือไม่?
                                                การดำเนินการนี้จะบันทึกว่าได้ทำการโอนเงินให้กับผู้พัฒนาระบบเรียบร้อยแล้ว
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                                                หมายเหตุ (ถ้ามี)
                                            </label>
                                            <textarea
                                                id="note"
                                                rows="3"
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                                placeholder="เช่น โอนเข้าบัญชีบริษัท XXX..."
                                                value={settleNote}
                                                onChange={(e) => setSettleNote(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleSettle}
                                    disabled={isSettling}
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${isSettling ? 'opacity-70 cursor-not-allowed' : ''}`}
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

export default InternalRevenueTab;
