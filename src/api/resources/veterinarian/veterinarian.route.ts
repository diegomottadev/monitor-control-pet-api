// veterinarian.routes.ts
import express, { Request, Response } from "express";
import log from "../utils/logger";
import passport from "passport";
import { Transaction } from "sequelize";
import * as veterinarianController from "./veterinarian.controller";
import { procesarErrores } from "../../libs/errorHandler";
import { checkUserRolePermission } from "./../helpers/checkRolePermision.helper";
import { InfoVeterinarianInUse, VeterinarianNotExist } from "./veterinarian.error";
import Veterinarian from "../../../database/models/Veterinarian";

const jwtAuthenticate = passport.authenticate("jwt", { session: false });

const veterinarianRouter = express.Router();

const handleUnknownError = (
  res: Response,
  error: unknown,
  defaultMessage: string
) => {
  if (error instanceof VeterinarianNotExist) {
    log.warn(error.message);
    res.status(error.status).json({ message: error.message });
  } else if (error instanceof InfoVeterinarianInUse) {
    log.error(`Error: ${error.message}`);
    res.status(error.status).json({ message: defaultMessage });
  } else if (error instanceof Error) {
    log.error(`Error: ${error.message}`);
    res.status(500).json({ message: defaultMessage });
  } else {
    log.error(`Unknown error: ${error}`);
    res.status(500).json({ message: "Unknown error occurred." });
  }
};

veterinarianRouter.post(
  "/",
  [jwtAuthenticate, checkUserRolePermission("Create")],
  procesarErrores(async (req: Request, res: Response) => {
    let transaction: Transaction | null = null;
    try {
      transaction = await veterinarianController.beginTransaction();
      const veterinarian = await veterinarianController.createVeterinarian(
        req.body,
        transaction
      );
      await veterinarianController.commitTransaction(transaction);
      res
        .status(201)
        .json({
          message: `Veterinarian with name [${veterinarian.name}] created successfully.`,
          data: veterinarian,
        });
      log.info(`Veterinarian with name [${veterinarian.name}] created successfully.`);
    } catch (error) {
      if (transaction !== null) {
        await veterinarianController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, `Error creating the veterinarian.`);
    }
  })
);

veterinarianRouter.get(
  "/",
  [jwtAuthenticate, checkUserRolePermission("List")],
  procesarErrores(async (req: Request, res: Response) => {
    let transaction: Transaction | null = null;
    try {
      transaction = await veterinarianController.beginTransaction();
      const { page = 1, pageSize = 10 } = req.query;
      const result = await veterinarianController.getAllVeterinarians(
        page as number,
        pageSize as number,
        {},
        transaction
      );
      await veterinarianController.commitTransaction(transaction);
      res.json({ data: result.rows, count: result.count });
    } catch (error) {
      if (transaction !== null) {
        await veterinarianController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, "Error getting all veterinarians.");
    }
  })
);

veterinarianRouter.get(
  "/:id",
  [jwtAuthenticate, checkUserRolePermission("Read")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null;
    try {
      transaction = await veterinarianController.beginTransaction();
      const veterinarian = await veterinarianController.getVeterinarianById(id, transaction);
      await veterinarianController.commitTransaction(transaction);
      if (!veterinarian) {
        throw new VeterinarianNotExist(`Veterinarian with ID [${id}] does not exist`);
      } else {
        res.json(veterinarian);
      }
    } catch (error) {
      if (transaction !== null) {
        await veterinarianController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, `Error getting the veterinarian with ID [${id}].`);
    }
  })
);

veterinarianRouter.put(
  "/:id",
  [jwtAuthenticate, checkUserRolePermission("Update")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null;
    try {
      transaction = await veterinarianController.beginTransaction();
      const updatedVeterinarian = await veterinarianController.updateVeterinarian(
        id,
        req.body,
        transaction
      );
      await veterinarianController.commitTransaction(transaction);

      if (updatedVeterinarian) {
        const fetchedUpdatedVeterinarian = await Veterinarian.findOne({ where: { id } });

        res.json({
          message: `Veterinarian with ID [${id}] has been successfully updated.`,
          data: fetchedUpdatedVeterinarian,
        });
        log.info(`Veterinarian with ID [${id}] has been successfully updated.`);
      } else {
        throw new VeterinarianNotExist(`Veterinarian with ID [${id}] does not exist`);
      }
    } catch (error) {
      if (transaction !== null) {
        await veterinarianController.rollbackTransaction(transaction);
      }
      handleUnknownError(
        res,
        error,
        `Error updating the veterinarian with ID [${id}].`
      );
    }
  })
);

veterinarianRouter.delete(
  "/:id",
  [jwtAuthenticate, checkUserRolePermission("Delete")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null;
    try {
      transaction = await veterinarianController.beginTransaction();
      const deletedCount = await veterinarianController.deleteVeterinarian(
        id,
        transaction
      );
      await veterinarianController.commitTransaction(transaction);
      if (deletedCount === 0) {
        throw new VeterinarianNotExist(`Veterinarian with ID [${id}] does not exist`);
      } else {
        log.info(`Veterinarian with ID [${id}] has been deleted`);
        res.json({ message: `Veterinarian with ID [${id}] has been deleted` });
      }
    } catch (error) {
      if (transaction !== null) {
        await veterinarianController.rollbackTransaction(transaction);
      }
      handleUnknownError(
        res,
        error,
        `Error deleting the veterinarian with ID [${id}].`
      );
    }
  })
);

export default veterinarianRouter;
