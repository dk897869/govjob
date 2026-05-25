export const environment = {
  production: true,
  apiUrl: 'https://api.govjob.com/api',
  socketUrl: 'https://api.govjob.com',
  appName: 'GovJob Portal',
  version: '1.0.0',
  paginationLimit: 10,
  fileUploadLimit: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
  recaptchaSiteKey: 'YOUR_PRODUCTION_RECAPTCHA_KEY',
  googleClientId: 'YOUR_PRODUCTION_GOOGLE_CLIENT_ID',
  enableLogging: false
};
