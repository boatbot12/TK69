/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'Noto Sans Thai', 'sans-serif'],
            },
            colors: {
                brand: {
                    start: '#10b981', // Emerald-500
                    end: '#2563eb',   // Blue-600
                    dark: '#0f172a',  // Slate-900
                },
                primary: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                },
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)',
                'brand-gradient-hover': 'linear-gradient(135deg, #059669 0%, #1d4ed8 100%)',
                'glass': 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
            },
            boxShadow: {
                'soft': '0 4px 30px rgba(0, 0, 0, 0.05)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glow': '0 0 20px rgba(45, 212, 191, 0.4)',
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
            },
        },
    },
    plugins: [],
}
