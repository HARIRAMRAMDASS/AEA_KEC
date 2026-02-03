/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1a1a2e", // Dark Navy
                secondary: "#16213e", // Slightly lighter navy
                accent: "#e94560", // Red/Pink accent
                highlight: "#0f3460", // Blue highlight
                textLight: "#f1f1f1",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
