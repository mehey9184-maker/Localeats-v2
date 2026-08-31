const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/  admin\.initializeApp\(\{ projectId: process\.env\.VITE_FIREBASE_PROJECT_ID \|\| "localeats-5e26e" \}\);\n\}\n/, '');
fs.writeFileSync('server.ts', code);
