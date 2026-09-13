import React from "react";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ShieldCheck,
  XCircle,
} from "lucide-react";

// Status Badge formatting helper
export function getOrderStatusBadge(status: string) {
  switch (status) {
    case "awaiting_advance":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
          <Clock className="w-2.5 h-2.5 text-amber-600" />
          Awaiting Advance
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
          Confirmed
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-300">
          <Package className="w-2.5 h-2.5 text-blue-600" />
          Processing
        </span>
      );
    case "dispatched":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-300">
          <Truck className="w-2.5 h-2.5 text-purple-600" />
          Dispatched
        </span>
      );
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
          <ShieldCheck className="w-2.5 h-2.5 text-slate-600" />
          Delivered
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-300">
          <XCircle className="w-2.5 h-2.5 text-red-600" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-muted border border-border">
          {status}
        </span>
      );
  }
}

// Payment Status Badge formatting helper
export function getPaymentStatusBadge(status?: string) {
  switch (status) {
    case "verified":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Verified
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
          <XCircle className="w-2.5 h-2.5" />
          Rejected
        </span>
      );
    case "pending":
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-2.5 h-2.5" />
          Pending
        </span>
      );
  }
}

export function OrderStatusBadge({ status }: { status: string }) {
  return getOrderStatusBadge(status);
}

export function PaymentStatusBadge({ status }: { status?: string }) {
  return getPaymentStatusBadge(status);
}
