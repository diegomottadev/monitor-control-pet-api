import Joi from '@hapi/joi';
import log from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

/*

  This code defines a blueprint or schema for validating medical consultation data. 

*/

const blueprintMedicalConsultations = Joi.object({
  name: Joi.string().required(),
  description: Joi.any(),
  veterinarianId: Joi.number().integer().required(),
  petId: Joi.number().integer().required(),
  date: Joi.date().required(),
  symptoms: Joi.string().required(),
  treatment: Joi.string().required(),
  notes: Joi.string().optional(),   
  trackingId: Joi.number().integer().required(),

});

export const validationMedicalConsultation = (req: Request, res: Response, next: NextFunction) => {

    const { date } = req.body;
    const parsedDate = date ? new Date(date) : undefined;
    req.body.date = parsedDate; // Replace date with parsedDate

  const validationResult = blueprintMedicalConsultations.validate(req.body, { abortEarly: false, convert: false });
  if (validationResult.error === undefined) {
    next();
  } else {
    let validationErrors = validationResult.error.details.map(error => {
      return `[${error.message}]`;
    });
    log.warn(`The medical consultation data did not pass validation: ${JSON.stringify(req.body)} - ${validationErrors}`);
    res.status(400).send(`${validationErrors}`);
  }
};
