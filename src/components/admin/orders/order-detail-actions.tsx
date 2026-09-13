"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VerifyAdvanceDialog } from "./verify-advance-dialog";
import { RejectAdvanceDialog } from "./reject-advance-dialog";
import { DeleteOrderDialog } from "./delete-order-dialog";
import { OrderStatusSelect } from "./order-status-select";
import {
  verifyAdvancePaymentAction,
  rejectAdvancePaymentAction,
  deleteOrderAction,
} from "@/app/admin/orders/actions";

interface OrderDetailActionsProps {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  advanceAmount: number;
  paymentStatus: "pending" | "verified" | "rejected";
  orderStatus: string;
}

export function OrderDetailActions({
  orderId,
  orderNumber,
  customerName,
  customerPhone,
  advanceAmount,
  paymentStatus,
  orderStatus,
}: OrderDetailActionsProps) {
  const router = useRouter();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format Pakistani / international phone for WhatsApp URL (wa.me requires numbers only)
  const cleanPhone = customerPhone.replace(/\D/g, "");
  // If local Pakistani number starting with 03..., convert to 923...
  const formattedWhatsAppNumber = cleanPhone.startsWith("0")
    ? `92${cleanPhone.slice(1)}`
    : cleanPhone.startsWith("92")
    ? cleanPhone
    : `92${cleanPhone}`;

  const whatsAppMessage =
    `Assalamualaikum ${customerName},\n\n` +
    `Regarding your Behruz Fashion House order #${orderNumber}.\n\n` +
    `We are contacting you from the Behruz customer support team to assist you with your order.`;

  const whatsAppUrl = `https://wa.me/${formattedWhatsAppNumber}?text=${encodeURIComponent(whatsAppMessage)}`;

  const isDeletable =
    orderStatus === "cancelled" ||
    orderStatus === "delivered" ||
    orderStatus === "rejected" ||
    paymentStatus === "rejected";

  const handleConfirmVerify = async () => {
    try {
      setIsActionLoading(true);
      const res = await verifyAdvancePaymentAction(orderId);
      if (res.success) {
        toast.success(`Advance payment verified for #${orderNumber}!`, {
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
      setIsActionLoading(false);
    }
  };

  const handleConfirmReject = async (reason: string) => {
    try {
      setIsActionLoading(true);
      const res = await rejectAdvancePaymentAction(orderId, reason);
      if (res.success) {
        toast.warning(`Advance payment marked as rejected for #${orderNumber}.`, {
          description: reason ? `Reason: "${reason}"` : undefined,
        });
        setIsRejectModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to reject payment.");
      }
    } catch (err) {
      console.error("Reject advance error:", err);
      toast.error("Network error during payment rejection.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteOrderAction(orderId);
      if (res.success) {
        toast.success(`Order #${orderNumber} deleted successfully.`);
        router.push("/admin/orders");
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

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Verify Advance Button (if payment pending) */}
      {paymentStatus === "pending" && (
        <Button
          size="sm"
          onClick={() => setIsVerifyModalOpen(true)}
          className="h-9 px-3.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs shadow-xs gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verify Advance</span>
        </Button>
      )}

      {/* Reject Payment Button (if payment pending) */}
      {paymentStatus === "pending" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsRejectModalOpen(true)}
          className="h-9 px-3 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 rounded-xs gap-1.5 cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Reject Payment</span>
        </Button>
      )}

      {/* Delete Order Button (if order is cancelled, rejected, or delivered) */}
      {isDeletable && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsDeleteModalOpen(true)}
          className="h-9 px-3 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-xs gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Order</span>
        </Button>
      )}

      {/* WhatsApp Contact Action */}
      {customerPhone && (
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button
            size="sm"
            variant="outline"
            className="h-9 px-3 text-xs font-medium border-emerald-300 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100 rounded-xs gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Contact on WhatsApp</span>
            <ExternalLink className="w-3 h-3 text-emerald-600" />
          </Button>
        </a>
      )}

      {/* Order Status Select Dropdown */}
      <div className="flex items-center gap-1.5 ml-auto">
        <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
          Order Status:
        </span>
        <OrderStatusSelect orderId={orderId} currentStatus={orderStatus} />
      </div>

      {/* Verification Dialog */}
      <VerifyAdvanceDialog
        isOpen={isVerifyModalOpen}
        orderNumber={orderNumber}
        customerName={customerName}
        advanceAmount={advanceAmount}
        isLoading={isActionLoading}
        onConfirm={handleConfirmVerify}
        onClose={() => setIsVerifyModalOpen(false)}
      />

      {/* Rejection Dialog */}
      <RejectAdvanceDialog
        isOpen={isRejectModalOpen}
        orderNumber={orderNumber}
        customerName={customerName}
        isLoading={isActionLoading}
        onConfirm={handleConfirmReject}
        onClose={() => setIsRejectModalOpen(false)}
      />

      {/* Deletion Dialog */}
      <DeleteOrderDialog
        isOpen={isDeleteModalOpen}
        orderNumber={orderNumber}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
