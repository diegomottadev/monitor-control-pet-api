import express, { Request, Response } from "express";
import log from "../utils/logger";
import passport from "passport";
import { Transaction, Op } from "sequelize";
import * as medicalConsultationController from "./medicalConsultation.controller";
import { procesarErrores } from "../../libs/errorHandler";
import { checkUserRolePermission } from "../helpers/checkRolePermision.helper";
import { MedicalConsultationNotExist } from "./medicalConsultation.error";
import { validationMedicalConsultation } from "./medicalConsultation.validation";
import MedicalConsultation from "../../../database/models/MedicalConsultation";

const jwtAuthenticate = passport.authenticate("jwt", { session: false });

const medicalConsultationsRouter = express.Router();

const handleUnknownError = (
  res: Response,
  error: unknown,
  defaultMessage: string
) => {
  if (error instanceof MedicalConsultationNotExist) {
    log.warn(error.message);
    res.status(error.status).json({ message: error.message });
  } else if (error instanceof Error) {
    log.error(`Error: ${error.message}`);
    res.status(500).json({ message: defaultMessage });
  } else {
    log.error(`Unknown error: ${error}`);
    res.status(500).json({ message: "Unknown error occurred." });
  }
};

medicalConsultationsRouter.post(
  "/:trackingId/medicalConsultations",
  [jwtAuthenticate, checkUserRolePermission("Create"), validationMedicalConsultation],
  procesarErrores(async (req: Request, res: Response) => {
    const trackingId = parseInt(req.params.trackingId);
    const medicalConsultationData = req.body;
    let transaction: Transaction | null = null;
    try {
      transaction = await medicalConsultationController.beginTransaction();
      const medicalConsultation = await medicalConsultationController.createMedicalConsultation(
        medicalConsultationData,
        trackingId,
        transaction
      );
      await medicalConsultationController.commitTransaction(transaction);
      res
        .status(201)
        .json({
          message: `Medical consultation created successfully for Tracking ID [${trackingId}].`,
          data: medicalConsultation,
        });
      log.info(`Medical consultation created successfully for Tracking ID [${trackingId}].`);
    } catch (error) {
      if (transaction !== null) {
        await medicalConsultationController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, `Error creating the medical consultation for Tracking ID [${trackingId}].`);
    }
  })
);

medicalConsultationsRouter.get(
  "/:trackingId/medicalConsultations",
  [jwtAuthenticate, checkUserRolePermission("List")],
  procesarErrores(async (req: Request, res: Response) => {
    let transaction: Transaction | null = null;
    const trackingId = parseInt(req.params.trackingId);
    let isTransactionCommit = false;
    try {
      transaction = await medicalConsultationController.beginTransaction();
      const { page = 1, pageSize = 10, name } = req.query;
      let where: any = {
        id: { [Op.not]: null },
        trackingId: trackingId
      };

      if (name) {
        where.name = { [Op.like]: `%${name}%` };
      }

      const result = await medicalConsultationController.getAllMedicalConsultations(
        page as number,
        pageSize as number,
        where,
        transaction
      );
      isTransactionCommit = await medicalConsultationController.commitTransaction(
        transaction
      );
      res.json({ data: result.rows, count: result.count });
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await medicalConsultationController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, "Error getting all medical consultations.");
    }
  })
);

medicalConsultationsRouter.get(
  "/:trackingId/medicalConsultations/:id",
  [jwtAuthenticate, checkUserRolePermission("Read")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null;
    let isTransactionCommit = false;
    try {
      transaction = await medicalConsultationController.beginTransaction();
      const medicalConsultation = await medicalConsultationController.getMedicalConsultationById(id, transaction);
      isTransactionCommit = await medicalConsultationController.commitTransaction(
        transaction
      );
      if (!medicalConsultation) {
        throw new MedicalConsultationNotExist(`Medical consultation with ID [${id}] does not exist`);
      } else {
        res.json(medicalConsultation);
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await medicalConsultationController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, `Error getting the medical consultation with ID [${id}].`);
    }
  })
);

medicalConsultationsRouter.put(
  "/:trackingId/medicalConsultations/:id",
  [jwtAuthenticate, checkUserRolePermission("Update")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null;
    let isTransactionCommit = false;
    try {
      transaction = await medicalConsultationController.beginTransaction();
      const updatedMedicalConsultation = await medicalConsultationController.updateMedicalConsultation(
        id,
        req.body,
        transaction
      );
      isTransactionCommit = await medicalConsultationController.commitTransaction(
        transaction
      );

      if (updatedMedicalConsultation) {
        // Fetch the updated record after the transaction is committed
        const fetchedUpdatedMedicalConsultation = await MedicalConsultation.findOne({ where: { id } });

        res.json({
          message: `Medical consultation with ID [${id}] has been successfully updated.`,
          data: fetchedUpdatedMedicalConsultation,
        });
        log.info(`Medical consultation with ID [${id}] has been successfully updated.`);
      } else {
        throw new MedicalConsultationNotExist(`Medical consultation with ID [${id}] does not exist`);
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await medicalConsultationController.rollbackTransaction(transaction);
      }
      handleUnknownError(
        res,
        error,
        `Error updating the medical consultation with ID [${id}].`
      );
    }
  })
);

medicalConsultationsRouter.delete(
  "/:trackingId/medicalConsultations/:id",
  [jwtAuthenticate, checkUserRolePermission("Delete")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null;
    let isTransactionCommit = false;
    try {
      transaction = await medicalConsultationController.beginTransaction();
      const deletedCount = await medicalConsultationController.deleteMedicalConsultation(
        id,
        transaction
      );
      isTransactionCommit = await medicalConsultationController.commitTransaction(
        transaction
      );
      if (deletedCount === 0) {
        throw new MedicalConsultationNotExist(`Medical consultation with ID [${id}] does not exist`);
      } else {
        log.info(`Medical consultation with ID [${id}] has been deleted`);
        res.json({ message: `Medical consultation with ID [${id}] has been deleted` });
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await medicalConsultationController.rollbackTransaction(transaction);
      }
      handleUnknownError(
        res,
        error,
        `Error deleting the medical consultation with ID [${id}].`
      );
    }
  })
);

export default medicalConsultationsRouter;
