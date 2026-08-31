const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/      notes: items\.map.*?\n/g, '');
code = code.replace(/      delivery_instructions: customer_details\?.delivery_instructions \|\| "",\n/g, '');
// Let's also check if customer_name, customer_phone, delivery_address, delivery_coordinates exist. 
// If they don't, it will throw.
// It's safer to catch 'Could not find the ... column' and retry without them, or just use a minimal payload and see what works.

fs.writeFileSync('server.ts', code);
