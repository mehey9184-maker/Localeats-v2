const fs = require('fs');

function patchFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  
  if (!content.includes('getApiAuthHeaders')) {
    content = content.replace('import { supabase } from "../lib/supabase";', 'import { supabase } from "../lib/supabase";\nimport { getApiAuthHeaders } from "../lib/apiAuth";');
  }

  content = content.replace(
    /fetch\(\s*(`\/api\/orders\/\$\{.*?\}\`|`\/api\/orders\?.*?\`|'\/api\/orders.*?')\s*,\s*\{(.*?)\}\)/gs,
    'fetch($1, { $2, headers: { ...(($2.headers) || {}), ...(await getApiAuthHeaders()) } })'
  );

  content = content.replace(
    /fetch\(\s*(`\/api\/orders\/\$\{.*?\}\`|`\/api\/orders\?.*?\`|'\/api\/orders.*?')\s*\)/gs,
    'fetch($1, { headers: await getApiAuthHeaders() })'
  );

  fs.writeFileSync(path, content);
}

patchFile('src/screens/OrderTrackingScreen.tsx');
