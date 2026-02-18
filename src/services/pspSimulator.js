const { v4: uuidv4 } = require('uuid');

/**
 * PSP Simulator - Simulates payment gateway responses
 * Replace with actual PSP integration in production
 */

exports.processPayment = async ({ amount, paymentMethod, currency }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate 95% success rate
  const isSuccess = Math.random() > 0.05;
  
  if (isSuccess) {
    return {
      success: true,
      referenceId: `PSP-${uuidv4()}`,
      amount,
      currency,
      paymentMethod,
      timestamp: new Date().toISOString()
    };
  } else {
    return {
      success: false,
      error: 'Payment declined by issuer',
      referenceId: `PSP-${uuidv4()}`,
      timestamp: new Date().toISOString()
    };
  }
};

exports.processRefund = async ({ transactionId, amount }) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    refundId: `REF-${uuidv4()}`,
    amount,
    timestamp: new Date().toISOString()
  };
};