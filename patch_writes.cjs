const fs = require('fs');
let code = fs.readFileSync('src/screens/OrderTrackingScreen.tsx', 'utf8');

// Replace Firestore saveOrder with fetch /api/orders patch
code = code.replace(/FirestoreService\.saveOrder\(\{ id: (.*?), \.\.\.updatePayload \}\)\.catch\(\(\) => \{\}\);/g, 'fetch(`/api/orders/${$1}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatePayload) }).catch(() => {});');
code = code.replace(/FirestoreService\.saveOrder\(\{ id: (.*?), status: "completed" \}\)\.catch\(\(\) => \{\}\);/g, 'fetch(`/api/orders/${$1}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed" }) }).catch(() => {});');
code = code.replace(/await FirestoreService\.saveOrder\(\{ id: (.*?), \.\.\.updatePayload \}\);/g, 'await fetch(`/api/orders/${$1}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatePayload) });');

fs.writeFileSync('src/screens/OrderTrackingScreen.tsx', code, 'utf8');
console.log("Patched OrderTrackingScreen writes");
