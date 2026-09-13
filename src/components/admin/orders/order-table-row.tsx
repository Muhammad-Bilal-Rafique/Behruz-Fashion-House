"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  ShieldCheck,
  XCircle,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VerifyAdvanceDialog } from "./verify-advance-dialog";
import { DeleteOrderDialog } from "./delete-order-dialog";
import {
  verifyAdvancePaymentAction,
  deleteOrderAction,
} from "@/app/admin/orders/actions";

export interface SerializedOrderItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
  itemTotal: number;
}

export interface SerializedOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    country: string;
    province: string;
    city: string;
    address: string;
  };
  items: SerializedOrderItem[];
  pricing: {
    subtotal: number;
    shippingFee: number;
    shippingType: string;
    total: number;
    advanceAmount: number;
    remainingAmount: number;
  };
  shipping: {
    country: string;
    province: string;
    deliveryEstimate: string;
    status: string;
  };
  payment: {
    method: string;
    status: "pending" | "verified" | "rejected";
    advanceAmount: number;
    advancePaymentStatus: "pending" | "verified" | "rejected";
    verifiedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
  };
  orderStatus:
    | "awaiting_advance"
    | "confirmed"
    | "processing"
    | "dispatched"
    | "delivered"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface OrderTableRowProps {
  order: SerializedOrder;
}

