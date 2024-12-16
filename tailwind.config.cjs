module.exports = {
  content: [
    "./src/web/**/*.{html,js,jsx,ts,tsx}",
    "./src/web/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'reddit-blue': '#0079D3',
        'reddit-hover': '#0052cc',
        'reddit-black': '#1a1a1b'
      }
    }
  },
  corePlugins: {
    preflight: false
  }
}