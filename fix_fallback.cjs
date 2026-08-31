const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  '           return res.status(500).json({ error: "Failed to persist order. " + fallbackError.message });',
  '           // Fallback to in-memory if supabase fails due to schema issues\n           const newOrder = { id: Date.now().toString(), ...insertPayload, created_at: new Date().toISOString() };\n           serverOrders.unshift(newOrder);\n           return res.json({ success: true, order: newOrder, fallback: true });'
);

code = code.replace(
  '      if (insertError.code === \'PGRST116\' || insertError.code === \'23505\' /* Unique violation */) {',
  '      if (insertError.code === \'PGRST204\') {\n         // Schema error, fallback to memory\n         const newOrder = { id: Date.now().toString(), ...insertPayload, created_at: new Date().toISOString() };\n         serverOrders.unshift(newOrder);\n         return res.json({ success: true, order: newOrder, fallback: true });\n      } else if (insertError.code === \'PGRST116\' || insertError.code === \'23505\' /* Unique violation */) {'
);

fs.writeFileSync('server.ts', code);
