"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import { Loader2 } from "lucide-react";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: "awaiting_advance", label: "Awaiting Advance" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;
    const prevStatus = status;
    setStatus(newStatus);

    startTransition(async () => {
      try {
        const res = await updateOrderStatusAction(orderId, newStatus);
        if (res.success) {
          const readable = newStatus.replace(/_/g, " ").toUpperCase();
          toast.success(`Order status updated to ${readable}`, {
            description: "Customer and admin tracking have been updated.",
          });
          router.refresh();
        } else {
          setStatus(prevStatus);
          toast.error(res.error || "Failed to update order status.");
        }
      } catch (err) {
        setStatus(prevStatus);
        console.error("Order status update error:", err);
        toast.error("Network error updating order status.");
      }
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="text-xs font-semibold py-1.5 pl-2.5 pr-7 bg-background border border-border rounded-xs focus:border-primary focus:outline-hidden disabled:opacity-60 cursor-pointer transition-colors text-foreground"
        aria-label="Change order status"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {isPending && (
        <div className="absolute right-2 pointer-events-none">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
