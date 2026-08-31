const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `
        // 1. Fetch from Shared Firestore Database (Merchant App)
        try {
          const fsOrders = await FirestoreService.getOrdersByUser(session.user.id);
          if (fsOrders && fsOrders.length > 0) {
            fetchedData = fsOrders;
          }
        } catch (fErr) {
          console.debug("[DualSync] Firestore orders fetch notice:", fErr);
        }

        // 2. Fetch from Supabase as fallback
        if (!fetchedData || fetchedData.length === 0) {
`;

const replacement = `
        // Fetch from Supabase
        if (!fetchedData || fetchedData.length === 0) {
`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched App.tsx");
