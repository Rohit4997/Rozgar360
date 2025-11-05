import Joi from 'joi';

export const addReviewSchema = Joi.object({
  labourId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid labour ID format',
    'any.required': 'Labour ID is required',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must be at most 5',
    'any.required': 'Rating is required',
  }),
  comment: Joi.string().max(500).optional().allow('', null),
});

