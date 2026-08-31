const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/  if \(tokenRaw === 'test-token-123'\) \{\n    \(req as any\)\.user = \{ id: 'test_user_uuid' \};\n    return next\(\);\n  \}\n/g, '');

fs.writeFileSync('server.ts', code);
