// import express from "express";
// import Stripe from "stripe";
// import PaymentDone from "../models/PaymentDone.js";
// import config from "../config/config.js";
// import Subscription from "../models/Subscription.js";
// import PurchaseNumber from "../models/PurchaseNumber.js";


// const stripe = new Stripe(config.STRIPE_SECRET_KEY);
// const endpointSecret = config.STRIPE_WEBHOOK_SECRET;
// const webhookHandler = express.Router();

// webhookHandler.post("/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret, {
//       tolerance: 600
//     });
//     console.log("✅ Webhook event received:", event.type);
//   } catch(err) {
//     console.error("❌ Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   try {
//     switch(event.type) {
//       case "checkout.session.completed":
//         await handleCheckoutSessionCompleted(event.data.object);
//         break;
//       case "customer.subscription.updated":
//         await handleSubscriptionUpdated(event.data.object);
//         break;
//       case "customer.subscription.deleted":
//         await handleSubscriptionDeleted(event.data.object);
//         break;
//       case "invoice.payment_succeeded":
//         await handleInvoicePaymentSucceeded(event.data.object);
//         break;
//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }
//     res.json({ received: true });
//   } catch(error) {
//     console.error("❌ Error processing webhook:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// async function handleCheckoutSessionCompleted(session) {
//   if(session.payment_status === "paid") {
//     const isPhoneNumberPayment = session.metadata?.type === "number";

//     const customerDetails = session.customer_details || {};

//     const newPayment = new PaymentDone({
//       user_id: session.metadata?.user_id || null,
//       plan_id: isPhoneNumberPayment ? null : session.metadata?.plan_id || null,
//       stripeCustomerId: session.customer,
//       stripeSubscriptionId: session.subscription || null,
//       stripeSessionId: session.id,
//       email: customerDetails.email || "",
//       name: customerDetails.name || "",
//       amount_total: session.amount_total,
//       currency: session.currency,
//       payment_status: session.payment_status,
//       invoice: session.invoice,
//       created: new Date(session.created * 1000),
//       expires_at: session.expires_at ? new Date(session.expires_at * 1000) : null,
//       payment_type: session.mode
//     });

//     await newPayment.save();
//   }
// }

// async function handleSubscriptionUpdated(subscription) {
//   const paymentUpdate = {
//     stripeSubscriptionId: subscription.id,
//     payment_status: subscription.status,
//     current_period_end: new Date(subscription.current_period_end * 1000),
//     current_period_start: new Date(subscription.current_period_start * 1000),
//     cancel_at_period_end: subscription.cancel_at_period_end,
//     status: subscription.status
//   };

//   const paymentRecord = await PaymentDone.findOneAndUpdate(
//     {
//       stripeCustomerId: subscription.customer,
//       stripeSubscriptionId: subscription.id
//     },
//     { $set: paymentUpdate },
//     { upsert: true, new: true, sort: { createdAt: -1 } }
//   );

//   if(paymentRecord?.user_id && paymentRecord?.plan_id) {
//     await Subscription.findOneAndUpdate(
//       { user_id: paymentRecord.user_id },
//       {
//         $set: {
//           plan_id: paymentRecord.plan_id,
//           startDate: new Date(subscription.current_period_start * 1000),
//           endDate: new Date(subscription.current_period_end * 1000),
//           isActive: subscription.status === "active",
//           updatedAt: new Date()
//         },
//         $setOnInsert: {
//           user_id: paymentRecord.user_id
//         }
//       },
//       { new: true, upsert: true, includeResultMetadata: true }
//     );
//   }
// }

// async function handleSubscriptionDeleted(subscription) {
//   await PaymentDone.findOneAndUpdate(
//     {
//       stripeCustomerId: subscription.customer,
//       stripeSubscriptionId: subscription.id
//     },
//     {
//       $set: {
//         payment_status: "cancelled",
//         status: "cancelled",
//         updatedAt: new Date()
//       }
//     }
//   );

//   const paymentRecord = await PaymentDone.findOne({
//     stripeCustomerId: subscription.customer,
//     stripeSubscriptionId: subscription.id
//   });

//   if(paymentRecord?.user_id) {
//     await Subscription.findOneAndUpdate(
//       { user_id: paymentRecord.user_id },
//       {
//         $set: {
//           isActive: false,
//           endDate: new Date(),
//           updatedAt: new Date()
//         }
//       },
//       { new: true, includeResultMetadata: true }
//     );
//   }
// }

// async function handleInvoicePaymentSucceeded(invoice) {
//   console.log("✅ Invoice Payment Succeeded",invoice);

//   const paymentUpdate = {
//     stripeInvoiceId: invoice.id,
//     amount_paid: invoice.amount_paid,
//     currency: invoice.currency,
//     payment_status: "paid",
//     paid_at: new Date(invoice.status_transitions.paid_at * 1000),
//     period_start: new Date(invoice.period_start * 1000),
//     period_end: new Date(invoice.period_end * 1000),
//     subscription_status: invoice.subscription ? "active" : "none",
//     billing_reason: invoice.billing_reason,
//     hosted_invoice_url: invoice.hosted_invoice_url
//   };

//   const paymentRecord = await PaymentDone.findOneAndUpdate(
//     {
//       stripeCustomerId: invoice.customer,
//       stripeSubscriptionId: invoice.subscription
//     },
//     { $set: paymentUpdate },
//     { upsert: true, new: true }
//   );
//   if (
//     invoice.subscription &&
//     invoice.billing_reason === 'subscription_cycle' &&
//     paymentRecord?.user_id
//   ) {
//     const newStartDate = new Date(invoice.period_start * 1000);
//     const newEndDate = new Date(invoice.period_end * 1000);

//     const previousPurchaseNumbers = await PurchaseNumber.find({
//       stripeCustomerId: invoice.customer,
//       stripeSubscriptionId: invoice.subscription
//     });

//     for (const prev of previousPurchaseNumbers) {
//       await PurchaseNumber.create({
//         user_id: prev.user_id,
//         phone_id: prev.phone_id,
//         stripeCustomerId: prev.stripeCustomerId,
//         stripeSubscriptionId: prev.stripeSubscriptionId,
//         status: "active",
//         startDate: newStartDate,
//         endDate: newEndDate
//       });

//       await PurchaseNumber.findByIdAndUpdate(prev._id, { status: "expired" });
//     }

//     if (paymentRecord.plan_id) {
//       await Subscription.findOneAndUpdate(
//         { user_id: paymentRecord.user_id },
//         {
//           $set: {
//             plan_id: paymentRecord.plan_id,
//             startDate: newStartDate,
//             endDate: newEndDate,
//             isActive: true,
//             updatedAt: new Date()
//           },
//           $setOnInsert: {
//             user_id: paymentRecord.user_id
//           }
//         },
//         { new: true, upsert: true }
//       );
//     }
//   }
// }
// export default webhookHandler;
