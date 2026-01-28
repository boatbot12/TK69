import React from 'react'
import { CheckCircle, Lock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const WorkflowStep = ({ stage, status, isExpanded, onToggle, children, deadline }) => {
    return (
        <div className="relative z-10 group">
            <button
                onClick={onToggle}
                disabled={status === 'locked'}
                className={`
                    w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300
                    ${isExpanded
                        ? 'bg-white shadow-soft ring-2 ring-brand-start/20 scale-[1.01]'
                        : 'bg-white shadow-sm hover:shadow-soft hover:-translate-y-0.5'}
                    ${status === 'locked' && 'opacity-60 bg-gray-50/80 cursor-not-allowed shadow-none border border-gray-100'}
                `}
            >
                <div className="flex items-center gap-5">
                    {/* Status Icon */}
                    <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg transition-all duration-300
                        ${status === 'done' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-200' :
                            status === 'active' ? 'bg-brand-gradient text-white animate-pulse shadow-glow' :
                                status === 'pending' ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-amber-200' :
                                    status === 'revision' ? 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-rose-200' :
                                        'bg-gray-100 text-gray-400 shadow-inner'}
                    `}>
                        {status === 'done' ? <CheckCircle size={22} className="drop-shadow-sm" /> :
                            status === 'revision' ? <AlertCircle size={22} className="drop-shadow-sm" /> :
                                status === 'locked' ? <Lock size={18} /> :
                                    stage.icon}
                    </div>

                    <div className="text-left">
                        <h3 className={`font-bold text-base ${status === 'locked' ? 'text-gray-400' : 'text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-brand-gradient transition-all'}`}>
                            {stage.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status === 'done' ? 'bg-emerald-50 text-emerald-600' :
                                    status === 'active' ? 'bg-brand-start/10 text-brand-start' :
                                        status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                            status === 'revision' ? 'bg-rose-50 text-rose-600' :
                                                'bg-gray-100 text-gray-400'
                                }`}>
                                {status === 'done' ? 'เสร็จสิ้น' :
                                    status === 'pending' ? 'รอตรวจ' :
                                        status === 'revision' ? 'แก้ไข' :
                                            status === 'active' ? 'ทำตอนนี้' :
                                                'รอเริ่ม'}
                            </span>
                            {deadline && status !== 'done' && (
                                <span className="text-[10px] text-gray-400">
                                    • ครบกำหนด {format(new Date(deadline), 'd MMM', { locale: th })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chevron */}
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${isExpanded ? 'bg-brand-gradient text-white rotate-180 shadow-glow' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}
                `}>
                    <ChevronDown size={18} />
                </div>
            </button>

            {/* Expandable Content */}
            <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="ml-14 mr-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WorkflowStep
