/**
 * Loading Screen - iOS Premium Design
 */

const LoadingScreen = ({ message = 'Loading...' }) => {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0ea5e9 50%, #14b8a6 100%)'
            }}
        >
            {/* Ambient glow effect */}
            <div
                className="absolute w-96 h-96 rounded-full opacity-30 blur-3xl"
                style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)'
                }}
            />

            <div className="relative text-center z-10">
                {/* Animated spinner */}
                <div className="mb-8">
                    <div className="relative w-20 h-20 mx-auto">
                        {/* Outer ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-white/20" />
                        {/* Spinning ring */}
                        <div
                            className="absolute inset-0 rounded-full border-4 border-transparent border-t-white"
                            style={{ animation: 'spin 1s linear infinite' }}
                        />
                        {/* Inner glow */}
                        <div
                            className="absolute inset-3 rounded-full"
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </div>
                </div>

                {/* Message */}
                <p className="text-white text-lg font-medium tracking-wide opacity-90">
                    {message}
                </p>
            </div>
        </div>
    )
}

export default LoadingScreen
