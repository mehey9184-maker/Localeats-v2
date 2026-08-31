const fs = require('fs');

let content = fs.readFileSync('src/screens/OrderTrackingScreen.tsx', 'utf8');

content = content.replace(/fetch\(`\/api\/orders\/\$\{item\.orderId\}`,\s*\{\s*method:\s*"PATCH".*?catch\(\(\)\s*=>\s*\{\}\);/g, 
  'fetch(`/api/orders/${item.orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await getApiAuthHeaders()) }, body: JSON.stringify(updatePayload) }).catch(() => {});'
);

content = content.replace(/fetch\(`\/api\/orders\/\$\{orderId\}`,\s*\{\s*method:\s*"PATCH".*?status:\s*"completed".*?catch\(\(\)\s*=>\s*\{\}\);/gs, 
  'fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await getApiAuthHeaders()) }, body: JSON.stringify({ status: "completed" }) }).catch(() => {});'
);

content = content.replace(/await fetch\(`\/api\/orders\/\$\{orderId\}`,\s*\{\s*method:\s*"PATCH".*?JSON\.stringify\(updatePayload\).*?await getApiAuthHeaders\(\)\s*\}\s*\};\s*/gs, 
  'await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await getApiAuthHeaders()) }, body: JSON.stringify(updatePayload) });\n'
);

// Specifically replace the one inside the try block at 1073
content = content.replace(/await fetch\(`\/api\/orders\/\$\{orderId\}`,\s*\{\s*method:\s*"PATCH",\s*headers:\s*\{\s*"Content-Type":\s*"application\/json",\s*\.\.\.\(await getApiAuthHeaders\(\)\)\s*\},.*?\}\s*\);\n/gs,
  'await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await getApiAuthHeaders()) }, body: JSON.stringify(updatePayload) });\n'
);

fs.writeFileSync('src/screens/OrderTrackingScreen.tsx', content);
