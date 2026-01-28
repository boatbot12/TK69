/**
 * Step 2: Work Conditions - Vibrant Gen Z Design
 * Fun Toggles & Clean Money Inputs
 */

const StepWorkConditions = ({ data, onChange, onNext, onBack }) => {
    const { allowBoost, boostPrice, allowOriginalFile, originalFilePrice } = data

    const updateField = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    const isValid = () => {
        if (allowBoost && (boostPrice === '' || boostPrice === null || boostPrice === undefined)) return false
        if (allowOriginalFile && (originalFilePrice === '' || originalFilePrice === null || originalFilePrice === undefined)) return false
        return true
    }

    const Toggle = ({ checked, onChange }) => (
        <div
            onClick={() => onChange(!checked)}
            className={`
        relative w-[60px] h-[34px] rounded-full cursor-pointer transition-colors duration-300
        ${checked ? 'bg-brand-start' : 'bg-gray-200'}
      `}
        >
            <div className={`
        absolute top-[2px] left-[2px] bg-white w-[30px] h-[30px] rounded-full shadow-md
        transform transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
        ${checked ? 'translate-x-[26px]' : 'translate-x-0'}
      `} />
        </div>
    )

    return (
        <div className="flex flex-col min-h-screen relative z-10 pb-24">
            {/* Header */}
            <div className="px-6 pt-6">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                    เรทราคา & เงื่อนไข 💰
                </h1>
                <p className="text-gray-500 font-medium">
                    ตั้งค่าให้ชัดเจน แบรนด์ชอบคนตรงไปตรงมา!
                </p>
            </div>

            <div className="p-6 space-y-6">

                {/* Boost Settings */}
                <div className={`
          p-6 rounded-[32px] transition-all duration-300
          ${allowBoost ? 'bg-white shadow-glow border-2 border-primary-100' : 'bg-white/60 border-2 border-transparent'}
        `}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                            <div className="text-3xl bg-orange-100 w-12 h-12 flex items-center justify-center rounded-2xl">
                                📢
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">อนุญาตให้ Boost?</h3>
                                <p className="text-sm text-gray-500">ยิงโฆษณาต่อได้</p>
                            </div>
                        </div>
                        <Toggle checked={allowBoost} onChange={() => updateField('allowBoost', !allowBoost)} />
                    </div>

                    {allowBoost && (
                        <div className="animate-spring-up mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <label className="text-sm font-bold text-gray-700 mb-2 block">
                                คิดราคาเพิ่มเท่าไหร่? (บาท)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="เช่น 1500"
                                    className="w-full text-2xl font-bold bg-white px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-start focus:ring-4 focus:ring-primary-100 outline-none text-brand-dark placeholder:text-gray-300 transition-all"
                                    value={boostPrice}
                                    onChange={e => updateField('boostPrice', e.target.value)}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Original File Settings */}
                <div className={`
          p-6 rounded-[32px] transition-all duration-300
          ${allowOriginalFile ? 'bg-white shadow-glow border-2 border-primary-100' : 'bg-white/60 border-2 border-transparent'}
        `}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                            <div className="text-3xl bg-blue-100 w-12 h-12 flex items-center justify-center rounded-2xl">
                                💾
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">ขอไฟล์ต้นฉบับ?</h3>
                                <p className="text-sm text-gray-500">เอาไปตัดต่อใหม่ได้</p>
                            </div>
                        </div>
                        <Toggle checked={allowOriginalFile} onChange={() => updateField('allowOriginalFile', !allowOriginalFile)} />
                    </div>

                    {allowOriginalFile && (
                        <div className="animate-spring-up mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <label className="text-sm font-bold text-gray-700 mb-2 block">
                                ราคาขายไฟล์ (บาท)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="เช่น 2000"
                                    className="w-full text-2xl font-bold bg-white px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-start focus:ring-4 focus:ring-primary-100 outline-none text-brand-dark placeholder:text-gray-300 transition-all"
                                    value={originalFilePrice}
                                    onChange={e => updateField('originalFilePrice', e.target.value)}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Note */}
                <div className="bg-primary-50 p-4 rounded-2xl flex gap-3 items-center text-primary-700 text-sm font-medium border border-primary-100/50">
                    <span className="text-xl">💡</span>
                    ไม่ต้องห่วง! เดี๋ยวกลับมาแก้ทีหลังได้นะ
                </div>

            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent backdrop-blur-[2px] z-50 flex gap-3">
                <button
                    onClick={onBack}
                    className="btn-secondary w-1/3 text-lg"
                >
                    กลับ
                </button>
                <button
                    onClick={onNext}
                    disabled={!isValid()}
                    className="btn-primary w-2/3 text-lg shadow-lg shadow-emerald-200/50 bg-brand-gradient hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    ถัดไป 👉
                </button>
            </div>
        </div>
    )
}

export default StepWorkConditions
