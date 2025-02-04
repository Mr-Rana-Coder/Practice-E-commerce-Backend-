// For testing only !!! generated signature to simulate realtime signature recieved from the frontend
import crypto from "crypto";
const generateSignature = (razorpayOrderId, razorpayPaymentId, keySecret) => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const hmac = crypto.createHmac('sha256', keySecret);
  hmac.update(body);
  const signature = hmac.digest('hex');
  return signature;
};

// Example values Get real values from the frontend.
const razorpayOrderId = 'order_PrB9akYQZNGt31';
const razorpayPaymentId = 'payment_Abc123456';
const razorpayKeySecret = 'FG3QXIWFuopEjluyqWny66nD';

const razorpaySignature = generateSignature(razorpayOrderId, razorpayPaymentId, razorpayKeySecret);
console.log('Generated Signature:', razorpaySignature);