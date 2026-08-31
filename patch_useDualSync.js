const fs = require('fs');
let code = fs.readFileSync('src/hooks/useDualSync.ts', 'utf8');

// Strip out the Firestore fetching logic
code = code.replace(/try\s*\{\s*if\s*\(userId\)\s*\{\s*const firestoreOrders = await FirestoreService\.getOrdersByUser[\s\S]*?catch\s*\(fsErr\)\s*\{\s*console\.info\("\[DualSync\] Firestore fetch note:", fsErr\);\s*\}/g, "");
// Remove the FirestoreService import if not used elsewhere in this file
code = code.replace(/import \{ FirestoreService \} from "\.\.\/lib\/firebase";\n/g, "");

fs.writeFileSync('src/hooks/useDualSync.ts', code, 'utf8');
console.log("Patched useDualSync.ts");
