// src/components/CheckoutButton.js
import React from 'react';

const CheckoutButton = ({ amount }) => {
  const loadRazorpay = () => {
    const options = {
      key: 'rzp_test_yourKeyHere', // 🔑 Replace with your Razorpay key
      amount: amount * 100, // amount in paise (₹1 = 100)
      currency: 'INR',
      name: 'One-T E-Commerce',
      description: 'Thank you for shopping!',
      handler: function (response) {
        alert('Payment successful! 🧾 Payment ID: ' + response.razorpay_payment_id);
        // TODO: save payment response to DB
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return <button onClick={loadRazorpay}>Pay ₹{amount}</button>;
};

export default CheckoutButton;
