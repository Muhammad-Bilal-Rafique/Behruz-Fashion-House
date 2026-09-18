import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Configurable sender and admin notification emails
function getFromEmail(): string {
  return process.env.EMAIL_FROM?.trim() || "Behruz Fashion House <onboarding@resend.dev>";
}

function getAdminEmail(): string {
  return (
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.ADMIN_GMAIL?.trim() ||
    "behruzfashionhouse@gmail.com"
  );
}

/**
 * Resolves the final recipient address.
 * In Resend's free tier without a verified domain, Resend strictly allows delivering
 * to the registered account email (bilalrafique2006@gmail.com).
 * Setting RESEND_TEST_RECIPIENT in .env.local routes all test emails safely to that inbox.
 */
function resolveRecipient(intendedRecipient: string): {
  finalRecipient: string;
  isTestOverride: boolean;
} {
  const testRecipient = process.env.RESEND_TEST_RECIPIENT?.trim();
  if (testRecipient) {
    return { finalRecipient: testRecipient, isTestOverride: true };
  }
  return { finalRecipient: intendedRecipient, isTestOverride: false };
}

interface OrderEmailData {
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
  pricing: {
    subtotal: number;
    shippingFee: number;
    shippingType?: string;
    total: number;
    advanceAmount: number;
    remainingAmount: number;
  };
  shipping: {
    deliveryEstimate?: string;
  };
  items: {
    name: string;
    size: string;
    quantity: number;
    price: number;
    itemTotal: number;
  }[];
}

/**
 * Common HTML wrapper with Behruz Fashion House branding
 * Strictly adheres to #FFFFFF and #FF3154 brand identity
 */
