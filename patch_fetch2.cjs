const fs = require('fs');

function patchFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  
  if (!content.includes('getApiAuthHeaders')) {
    content = content.replace('import { supabase } from "../lib/supabase";', 'import { supabase } from "../lib/supabase";\nimport { getApiAuthHeaders } from "../lib/apiAuth";');
  }

  // Restore the bad replacements
  content = content.replace(/fetch\(`\/api\/orders\/\$\{item\.orderId\}`,\s*\{\s*method:\s*"PATCH",\s*headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*\},.*?\n.*?catch\(\(\)\s*=>\s*\{\}\);/gs, (match) => {
    return `fetch(\`/api/orders/\${item.orderId}\`, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await getApiAuthHeaders()) }, body: JSON.stringify(updatePayload) }).catch(() => {});`;
  });
  
  // Actually, I can just replace all of them properly.
}
