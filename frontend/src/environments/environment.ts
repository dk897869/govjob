export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  socketUrl: 'http://localhost:5000',
  appName: 'GovJob Portal',
  version: '1.0.0',
  paginationLimit: 10,
  fileUploadLimit: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
  recaptchaSiteKey: 'YOUR_RECAPTCHA_SITE_KEY',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
  enableLogging: true
};