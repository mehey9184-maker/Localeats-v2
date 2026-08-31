const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const fieldsToRemove = [
  'notes', 'delivery_instructions', 'customer_name', 'phone', 'email', 'address', 'city', 'lat', 'lng'
];

fieldsToRemove.forEach(f => {
  const reg = new RegExp(`^\\s*${f}:.*?,\\n`, 'gm');
  code = code.replace(reg, '');
});

fs.writeFileSync('server.ts', code);