import {
  getOrderStatusBadge,
  getPaymentStatusBadge,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./order-badges";

export {
  getOrderStatusBadge,
  getPaymentStatusBadge,
  OrderStatusBadge,
  PaymentStatusBadge,
};

/**
 * Desktop Table Row: Pure <tr> element designed strictly for placement inside <tbody>
 */
export function OrderTableRow({ order }: OrderTableRowProps) {
  const router = useRouter();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmVerify = async () => {
    try {
      setIsVerifying(true);
      const res = await verifyAdvancePaymentAction(order._id);
      if (res.success) {
        toast.success(`Advance payment verified for #${order.orderNumber}!`, {
          description: "Order status has been updated to Confirmed.",
        });
        setIsVerifyModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to verify advance payment.");
      }
    } catch (err) {
      console.error("Verify advance error:", err);
      toast.error("Network error during payment verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteOrderAction(order._id);
      if (res.success) {
        toast.success(`Order #${order.orderNumber} deleted successfully.`);
        setIsDeleteModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete order.");
      }
    } catch (err) {
      console.error("Delete order error:", err);
      toast.error("Network error during order deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isAwaitingAdvance =
    order.orderStatus === "awaiting_advance" || order.payment?.status === "pending";

  const isDeletable =
    order.orderStatus === "cancelled" ||
    order.orderStatus === "delivered" ||
    (order.orderStatus as string) === "rejected" ||
    order.payment?.status === "rejected" ||
    order.payment?.advancePaymentStatus === "rejected";

  const advanceAmount = order.pricing?.advanceAmount || order.payment?.advanceAmount || 1000;
  const paymentStatus = order.payment?.status || "pending";

  const firstItem = order.items?.[0];
  const moreItemsCount = (order.items?.length || 0) - 1;

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <tr
      className={`transition-colors hover:bg-muted/30 ${
        isAwaitingAdvance ? "bg-amber-500/[0.02]" : ""
      }`}
    >
      {/* Order Column */}
      <td className="py-3.5 px-4 align-middle">
        <Link
          href={`/admin/orders/${order._id}`}
          className="font-mono font-bold text-foreground hover:text-primary transition-colors block text-xs"
        >
          #{order.orderNumber}
        </Link>
      </td>

      {/* Customer Column */}
      <td className="py-3.5 px-4 align-middle">
        <span className="font-semibold text-foreground block text-xs truncate max-w-[180px]">
          {order.customer?.name}
        </span>
        <span className="text-[11px] text-muted-foreground block font-mono">
          {order.customer?.phone}
        </span>
      </td>

      {/* Items Column */}
      <td className="py-3.5 px-4 align-middle text-xs">
        {firstItem ? (
          <div>
            <span className="font-medium text-foreground block truncate max-w-[160px]">
              {firstItem.name} <span className="text-muted-foreground">× {firstItem.quantity}</span>
            </span>
            {moreItemsCount > 0 && (
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                +{moreItemsCount} more item{moreItemsCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground italic">No items</span>
        )}
      </td>

      {/* Total Column */}
      <td className="py-3.5 px-4 align-middle font-sans font-bold text-foreground tabular-nums text-xs whitespace-nowrap">
        PKR {(order.pricing?.total || 0).toLocaleString()}
      </td>

      {/* Advance Column */}
      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
        <div className="space-y-0.5">
          <span className="font-sans font-semibold text-foreground block text-xs tabular-nums">
            PKR {advanceAmount.toLocaleString()}
          </span>
          {getPaymentStatusBadge(paymentStatus)}
        </div>
      </td>

      {/* Order Status Column */}
      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
        {getOrderStatusBadge(order.orderStatus)}
      </td>

      {/* Date Column */}
      <td className="py-3.5 px-4 align-middle text-[11px] text-muted-foreground whitespace-nowrap">
        {formattedDate}
      </td>

      {/* Actions Column */}
      <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          {/* Quick Verify button if awaiting advance */}
          {paymentStatus === "pending" && (
            <Button
              size="sm"
              onClick={() => setIsVerifyModalOpen(true)}
              className="h-7 px-2.5 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs shadow-2xs gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Verify</span>
            </Button>
          )}

          {/* View Order Detail Button */}
          <Link href={`/admin/orders/${order._id}`}>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-[11px] font-medium border-border hover:border-primary text-foreground rounded-xs gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </Button>
          </Link>

          {/* Delete Order Button (if cancelled, rejected, or delivered) */}
          {isDeletable && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(true)}
              className="h-7 px-2 text-[11px] font-medium border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-xs gap-1 cursor-pointer"
              title="Delete Order"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </Button>
          )}
        </div>

        {/* Confirmation Dialog for Verifying Advance */}
        <VerifyAdvanceDialog
          isOpen={isVerifyModalOpen}
          orderNumber={order.orderNumber}
          customerName={order.customer?.name}
          advanceAmount={advanceAmount}
          isLoading={isVerifying}
          onConfirm={handleConfirmVerify}
          onClose={() => setIsVerifyModalOpen(false)}
        />

        {/* Confirmation Dialog for Deleting Order */}
        <DeleteOrderDialog
          isOpen={isDeleteModalOpen}
          orderNumber={order.orderNumber}
          isLoading={isDeleting}
          onConfirm={handleDeleteOrder}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      </td>
    </tr>
  );
}

/**
 * Mobile Order Card: Standalone card designed for mobile stacked layouts (not inside <table>)
 */
export function OrderMobileCard({ order }: OrderTableRowProps) {
  const router = useRouter();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmVerify = async () => {
    try {
      setIsVerifying(true);
      const res = await verifyAdvancePaymentAction(order._id);
      if (res.success) {
        toast.success(`Advance payment verified for #${order.orderNumber}!`, {
          description: "Order status has been updated to Confirmed.",
        });
        setIsVerifyModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to verify advance payment.");
      }
    } catch (err) {
      console.error("Verify advance error:", err);
      toast.error("Network error during payment verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteOrderAction(order._id);
      if (res.success) {
        toast.success(`Order #${order.orderNumber} deleted successfully.`);
        setIsDeleteModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete order.");
      }
    } catch (err) {
      console.error("Delete order error:", err);
      toast.error("Network error during order deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isAwaitingAdvance =
    order.orderStatus === "awaiting_advance" || order.payment?.status === "pending";

  const isDeletable =
    order.orderStatus === "cancelled" ||
    order.orderStatus === "delivered" ||
    (order.orderStatus as string) === "rejected" ||
    order.payment?.status === "rejected" ||
    order.payment?.advancePaymentStatus === "rejected";

  const advanceAmount = order.pricing?.advanceAmount || order.payment?.advanceAmount || 1000;
  const paymentStatus = order.payment?.status || "pending";
  const firstItem = order.items?.[0];
  const moreItemsCount = (order.items?.length || 0) - 1;
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-card border border-border rounded-xs p-4 space-y-3 shadow-2xs">
      {/* Header: Order Ref & Status */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
        <Link
          href={`/admin/orders/${order._id}`}
          className="font-mono font-bold text-foreground text-sm hover:text-primary transition-colors"
        >
          #{order.orderNumber}
        </Link>
        <div>{getOrderStatusBadge(order.orderStatus)}</div>
      </div>

      {/* Customer & Items */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
            Customer
          </span>
          <span className="font-semibold text-foreground block truncate">
            {order.customer?.name}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono block">
            {order.customer?.phone}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
            Items
          </span>
          {firstItem ? (
            <span className="font-medium text-foreground block truncate">
              {firstItem.name} × {firstItem.quantity}
              {moreItemsCount > 0 ? ` (+${moreItemsCount})` : ""}
            </span>
          ) : (
            <span className="text-muted-foreground italic">No items</span>
          )}
          <span className="text-[11px] text-muted-foreground block">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Financials Row: Total & Advance */}
      <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xs border border-border/80 text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
            Order Total
          </span>
          <span className="font-sans font-bold text-foreground tabular-nums">
            PKR {(order.pricing?.total || 0).toLocaleString()}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
            Advance (PKR {advanceAmount.toLocaleString()})
          </span>
          <div className="mt-0.5">{getPaymentStatusBadge(paymentStatus)}</div>
        </div>
      </div>

      {/* Actions Button Row */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {paymentStatus === "pending" && (
          <Button
            size="sm"
            onClick={() => setIsVerifyModalOpen(true)}
            className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs shadow-xs gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verify Advance</span>
          </Button>
        )}

        <Link href={`/admin/orders/${order._id}`} className="flex-1 sm:flex-none">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 px-3 text-xs font-medium border-border hover:border-primary text-foreground rounded-xs gap-1.5 cursor-pointer justify-center"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Order</span>
          </Button>
        </Link>

        {isDeletable && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDeleteModalOpen(true)}
            className="h-8 px-3 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-xs gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        )}
      </div>

      {/* Confirmation Dialog for Verifying Advance */}
      <VerifyAdvanceDialog
        isOpen={isVerifyModalOpen}
        orderNumber={order.orderNumber}
        customerName={order.customer?.name}
        advanceAmount={advanceAmount}
        isLoading={isVerifying}
        onConfirm={handleConfirmVerify}
        onClose={() => setIsVerifyModalOpen(false)}
      />

      {/* Confirmation Dialog for Deleting Order */}
      <DeleteOrderDialog
        isOpen={isDeleteModalOpen}
        orderNumber={order.orderNumber}
        isLoading={isDeleting}
        onConfirm={handleDeleteOrder}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
