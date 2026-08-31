const fs = require('fs');

function patchFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  
  if (!content.includes('getApiAuthHeaders')) {
    content = content.replace('import { supabase } from "../lib/supabase";', 'import { supabase } from "../lib/supabase";\nimport { getApiAuthHeaders } from "../lib/apiAuth";');
  }

  content = content.replace(/fetch\(\s*(`.*?`|'.*?')\s*,\s*\{\s*method:\s*"PATCH",\s*headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*\}/gs, 
    'fetch($1, { method: "PATCH", headers: { "Content-Type": "application/json", ...(await getApiAuthHeaders()) }'
  );
  
  content = content.replace(/fetch\(\s*(`.*?`|'.*?')\s*,\s*\{\s*method:\s*'POST',\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\}/gs, 
    'fetch($1, { method: "POST", headers: { "Content-Type": "application/json", ...(await getApiAuthHeaders()) }'
  );

  content = content.replace(/fetch\(\s*(`.*?`)\s*\)\.catch\(\(\)\s*=>\s*null\)/gs, 
    'fetch($1, { headers: await getApiAuthHeaders() }).catch(() => null)'
  );

  fs.writeFileSync(path, content);
}

patchFile('src/hooks/useOfflineSync.ts');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('getApiAuthHeaders')) {
  appContent = appContent.replace('import { supabase } from "./lib/supabase";', 'import { supabase } from "./lib/supabase";\nimport { getApiAuthHeaders } from "./lib/apiAuth";');
}
appContent = appContent.replace(/fetch\(\s*(`.*?`|'.*?')\s*,\s*\{\s*method:\s*"POST",\s*headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*\}/gs, 
  'fetch($1, { method: "POST", headers: { "Content-Type": "application/json", ...(await getApiAuthHeaders()) }'
);
appContent = appContent.replace(/fetch\(\s*(`.*?`)\s*\)\.catch\(\(\)\s*=>\s*null\)/gs, 
  'fetch($1, { headers: await getApiAuthHeaders() }).catch(() => null)'
);
fs.writeFileSync('src/App.tsx', appContent);
