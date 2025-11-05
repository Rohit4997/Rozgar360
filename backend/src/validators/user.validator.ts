import Joi from 'joi';

export const completeProfileSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 255 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().optional().allow('', null),
  address: Joi.string().required().messages({
    'any.required': 'Address is required',
  }),
  city: Joi.string().required().messages({
    'any.required': 'City is required',
  }),
  state: Joi.string().required().messages({
    'any.required': 'State is required',
  }),
  pincode: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Pincode must be 6 digits',
      'any.required': 'Pincode is required',
    }),
  bio: Joi.string().max(500).optional().allow('', null),
  isAvailable: Joi.boolean().required(),
  skills: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one skill is required',
    'any.required': 'Skills are required',
  }),
  experienceYears: Joi.number().integer().min(0).max(50).required().messages({
    'number.min': 'Experience cannot be negative',
    'number.max': 'Experience must be less than 50 years',
    'any.required': 'Experience is required',
  }),
  labourType: Joi.string()
    .valid('daily', 'monthly', 'partTime', 'fullTime', 'contract', 'freelance')
    .required()
    .messages({
      'any.only': 'Invalid labour type',
      'any.required': 'Labour type is required',
    }),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional().allow('', null),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  pincode: Joi.string().pattern(/^[0-9]{6}$/).optional(),
  bio: Joi.string().max(500).optional().allow('', null),
  isAvailable: Joi.boolean().optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  experienceYears: Joi.number().integer().min(0).max(50).optional(),
  labourType: Joi.string()
    .valid('daily', 'monthly', 'partTime', 'fullTime', 'contract', 'freelance')
    .optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

export const toggleAvailabilitySchema = Joi.object({
  isAvailable: Joi.boolean().required().messages({
    'any.required': 'Availability status is required',
  }),
});