function emailTemplateWrapper(
  contentHtml: string,
  options?: { intendedRecipient?: string; isTestOverride?: boolean }
): string {
  const testBanner = options?.isTestOverride
    ? `
      <tr>
        <td style="background-color:#fff1f2;border-bottom:1px solid #ffe4e6;padding:9px 16px;font-size:11px;color:#FF3154;text-align:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
          <strong>[TEST MODE]</strong> Intended Recipient: <strong>${options.intendedRecipient || "Customer"}</strong> &bull; Delivered to testing inbox.
        </td>
      </tr>
    `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Behruz Fashion House</title>
</head>
<body style="margin:0;padding:0;background-color:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f9f9f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:2px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <!-- Top Accent Bar: Strictly Brand #FF3154 -->
          <tr>
            <td style="height:4px;background-color:#FF3154;"></td>
          </tr>
          ${testBanner}
          <!-- Brand Header -->
          <tr>
            <td align="center" style="padding:32px 24px 20px;border-bottom:1px solid #f3f4f6;">
              <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:3px;color:#FF3154;font-weight:600;margin-bottom:6px;">Luxury Pret &amp; Couture</span>
              <h1 style="margin:0;font-size:24px;font-weight:400;letter-spacing:1.5px;font-family:Georgia,serif;color:#111827;">BEHRUZ FASHION HOUSE</h1>
            </td>
          </tr>
          <!-- Main Content -->
          <tr>
            <td style="padding:32px 24px;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px;text-align:center;border-top:1px solid #f3f4f6;font-size:12px;color:#6b7280;line-height:1.6;">
              <p style="margin:0 0 6px;"><strong style="color:#111827;">Behruz Fashion House</strong></p>
              <p style="margin:0 0 10px;">Timeless Pakistani luxury fashion crafted for every occasion.</p>
              <p style="margin:0;font-size:11px;color:#9ca3af;">All exchange requests must be made within 2 days of delivery with original packaging and tags intact.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 1. Customer Email: Order Received / Awaiting Advance Payment
 */
export async function sendOrderPlacedCustomerEmail(order: OrderEmailData): Promise<void> {
  if (!resend || !order.customer.email) {
    return;
  }

  const { finalRecipient, isTestOverride } = resolveRecipient(order.customer.email);

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const waNumber = "923297121703";
    const waText = encodeURIComponent(
      `Hello Behruz Fashion House, I have placed Order #${order.orderNumber}. Here is my PKR ${order.pricing.advanceAmount.toLocaleString()} advance payment proof.`
    );
    const waLink = `https://wa.me/${waNumber}?text=${waText}`;
    const trackingLink = `${appUrl}/track-order`;

    const itemsHtml = order.items
      .map(
        (i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;">
            <strong>${i.name}</strong><br>
            <span style="font-size:11px;color:#6b7280;">Size: ${i.size} &bull; Qty: ${i.quantity}</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#111827;">
            PKR ${i.itemTotal.toLocaleString()}
          </td>
        </tr>
      `
      )
      .join("");

    const body = `
      <h2 style="font-size:18px;font-family:Georgia,serif;font-weight:400;margin:0 0 12px;color:#111827;">Thank You for Your Order, ${order.customer.name}!</h2>
      <p style="font-size:13px;line-height:1.6;color:#4b5563;margin:0 0 20px;">
        Your order <strong style="color:#111827;">#${order.orderNumber}</strong> has been placed. To confirm your booking and start tailoring/processing, a mandatory advance payment of <strong style="color:#FF3154;">PKR ${order.pricing.advanceAmount.toLocaleString()}</strong> is required.
      </p>

      <!-- Advance Payment Instructions Box -->
      <div style="background-color:#fff5f7;border:1px solid #ffe4e8;border-radius:2px;padding:18px;margin-bottom:24px;">
        <h3 style="margin:0 0 8px;font-size:12px;color:#FF3154;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Mandatory Advance Payment Instructions</h3>
        <p style="margin:0 0 14px;font-size:12px;color:#4b5563;line-height:1.6;">
          Please transfer <strong>PKR ${order.pricing.advanceAmount.toLocaleString()}</strong> via EasyPaisa, JazzCash, or Online Bank Transfer and share the payment receipt screenshot on WhatsApp with your Order Reference: <strong>#${order.orderNumber}</strong>.
        </p>
        <a href="${waLink}" style="display:inline-block;background-color:#FF3154;color:#ffffff;padding:11px 22px;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;border-radius:2px;">
          Send Receipt on WhatsApp &rarr;
        </a>
      </div>

      <!-- Order Summary -->
      <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#111827;margin:0 0 10px;font-weight:700;border-bottom:2px solid #111827;padding-bottom:6px;">Order Summary</h3>
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
        ${itemsHtml}
        <tr>
          <td style="padding:10px 0 4px;font-size:12px;color:#6b7280;">Subtotal</td>
          <td align="right" style="padding:10px 0 4px;font-size:12px;font-weight:500;color:#111827;">PKR ${order.pricing.subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:12px;color:#6b7280;">Shipping Fee</td>
          <td align="right" style="padding:4px 0;font-size:12px;font-weight:500;color:#111827;">${order.pricing.shippingFee > 0 ? `PKR ${order.pricing.shippingFee.toLocaleString()}` : "Free"}</td>
        </tr>
        <tr>
          <td style="padding:10px 0 4px;font-size:14px;font-weight:700;color:#111827;border-top:1px solid #111827;">Total Amount</td>
          <td align="right" style="padding:10px 0 4px;font-size:14px;font-weight:700;color:#111827;border-top:1px solid #111827;">PKR ${order.pricing.total.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding:6px 0 2px;font-size:12px;color:#FF3154;font-weight:600;">Advance Required</td>
          <td align="right" style="padding:6px 0 2px;font-size:12px;font-weight:700;color:#FF3154;">PKR ${order.pricing.advanceAmount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding:4px 0 0;font-size:12px;color:#6b7280;">Payable on Delivery (COD)</td>
          <td align="right" style="padding:4px 0 0;font-size:12px;font-weight:600;color:#111827;">PKR ${order.pricing.remainingAmount.toLocaleString()}</td>
        </tr>
      </table>

      <!-- Delivery Address -->
      <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#111827;margin:24px 0 8px;font-weight:700;">Shipping Information</h3>
      <p style="font-size:12px;color:#4b5563;line-height:1.6;margin:0 0 20px;">
        ${order.customer.address}, ${order.customer.city}, ${order.customer.province}, ${order.customer.country}<br>
        <strong>Recipient Phone:</strong> ${order.customer.phone}<br>
        <strong>Estimated Delivery:</strong> ${order.shipping.deliveryEstimate || "3–5 business days"}
      </p>

      <div style="text-align:left;margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6;">
        <a href="${trackingLink}" style="display:inline-block;background-color:#ffffff;border:1px solid #111827;color:#111827;padding:10px 20px;text-decoration:none;font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">
          Track Your Order
        </a>
      </div>
    `;

    const subjectPrefix = isTestOverride ? `[Test for ${order.customer.email}] ` : "";

    await resend.emails.send({
      from: getFromEmail(),
      to: finalRecipient,
      subject: `${subjectPrefix}Order Received #${order.orderNumber} — Behruz Fashion House`,
      html: emailTemplateWrapper(body, {
        intendedRecipient: order.customer.email,
        isTestOverride,
      }),
    });
  } catch (error) {
    console.error("Failed to send customer order placed email:", error);
  }
}

/**
 * 2. Admin Notification: New Order Placed
 */
export async function sendOrderPlacedAdminNotification(order: OrderEmailData): Promise<void> {
  if (!resend) return;

  const adminTarget = getAdminEmail();
  const { finalRecipient, isTestOverride } = resolveRecipient(adminTarget);

  try {
    const itemsList = order.items
      .map((i) => `&bull; ${i.name} (Size: ${i.size}, Qty: ${i.quantity}) &mdash; PKR ${i.itemTotal.toLocaleString()}`)
      .join("<br>");

    const body = `
      <h2 style="font-size:18px;font-family:Georgia,serif;font-weight:400;margin:0 0 12px;color:#111827;">New Order Received!</h2>
      <p style="font-size:13px;color:#4b5563;line-height:1.6;margin:0 0 16px;">
        A new customer order <strong style="color:#111827;">#${order.orderNumber}</strong> has been submitted on the store.
      </p>
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;padding:16px;font-size:12px;line-height:1.6;margin-bottom:20px;">
        <strong>Customer:</strong> ${order.customer.name}<br>
        <strong>Phone / WhatsApp:</strong> ${order.customer.phone}<br>
        <strong>Email:</strong> ${order.customer.email || "N/A"}<br>
        <strong>City/Province:</strong> ${order.customer.city}, ${order.customer.province}<br>
        <strong>Total Amount:</strong> PKR ${order.pricing.total.toLocaleString()}<br>
        <strong style="color:#FF3154;">Advance Required:</strong> PKR ${order.pricing.advanceAmount.toLocaleString()}<br>
        <strong>COD Remaining:</strong> PKR ${order.pricing.remainingAmount.toLocaleString()}<br>
        <br>
        <strong>Order Items:</strong><br>
        ${itemsList}
      </div>
      <p style="font-size:12px;color:#6b7280;margin:0;">
        Please verify the customer's PKR ${order.pricing.advanceAmount.toLocaleString()} advance payment screenshot on WhatsApp before confirming this order in the admin dashboard.
      </p>
    `;

    const subjectPrefix = isTestOverride ? `[Test Admin Alert] ` : "";

    await resend.emails.send({
      from: getFromEmail(),
      to: finalRecipient,
      subject: `${subjectPrefix}[New Order] #${order.orderNumber} - ${order.customer.name} (PKR ${order.pricing.total.toLocaleString()})`,
      html: emailTemplateWrapper(body, {
        intendedRecipient: adminTarget,
        isTestOverride,
      }),
    });
  } catch (error) {
    console.error("Failed to send admin order notification email:", error);
  }
}

/**
 * 3. Customer Email: Advance Payment Verified & Order Confirmed
 */
export async function sendOrderConfirmedEmail(order: OrderEmailData): Promise<void> {
  if (!resend || !order.customer.email) return;

  const { finalRecipient, isTestOverride } = resolveRecipient(order.customer.email);

  try {
    const body = `
      <h2 style="font-size:18px;font-family:Georgia,serif;font-weight:400;margin:0 0 12px;color:#111827;">Advance Payment Verified &mdash; Order Confirmed!</h2>
      <p style="font-size:13px;line-height:1.6;color:#4b5563;margin:0 0 16px;">
        Dear ${order.customer.name}, we have successfully verified your advance payment of <strong style="color:#FF3154;">PKR ${order.pricing.advanceAmount.toLocaleString()}</strong> for Order <strong style="color:#111827;">#${order.orderNumber}</strong>.
      </p>
      <p style="font-size:13px;line-height:1.6;color:#4b5563;margin:0 0 20px;">
        Your couture pieces are now officially confirmed and are being prepared/tailored with utmost precision. Remaining balance payable upon delivery (COD): <strong>PKR ${order.pricing.remainingAmount.toLocaleString()}</strong>.
      </p>
    `;

    const subjectPrefix = isTestOverride ? `[Test for ${order.customer.email}] ` : "";

    await resend.emails.send({
      from: getFromEmail(),
      to: finalRecipient,
      subject: `${subjectPrefix}Payment Verified & Order Confirmed #${order.orderNumber} — Behruz Fashion House`,
      html: emailTemplateWrapper(body, {
        intendedRecipient: order.customer.email,
        isTestOverride,
      }),
    });
  } catch (error) {
    console.error("Failed to send order confirmed email:", error);
  }
}

/**
 * 4. Customer Email: Order Dispatched
 */
export async function sendOrderDispatchedEmail(order: OrderEmailData): Promise<void> {
  if (!resend || !order.customer.email) return;

  const { finalRecipient, isTestOverride } = resolveRecipient(order.customer.email);

  try {
    const body = `
      <h2 style="font-size:18px;font-family:Georgia,serif;font-weight:400;margin:0 0 12px;color:#111827;">Your Order Has Been Dispatched!</h2>
      <p style="font-size:13px;line-height:1.6;color:#4b5563;margin:0 0 16px;">
        Dear ${order.customer.name}, your luxury order <strong style="color:#111827;">#${order.orderNumber}</strong> has been packaged and dispatched via our trusted courier partner.
      </p>
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;padding:16px;font-size:12px;line-height:1.6;margin-bottom:20px;">
        <strong>Estimated Delivery:</strong> ${order.shipping.deliveryEstimate || "3–5 business days"}<br>
        <strong>Payable upon Delivery (COD):</strong> PKR ${order.pricing.remainingAmount.toLocaleString()}<br>
        <strong>Shipping Address:</strong> ${order.customer.address}, ${order.customer.city}
      </div>
    `;

    const subjectPrefix = isTestOverride ? `[Test for ${order.customer.email}] ` : "";

    await resend.emails.send({
      from: getFromEmail(),
      to: finalRecipient,
      subject: `${subjectPrefix}Order Dispatched #${order.orderNumber} — Behruz Fashion House`,
      html: emailTemplateWrapper(body, {
        intendedRecipient: order.customer.email,
        isTestOverride,
      }),
    });
  } catch (error) {
    console.error("Failed to send order dispatched email:", error);
  }
}

/**
 * 5. Customer Email: Order Delivered
 */
export async function sendOrderDeliveredEmail(order: OrderEmailData): Promise<void> {
  if (!resend || !order.customer.email) return;

  const { finalRecipient, isTestOverride } = resolveRecipient(order.customer.email);

  try {
    const body = `
      <h2 style="font-size:18px;font-family:Georgia,serif;font-weight:400;margin:0 0 12px;color:#111827;">Your Order Has Been Delivered!</h2>
      <p style="font-size:13px;line-height:1.6;color:#4b5563;margin:0 0 16px;">
        Dear ${order.customer.name}, your order <strong style="color:#111827;">#${order.orderNumber}</strong> has been marked as delivered. We hope you enjoy wearing your new piece from Behruz Fashion House!
      </p>
      <p style="font-size:12px;line-height:1.6;color:#6b7280;margin:0 0 16px;">
        Need an exchange or size adjustment? Contact our WhatsApp team within 2 days of delivery with intact tags.
      </p>
    `;

    const subjectPrefix = isTestOverride ? `[Test for ${order.customer.email}] ` : "";

    await resend.emails.send({
      from: getFromEmail(),
      to: finalRecipient,
      subject: `${subjectPrefix}Order Delivered #${order.orderNumber} — Behruz Fashion House`,
      html: emailTemplateWrapper(body, {
        intendedRecipient: order.customer.email,
        isTestOverride,
      }),
    });
  } catch (error) {
    console.error("Failed to send order delivered email:", error);
  }
}

/**
 * 6. Customer Email: Order Cancelled
 */
export async function sendOrderCancelledEmail(order: OrderEmailData): Promise<void> {
  if (!resend || !order.customer.email) return;

  const { finalRecipient, isTestOverride } = resolveRecipient(order.customer.email);

  try {
    const body = `
      <h2 style="font-size:18px;font-family:Georgia,serif;font-weight:400;margin:0 0 12px;color:#111827;">Order Cancellation Notice</h2>
      <p style="font-size:13px;line-height:1.6;color:#4b5563;margin:0 0 16px;">
        Dear ${order.customer.name}, your order <strong style="color:#111827;">#${order.orderNumber}</strong> has been cancelled.
      </p>
      <p style="font-size:12px;line-height:1.6;color:#6b7280;margin:0;">
        If you have questions or believe this cancellation was in error, please connect with us on WhatsApp or reply directly to this email.
      </p>
    `;

    const subjectPrefix = isTestOverride ? `[Test for ${order.customer.email}] ` : "";

    await resend.emails.send({
      from: getFromEmail(),
      to: finalRecipient,
      subject: `${subjectPrefix}Order Cancelled #${order.orderNumber} — Behruz Fashion House`,
      html: emailTemplateWrapper(body, {
        intendedRecipient: order.customer.email,
        isTestOverride,
      }),
    });
  } catch (error) {
    console.error("Failed to send order cancelled email:", error);
  }
}

/**
 * 7. Contact Form Email: Message to Store Admin / Support
 */
export async function sendContactInquiryEmail(inquiry: {
  name: string;
  email: string;
  message: string;
}): Promise<boolean> {
  if (!resend) {
    console.log("Resend not configured. Contact inquiry logged:", inquiry);
    return true;
  }

  const adminTarget = getAdminEmail();
  const { finalRecipient, isTestOverride } = resolveRecipient(adminTarget);

  try {
    const body = `
      <h2 style="font-size:18px;font-family:Georgia,serif;font-weight:400;margin:0 0 12px;color:#111827;">New Customer Inquiry</h2>
      <p style="font-size:13px;color:#4b5563;line-height:1.6;margin:0 0 16px;">
        A customer has submitted a message via the Behruz Fashion House contact form:
      </p>
      <div style="background-color:#f9fafb;border:1px solid #e5e7eb;padding:16px;font-size:13px;line-height:1.6;margin-bottom:20px;">
        <strong>Customer Name:</strong> ${inquiry.name}<br>
        <strong>Email:</strong> ${inquiry.email}<br>
        <br>
        <strong>Message:</strong><br>
        ${inquiry.message.replace(/\n/g, "<br>")}
      </div>
    `;

    const subjectPrefix = isTestOverride ? `[Test Contact Form] ` : "";

    await resend.emails.send({
      from: getFromEmail(),
      to: finalRecipient,
      replyTo: inquiry.email,
      subject: `${subjectPrefix}[Contact Form] Message from ${inquiry.name}`,
      html: emailTemplateWrapper(body, {
        intendedRecipient: adminTarget,
        isTestOverride,
      }),
    });

    return true;
  } catch (error) {
    console.error("Failed to send contact inquiry email:", error);
    return false;
  }
}
