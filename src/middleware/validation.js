const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors 
      });
    }
    
    next();
  };
};

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  transfer: Joi.object({
    toWalletId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().optional()
  }),
  
  topup: Joi.object({
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().required()
  }),
  
  merchantRegistration: Joi.object({
    businessName: Joi.string().required(),
    businessType: Joi.string().required(),
    registrationNumber: Joi.string().required(),
    contactEmail: Joi.string().email().required(),
    contactPhone: Joi.string().required()
  })
};

module.exports = { validate, schemas };