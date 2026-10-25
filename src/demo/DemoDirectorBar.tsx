import React, { useEffect, useState } from "react";
import { 
  Clapperboard, 
  Smartphone, 
  Store, 
  RotateCcw, 
  X, 
  ChefHat, 
  ShoppingBag, 
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { demoStore, DemoRole } from "./demoStore";

interface DemoDirectorBarProps {
  onRoleChange: (role: DemoRole) => void;
  onReset: () => void;
  onExit: () => void;
}

export const DemoDirectorBar: React.FC<DemoDirectorBarProps> = ({
  onRoleChange,
  onReset,
  onExit
}) => {
  const [demoState, setDemoState] = useState(demoStore.getState());

  useEffect(() => {
    const unsubscribe = demoStore.subscribe(() => {
      setDemoState(demoStore.getState());
    });
    return unsubscribe;
  }, []);

  const orderStatus = demoState.order?.status;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-slate-950/95 text-white border-b border-orange-500/40 backdrop-blur-md px-3 py-2 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand badge & current phase */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg text-white font-black text-[11px] uppercase tracking-wider shadow-sm">
            <Clapperboard className="w-3.5 h-3.5 animate-pulse" />
            <span>Promo Demo</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-500">•</span>
            {orderStatus ? (
              <span className="flex items-center gap-1 font-bold text-amber-400">
                {orderStatus === "pending" && "Order Placed (Waiting Acceptance)"}
                {orderStatus === "preparing" && "Kitchen Grilling (Preparing)"}
                {orderStatus === "ready" && "Ready for Customer Pickup! 🎉"}
              </span>
            ) : (
              <span className="text-slate-400 font-medium">Customer Ordering Phase</span>
            )}
          </div>
        </div>

        {/* Center: Dual Role Switcher (The core tool for video recording) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
          <button
            onClick={() => onRoleChange("customer")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              demoState.role === "customer"
                ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Switch to Customer App View"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Customer App</span>
          </button>

          <button
            onClick={() => onRoleChange("vendor")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
              demoState.role === "vendor"
                ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Switch to Vendor Kitchen Terminal"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Kitchen Terminal</span>
            {orderStatus === "pending" && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>

        {/* Right: Quick Reset (Restart Take) & Exit */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            title="Reset to Step 1 (Restart Video Take)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Take</span>
          </button>

          <button
            onClick={onExit}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Exit Demo Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
