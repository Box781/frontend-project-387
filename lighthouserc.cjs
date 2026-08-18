module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      startServerCommand:
        'cd backend && PUBLIC_DIR=../frontend/dist HOST=127.0.0.1 PORT=3000 npm start',
      startServerReadyPattern: 'Call Booking:',
      startServerReadyTimeout: 60000,
      url: [
        'http://127.0.0.1:3000/',
        'http://127.0.0.1:3000/book/intro-call',
        'http://127.0.0.1:3000/admin',
      ],
      settings: {
        chromeFlags: '--no-sandbox --headless=new --disable-gpu',
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lhci-reports',
    },
  },
}
