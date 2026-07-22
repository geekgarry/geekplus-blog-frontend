/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/resume/**/*.{vue,js}',
    './src/views/tool/Resume*.vue',
    './src/views/admin/tool/resume/**/*.{vue,js}',
  ],
  // Avoid resetting Element UI / global blog styles
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
