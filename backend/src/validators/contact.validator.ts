import Joi from 'joi';

export const trackContactSchema = Joi.object({
  labourId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid labour ID format',
    'any.required': 'Labour ID is required',
  }),
  contactType: Joi.string().valid('call', 'message').required().messages({
    'any.only': 'Contact type must be either call or message',
    'any.required': 'Contact type is required',
  }),
});

