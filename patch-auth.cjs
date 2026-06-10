const fs = require('fs');
const files = [
  'ClientForgotPassword.jsx',
  'ClientLogin.jsx',
  'ClientOtpVerification.jsx',
  'ClientRegister.jsx',
  'ClientResetPassword.jsx'
];
files.forEach(file => {
  const path = 'c:/Users/Windows/Documents/GitHub/MediTech/src/components/' + file;
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/minHeight:\s*'100vh',/, "minHeight: '100vh',\n      width: '100%',\n      flex: 1,");
  fs.writeFileSync(path, content);
});
console.log('Done!');
