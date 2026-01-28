/**
 * Progress Bar Component - Vibrant Gen Z Design
 * Segmented Pill Style
 */

const ProgressBar = ({ currentStep, totalSteps = 3 }) => {
    return (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4">
            <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Registration</span>
                <span className="text-xs font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    Step {currentStep} / {totalSteps}
                </span>
            </div>
            <div className="flex gap-2 h-2">
                {[...Array(totalSteps)].map((_, i) => {
                    const stepNum = i + 1
                    const isActive = stepNum <= currentStep

                    return (
                        <div
                            key={i}
                            className={`
                h-full flex-1 rounded-full transition-all duration-500
                ${isActive ? 'bg-gradient-to-r from-teal-400 to-sky-400 shadow-[0_0_10px_rgba(45,212,191,0.3)]' : 'bg-gray-100'}
              `}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default ProgressBar
