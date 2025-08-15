// src/components/RazorpayButton.js
import React from "react";

const RazorpayButton = ({ amount, orderDetails, onSuccess }) => {
  const loadRazorpay = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Set this in your .env
        amount: amount * 100, // amount in paise
        currency: "INR",
        name: "My E-Commerce Store",
        description: "Order Payment",
        handler: function (response) {
          onSuccess({
            paymentId: response.razorpay_payment_id,
            ...orderDetails,
          });
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    };
    document.body.appendChild(script);
  };

  return (
    <button onClick={loadRazorpay} className="btn btn-primary">
      Pay with Razorpay
    </button>
  );
};

export default RazorpayButton;
