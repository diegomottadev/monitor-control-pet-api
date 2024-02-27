import express, { Request, Response } from "express";
import log from "../utils/logger";
import passport from "passport";
import { Op, Transaction } from "sequelize";
import * as vaccineController from "./vaccine.controller";
import { procesarErrores } from "../../libs/errorHandler";
import { checkUserRolePermission } from "./../helpers/checkRolePermision.helper";
import { VaccineNotExist } from "./vaccine.error";
import { validationVaccine } from "./vaccine.validation";

const jwtAuthenticate = passport.authenticate("jwt", { session: false });

const vaccineRouter = express.Router();

const handleUnknownError = (
  res: Response,
  error: unknown,
  defaultMessage: string
) => {
  if (error instanceof VaccineNotExist) {
    log.warn(error.message);
    res.status(404).json({ message: error.message });
  } else if (error instanceof Error) {
    log.error(`Error: ${error.message}`);
    res.status(500).json({ message: defaultMessage });
  } else {
    log.error(`Unknown error: ${error}`);
    res.status(500).json({ message: "Unknown error occurred." });
  }
};

vaccineRouter.post(
    "/:trackingId/vaccines",
    [jwtAuthenticate, checkUserRolePermission("Create"), validationVaccine],
    procesarErrores(async (req: Request, res: Response) => {
      const trackingId = parseInt(req.params.trackingId);
      const vaccineData = req.body;
      let transaction: Transaction | null = null;
      try {
        transaction = await vaccineController.beginTransaction();
        const vaccine = await vaccineController.createVaccine(
          vaccineData,
          trackingId,
          transaction
        );
        await vaccineController.commitTransaction(transaction);
        res
          .status(201)
          .json({
            message: `Vaccine with name [${vaccine.name}] created successfully for Tracking ID [${trackingId}].`,
            data: vaccine,
          });
        log.info(`Vaccine with name [${vaccine.name}] created successfully for Tracking ID [${trackingId}].`);
      } catch (error) {
        if (transaction !== null) {
          await vaccineController.rollbackTransaction(transaction);
        }
        handleUnknownError(res, error, `Error creating the vaccine for Tracking ID [${trackingId}].`);
      }
    })
  );

vaccineRouter.get(
  "/:trackingId/vaccines",
  [jwtAuthenticate, checkUserRolePermission("List")],
  procesarErrores(async (req: Request, res: Response) => {
    let transaction: Transaction | null = null;
    const trackingId = parseInt(req.params.trackingId);
    let isTransactionCommit = false;
    try {
      transaction = await vaccineController.beginTransaction();
      const { page = 1, pageSize = 10, name } = req.query;
      let where: any = {
        id: { [Op.not]: null },
        trackingId: trackingId
      };

      if (name) {
        where.name = { [Op.like]: `%${name}%` };
      }

      const result = await vaccineController.getAllVaccines(
        page as number,
        pageSize as number,
        where,
        transaction
      );
      isTransactionCommit = await vaccineController.commitTransaction(
        transaction
      );
      res.json({ data: result.rows, count: result.count });
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await vaccineController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, "Error getting all vaccines.");
    }
  })
);

vaccineRouter.get(
  "/:trackingId/vaccines/:id",
  [jwtAuthenticate, checkUserRolePermission("Read")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id); 
    //const trackingId = parseInt(req.params.trackingId);
    let transaction: Transaction | null = null;
    let isTransactionCommit = false;
    try {
      transaction = await vaccineController.beginTransaction();
      const vaccine = await vaccineController.getVaccineById(id, transaction);
      isTransactionCommit = await vaccineController.commitTransaction(
        transaction
      );
      if (!vaccine) {
        throw new VaccineNotExist(`Vaccine with ID [${id}] does not exist`);
      } else {
        res.json(vaccine);
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await vaccineController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, `Error getting the vaccine with ID [${id}].`);
    }
  })
);

vaccineRouter.put(
  "/:trackingId/vaccines/:id",
  [jwtAuthenticate, checkUserRolePermission("Update")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    //const trackingId = parseInt(req.params.trackingId);
    let transaction: Transaction | null = null;
    let isTransactionCommit = false;
    try {
      transaction = await vaccineController.beginTransaction();
      const updatedVaccine = await vaccineController.updateVaccine(
        id,
        req.body,
        transaction
      );
      isTransactionCommit = await vaccineController.commitTransaction(
        transaction
      );

      if (updatedVaccine) {
        res.json({
          message: `Vaccine with ID [${id}] has been successfully updated.`,
          data: updatedVaccine,
        });
        log.info(`Vaccine with ID [${id}] has been successfully updated.`);
      } else {
        throw new VaccineNotExist(`Vaccine with ID [${id}] does not exist`);
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await vaccineController.rollbackTransaction(transaction);
      }
      handleUnknownError(
        res,
        error,
        `Error updating the vaccine with ID [${id}].`
      );
    }
  })
);

vaccineRouter.delete(
  "/:trackingId/vaccines/:id",
  [jwtAuthenticate, checkUserRolePermission("Delete")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    //const trackingId = parseInt(req.params.trackingId);
    let transaction: Transaction | null = null;
    let isTransactionCommit = false;
    try {
      transaction = await vaccineController.beginTransaction();
      const deletedCount = await vaccineController.deleteVaccine(
        id,
        transaction
      );
      isTransactionCommit = await vaccineController.commitTransaction(
        transaction
      );
      if (deletedCount === 0) {
        throw new VaccineNotExist(`Vaccine with ID [${id}] does not exist`);
      } else {
        log.info(`Vaccine with ID [${id}] has been deleted`);
        res.json({ message: `Vaccine with ID [${id}] has been deleted` });
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await vaccineController.rollbackTransaction(transaction);
      }
      handleUnknownError(
        res,
        error,
        `Error deleting the vaccine with ID [${id}].`
      );
    }
  })
);

export default vaccineRouter;
