const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `
    const hasActiveOrders = orders.some((o) =>
      ["pending", "confirmed", "preparing", "ready"].includes(o.status) ||
      ["finding_rider", "rider_assigned", "picked_up"].includes(o.delivery_status || "")
    );
    const pollInterval = hasActiveOrders ? 8000 : 25000;

    // Dual sync polling loop
    const timer = setInterval(fetchOrders, pollInterval);

    // Reconcile immediately when window returns to foreground
    const handleReconcile = () => {
      fetchOrders();
    };
    window.addEventListener("localeats_force_reconcile", handleReconcile);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
      window.removeEventListener("localeats_force_reconcile", handleReconcile);
    };
  }, [session?.user?.id, shops, orders]);
`;

const replacement = `
    const hasActiveOrders = ordersRef.current.some((o) =>
      ["pending", "confirmed", "preparing", "ready"].includes(o.status) ||
      ["finding_rider", "rider_assigned", "picked_up"].includes(o.delivery_status || "")
    );
    const pollInterval = hasActiveOrders ? 8000 : 25000;

    // Dual sync polling loop
    const timer = setInterval(fetchOrders, pollInterval);

    // Reconcile immediately when window returns to foreground
    const handleReconcile = () => {
      fetchOrders();
    };
    window.addEventListener("localeats_force_reconcile", handleReconcile);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
      window.removeEventListener("localeats_force_reconcile", handleReconcile);
    };
  }, [session?.user?.id, shops]);
`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched App.tsx infinite loop");
