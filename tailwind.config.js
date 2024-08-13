import { scopedPreflightStyles, isolateInsideOfContainer } from 'tailwindcss-scoped-preflight';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        nt84blue: '#3d4CE0',
        nt84bluedarker: '#2031c5',
        nt84lightblue: '#BFD3ED',
        nt84lighterblue: '#ebf1f9',
        nt84orange: '#EB6649',
        nt84orangedarker: '#C5543B',
      },
    },
  },
  plugins: [
    // scopedPreflightStyles({
    //   isolationStrategy: isolateInsideOfContainer('.twp', {}),
    // }),
  ],
}

