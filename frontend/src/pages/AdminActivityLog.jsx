
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Search, Filter, Calendar, Clock, User, FileText, CheckCircle, XCircle, MessageSquare, Edit3, Trash2, Shield, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const AdminActivityLog = () => {
    const { token, user } = useAuth()
    const navigate = useNavigate()
    const [logs, setLogs] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState({
        action_type: '',
        search: ''
    })
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        if (user && !user.is_superuser) {
            navigate('/admin')
            return
        }
        fetchLogs()
    }, [page, filters, user])

    const fetchLogs = async () => {
        try {
            setIsLoading(true)
            const query = new URLSearchParams({
                page: page,
                ...filters
            })
            if (!filters.action_type) query.delete('action_type')
            if (!filters.search) query.delete('search')

            const res = await fetch(`${API_BASE}/admin/audit-logs/?${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Failed to fetch logs')
            const data = await res.json()
            setLogs(data.results)
            setTotalPages(Math.ceil(data.count / 20)) // Assuming page size 20
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setPage(1)
    }

    const getActionIcon = (type) => {
        switch (type) {
            case 'approve_user':
            case 'approve_work':
                return <CheckCircle className="text-emerald-500" size={18} />
            case 'reject_user':
            case 'reject_work':
                return <XCircle className="text-rose-500" size={18} />
            case 'create_campaign':
                return <FileText className="text-blue-500" size={18} />
            case 'edit_campaign':
                return <Edit3 className="text-amber-500" size={18} />
            case 'comment_user':
                return <MessageSquare className="text-purple-500" size={18} />
            default:
                return <Activity className="text-gray-500" size={18} />
        }
    }

    const getActionLabel = (type) => {
        const map = {
            'approve_user': 'อนุมัติผู้ใช้',
            'reject_user': 'ปฏิเสธผู้ใช้',
            'create_campaign': 'สร้างแคมเปญ',
            'edit_campaign': 'แก้ไขแคมเปญ',
            'approve_work': 'อนุมัติงาน',
            'reject_work': 'ส่งแก้งาน',
            'comment_user': 'คอมเมนต์',
        }
        return map[type] || type
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-24">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Activity size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-gray-900">บันทึกกิจกรรม (Activity Log)</h1>
                    <p className="text-gray-500 text-sm">ตรวจสอบประวัติการทำงานของผู้ดูแลระบบ</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="ค้นหา (ชื่อแอดมิน, ชื่อแคมเปญ, รายละเอียด)..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="relative min-w-[180px]">
                    <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <select
                        name="action_type"
                        value={filters.action_type}
                        onChange={handleFilterChange}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                    >
                        <option value="">ทุกการกระทำ</option>
                        <option value="approve_user">อนุมัติผู้ใช้</option>
                        <option value="reject_user">ปฏิเสธผู้ใช้</option>
                        <option value="create_campaign">สร้างแคมเปญ</option>
                        <option value="edit_campaign">แก้ไขแคมเปญ</option>
                        <option value="approve_work">อนุมัติงาน</option>
                        <option value="reject_work">ส่งแก้งาน</option>
                        <option value="comment_user">คอมเมนต์</option>
                    </select>
                </div>
            </div>

            {/* Log Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase">เวลา</th>
                                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase">ผู้ดำเนินการ (Actor)</th>
                                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase">การกระทำ</th>
                                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase">เป้าหมาย (Target)</th>
                                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase">รายละเอียด</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        ไม่พบข้อมูลกิจกรรม
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} />
                                                {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: th })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                    {log.actor?.display_name?.charAt(0) || <User size={14} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{log.actor?.display_name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400">{log.actor?.email}</p>
                                                    {log.ip_address && <p className="text-[10px] text-gray-300">IP: {log.ip_address}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
                                                {getActionIcon(log.action_type)}
                                                {getActionLabel(log.action_type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{log.target_str}</p>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">{log.target_model}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <pre className="whitespace-pre-wrap font-sans text-xs bg-gray-50 p-2 rounded border border-gray-100 max-h-24 overflow-y-auto">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                        ก่อนหน้า
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-500 flex items-center">
                        หน้า {page} / {totalPages || 1}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                        ถัดไป
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AdminActivityLog
