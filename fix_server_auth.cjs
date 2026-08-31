const fs = require('fs');
let serverTs = fs.readFileSync('server.ts', 'utf8');

if (!serverTs.includes("import * as admin from 'firebase-admin';")) {
  serverTs = serverTs.replace('import { createClient } from "@supabase/supabase-js";', 'import { createClient } from "@supabase/supabase-js";\nimport * as admin from "firebase-admin";\n\nif (!admin.apps.length) {\n  admin.initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || "localeats-5e26e" });\n}');
}

const authMwCode = `const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  const tokenRaw = authHeader.split(' ')[1];
  if (!tokenRaw) return res.status(401).json({ error: 'Invalid token format' });

  if (tokenRaw.startsWith('sb-')) {
    const token = tokenRaw.replace('sb-', '');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    (req as any).user = user;
    return next();
  } else if (tokenRaw.startsWith('fb-')) {
    const token = tokenRaw.replace('fb-', '');
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      (req as any).user = { id: decodedToken.uid };
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired Firebase token' });
    }
  } else {
    // Fallback to supabase for raw tokens
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(tokenRaw);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    (req as any).user = user;
    return next();
  }
};`;

serverTs = serverTs.replace(/const authenticateJWT = async[\s\S]*?};/m, authMwCode);

fs.writeFileSync('server.ts', serverTs);
