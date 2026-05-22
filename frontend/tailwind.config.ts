import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        toss: {
          blue: '#3182f6',
          blueHover: '#1b64da',
          gray50: '#f9fafb',
          gray100: '#f2f4f6',
          gray200: '#e5e8eb',
          gray300: '#d1d6db',
          gray600: '#4e5968',
          gray800: '#333d4b',
          gray900: '#191f28',
        }
      },
      borderRadius: {
        'toss': '18px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
