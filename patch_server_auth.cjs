const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const authMiddleware = `
// Authentication Middleware
const authenticateJWT = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Auth misconfigured" });
    }
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: "Internal error verifying token" });
  }
};
`;

if (!content.includes('const authenticateJWT')) {
  content = content.replace('// API Endpoint for resilient Profile Sync', authMiddleware + '\n// API Endpoint for resilient Profile Sync');
  fs.writeFileSync('server.ts', content, 'utf8');
}
