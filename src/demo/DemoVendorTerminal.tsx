import React, { useState, useEffect } from "react";
import { 
  Store, 
  ChefHat, 
  PackageCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Smartphone, 
  Utensils, 
  Coins, 
  MapPin, 
  Phone, 
  Sparkles,
  Flame,
  Volume2
} from "lucide-react";
import { demoStore } from "./demoStore";
import { DEMO_SHOP, DEMO_CUSTOMER } from "./demoData";

interface DemoVendorTerminalProps {
  onSwitchToCustomer: () => void;
  triggerHaptic?: (pattern?: number | number[]) => void;
}

export const DemoVendorTerminal: React.FC<DemoVendorTerminalProps> = ({
  onSwitchToCustomer,
  triggerHaptic
}) => {
  const [demoState, setDemoState] = useState(demoStore.getState());
  const [prepCountdown, setPrepCountdown] = useState(12);

  useEffect(() => {
    const unsubscribe = demoStore.subscribe(() => {
      setDemoState(demoStore.getState());
    });
    return unsubscribe;
  }, []);

  const order = demoState.order;
  const status = order?.status || "pending";

  const handleAcceptOrder = () => {
    if (triggerHaptic) triggerHaptic(15);
    demoStore.updateOrderStatus("preparing");
  };

  const handleMarkReady = () => {
    if (triggerHaptic) triggerHaptic([20, 50, 20]);
    demoStore.updateOrderStatus("ready");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-16 pb-24 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Terminal Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500 shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {DEMO_SHOP.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                Live Kitchen KDS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              {DEMO_SHOP.address} • Terminal POS #1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToCustomer}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700/60 cursor-pointer shadow-sm"
          >
            <Smartphone className="w-4 h-4 text-orange-400" />
            <span>Switch to Customer App</span>
          </button>
        </div>
      </div>

      {/* Main Kitchen Order Area */}
      {!order ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ChefHat className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Active Orders on Kitchen Display</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Switch back to the Customer App to browse the menu and submit a simulated counter pickup order.
          </p>
          <button
            onClick={onSwitchToCustomer}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
          >
            Open Customer Menu
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Incoming Order Flash Card */}
          <div className="bg-slate-900 border-2 border-orange-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Bar of the Ticket */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl">
                  TICKET #{order.id}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Received Just Now
                </span>
              </div>

              {/* Order Status Badge */}
              <div>
                {status === "pending" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    NEW ORDER • AWAITING ACCEPTANCE
                  </span>
                )}
                {status === "preparing" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-black">
                    <Flame className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
                    PREPARING / GRILLING IN KITCHEN
                  </span>
                )}
                {status === "ready" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    PACKED & READY FOR PICKUP
                  </span>
                )}
              </div>
            </div>

            {/* Order Body Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-800">
              {/* Customer Info */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Customer & Handover
                </h4>
                <div className="space-y-1">
                  <p className="text-base font-black text-white">{order.customer_name}</p>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {order.phone}
                  </p>
                  <p className="text-xs font-bold text-orange-400 mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    🛍️ Counter Pickup
                  </p>
                </div>
              </div>

              {/* Items Detail */}
              <div className="md:col-span-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Kitchen Items to Prepare
                </h4>
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-orange-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {order.quantity}x
                        </span>
                        <h5 className="font-extrabold text-white text-base">
                          {order.product_name}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 pl-8">
                        Quarter Loaf • Golden Slap Chips • Russian Sausage • Spiced Beef Patty • Fried Egg • Double Cheddar • Mango Atchar
                      </p>
                      {order.notes && (
                        <p className="text-xs text-amber-300 font-semibold mt-2 pl-8 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                          Note: "{order.notes}"
                        </p>
                      )}
                    </div>
                    <span className="font-black text-white text-base shrink-0">
                      R {Number(order.total_price || order.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Collection Instructions */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>
                  Payment Status: <strong className="text-white">Pay on Collection (Cash or Speedpoint Card)</strong>
                </span>
              </div>
              <div className="text-slate-400">
                Amount to Collect: <strong className="text-emerald-400 text-sm">R {Number(order.total_price || 85).toFixed(2)}</strong>
              </div>
            </div>

            {/* Action Bar for Vendor Workflow */}
            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              {status === "pending" && (
                <button
                  onClick={handleAcceptOrder}
                  className="w-full sm:w-auto flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ChefHat className="w-5 h-5" />
                  <span>Accept Order & Start Preparing (Est. 12 min)</span>
                </button>
              )}

              {status === "preparing" && (
                <button
                  onClick={handleMarkReady}
                  className="w-full sm:w-auto flex-1 py-4 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-600/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PackageCheck className="w-5 h-5" />
                  <span>Mark Order Ready for Pickup 🛍️</span>
                </button>
              )}

              {status === "ready" && (
                <div className="w-full p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">Order is Ready for Customer Handover!</h4>
                      <p className="text-xs text-slate-400">
                        Customer has been notified to pick up at the Soweto Kota King counter.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onSwitchToCustomer}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
                  >
                    View Customer Screen →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
