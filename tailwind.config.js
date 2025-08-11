/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',               // ← Viteのindex.htmlも含める
    './src/**/*.{js,ts,jsx,tsx}', // ← Reactで使うすべての拡張子を対象に
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

