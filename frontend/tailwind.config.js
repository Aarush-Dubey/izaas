/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'rgb(0, 240, 181)',
                'primary-dark': 'rgb(61, 11, 55)',
                background: 'rgb(79, 100, 111)',
                'background-light': 'rgb(181, 186, 208)',
                special: 'rgb(255, 184, 0)',
            }
        },
    },
    plugins: [],
}
