const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const fieldsToRemove = [
  'is_delivery', 'payment_method'
];

fieldsToRemove.forEach(f => {
  const reg = new RegExp(`^\\s*${f}:.*?,\\n`, 'gm');
  code = code.replace(reg, '');
});

fs.writeFileSync('server.ts', code);
