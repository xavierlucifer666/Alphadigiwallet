const Merchant = require('../models/Merchant');
const Wallet = require('../models/Wallet');
const logger = require('../config/logger');

exports.registerMerchant = async (req, res, next) => {
  try {
    const { businessName, businessType, registrationNumber, contactEmail, contactPhone } = req.body;
    
    // Check if user already has merchant account
    const existingMerchant = await Merchant.findByUserId(req.user.userId);
    if (existingMerchant) {
      return res.status(409).json({ error: 'Merchant account already exists' });
    }
    
    // Create merchant
    const merchant = await Merchant.create({
      userId: req.user.userId,
      businessName,
      businessType,
      registrationNumber,
      contactEmail,
      contactPhone
    });
    
    logger.info(`New merchant registered: ${businessName}`);
    
    res.status(201).json({
      message: 'Merchant registration submitted for approval',
      merchantId: merchant.merchant_id,
      status: merchant.status
    });
  } catch (error) {
    next(error);
  }
};

exports.getMerchantProfile = async (req, res, next) => {
  try {
    const merchant = await Merchant.findByUserId(req.user.userId);
    
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant account not found' });
    }
    
    // Get merchant wallet
    const wallet = await Wallet.findByUserId(req.user.userId);
    
    res.json({
      merchantId: merchant.merchant_id,
      businessName: merchant.business_name,
      businessType: merchant.business_type,
      registrationNumber: merchant.registration_number,
      contactEmail: merchant.contact_email,
      contactPhone: merchant.contact_phone,
      status: merchant.status,
      wallet: wallet ? {
        walletId: wallet.wallet_id,
        balance: parseFloat(wallet.balance),
        currency: wallet.currency
      } : null,
      createdAt: merchant.created_at
    });
  } catch (error) {
    next(error);
  }
};