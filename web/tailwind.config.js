/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        toss: {
          blue: '#3182f6',
          'blue-light': '#e8f3ff',
          'blue-dark': '#1b64da',
          gray: {
            50: '#f9fafb',
            100: '#f2f4f6',
            200: '#e5e8eb',
            300: '#d1d6db',
            400: '#b0b8c1',
            500: '#8b95a1',
            600: '#6b7684',
            700: '#4e5968',
            800: '#333d4b',
            900: '#191f28',
          },
        },
      },
      fontFamily: {
        pretendard: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
