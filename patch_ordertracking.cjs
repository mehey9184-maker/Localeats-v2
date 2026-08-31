const fs = require('fs');
let code = fs.readFileSync('src/screens/OrderTrackingScreen.tsx', 'utf8');

const targetOrderListener = `
    activeOrders.forEach((order) => {
      // 1. Scoped Firestore order listener
      const unsubOrder = FirestoreService.listenToOrder(order.id, (updated) => {
        if (updated) {
          setLocalOrders((prev) =>
            prev.map((o) => (o.id === order.id ? { ...o, ...updated } : o))
          );
        }
      });
      unsubs.push(unsubOrder);

      // 2. Scoped Firestore rider GPS location listener when live delivery is active
`;

const replacementOrderListener = `
    // Set up Supabase realtime listener for orders
    const orderIds = activeOrders.map(o => String(o.id));
    if (orderIds.length > 0) {
      const channel = supabase
        .channel('realtime_active_orders')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.new && orderIds.includes(String(payload.new.id))) {
              setLocalOrders((prev) =>
                prev.map((o) => (String(o.id) === String(payload.new.id) ? { ...o, ...payload.new } : o))
              );
            }
          }
        )
        .subscribe();
        
      unsubs.push(() => {
        supabase.removeChannel(channel);
      });
    }

    activeOrders.forEach((order) => {
      // 1. Scoped Firestore rider GPS location listener when live delivery is active
`;

code = code.replace(targetOrderListener, replacementOrderListener);
fs.writeFileSync('src/screens/OrderTrackingScreen.tsx', code, 'utf8');
console.log("Patched OrderTrackingScreen.tsx");
