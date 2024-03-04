// antiparasitic.controller.ts
import express, { Request, Response } from "express";
import log from "../utils/logger";
import passport from "passport";
import { Op, Transaction } from "sequelize";
import * as antiparasiticController from "./antiparasitic.controller";
import { procesarErrores } from "../../libs/errorHandler";
import { checkUserRolePermission } from "./../helpers/checkRolePermision.helper";
import { AntiparasiticNotExist } from "./antiparasitic.error";
import { validationAntiparasitic } from "./antiparasatic.validations";
import Antiparasitic from "../../../database/models/Antiparasitic";

const jwtAuthenticate = passport.authenticate("jwt", { session: false });

const antiparasiticRouter = express.Router();

const handleUnknownError = (
  res: Response,
  error: unknown,
  defaultMessage: string
) => {
  if (error instanceof AntiparasiticNotExist) {
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

antiparasiticRouter.post(
  "/:trackingId/antiparasitics",
  [jwtAuthenticate, checkUserRolePermission("Create"), validationAntiparasitic],
  procesarErrores(async (req: Request, res: Response) => {
    const trackingId = parseInt(req.params.trackingId);
    const antiparasiticData = req.body;
    let transaction: Transaction | null = null;
    try {
      transaction = await antiparasiticController.beginTransaction();
      const antiparasitic = await antiparasiticController.createAntiparasitic(
        antiparasiticData,
        trackingId,
        transaction
      );
      await antiparasiticController.commitTransaction(transaction);
      res
        .status(201)
        .json({
          message: `Antiparasitic with name [${antiparasitic.name}] created successfully for Tracking ID [${trackingId}].`,
          data: antiparasitic,
        });
      log.info(`Antiparasitic with name [${antiparasitic.name}] created successfully for Tracking ID [${trackingId}].`);
    } catch (error) {
      if (transaction !== null) {
        await antiparasiticController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, `Error creating the antiparasitic for Tracking ID [${trackingId}].`);
    }
  })
);

antiparasiticRouter.get(
  "/:trackingId/antiparasitics",
  [jwtAuthenticate, checkUserRolePermission("List")],
  procesarErrores(async (req: Request, res: Response) => {
    let transaction: Transaction | null = null;
    const trackingId = parseInt(req.params.trackingId);
    let isTransactionCommit = false;
    try {
      transaction = await antiparasiticController.beginTransaction();
      const { page = 1, pageSize = 10, name } = req.query;
      let where: any = {
        id: { [Op.not]: null },
        trackingId: trackingId
      };

      if (name) {
        where.name = { [Op.like]: `%${name}%` };
      }

      const result = await antiparasiticController.getAllAntiparasitics(
        page as number,
        pageSize as number,
        where,
        transaction
      );
      isTransactionCommit = await antiparasiticController.commitTransaction(
        transaction
      );
      res.json({ data: result.rows, count: result.count });
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await antiparasiticController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, "Error getting all antiparasitics.");
    }
  })
);

antiparasiticRouter.get(
  "/:trackingId/antiparasitics/:id",
  [jwtAuthenticate, checkUserRolePermission("Read")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null;
    let isTransactionCommit = false;
    try {
      transaction = await antiparasiticController.beginTransaction();
      const antiparasitic = await antiparasiticController.getAntiparasiticById(id, transaction);
      isTransactionCommit = await antiparasiticController.commitTransaction(
        transaction
      );
      if (!antiparasitic) {
        throw new AntiparasiticNotExist(`Antiparasitic with ID [${id}] does not exist`);
      } else {
        res.json(antiparasitic);
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await antiparasiticController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, `Error getting the antiparasitic with ID [${id}].`);
    }
  })
);

antiparasiticRouter.put(
  "/:trackingId/antiparasitics/:id",
  [jwtAuthenticate, checkUserRolePermission("Update")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null;
    let isTransactionCommit = false;
    try {
      transaction = await antiparasiticController.beginTransaction();
      const updatedAntiparasitic = await antiparasiticController.updateAntiparasitic(
        id,
        req.body,
        transaction
      );
      isTransactionCommit = await antiparasiticController.commitTransaction(
        transaction
      );

      if (updatedAntiparasitic) {
        // Buscar el registro actualizado después de que la transacción se haya confirmado
        const fetchedUpdatedAntiparasitic = await Antiparasitic.findOne({ where: { id } });

        res.json({
          message: `Antiparasitic with ID [${id}] has been successfully updated.`,
          data: fetchedUpdatedAntiparasitic,
        });
        log.info(`Antiparasitic with ID [${id}] has been successfully updated.`);
      } else {
        throw new AntiparasiticNotExist(`Antiparasitic with ID [${id}] does not exist`);
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await antiparasiticController.rollbackTransaction(transaction);
      }
      handleUnknownError(
        res,
        error,
        `Error updating the antiparasitic with ID [${id}].`
      );
    }
  })
);


antiparasiticRouter.delete(
  "/:trackingId/antiparasitics/:id",
  [jwtAuthenticate, checkUserRolePermission("Delete")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null;
    let isTransactionCommit = false;
    try {
      transaction = await antiparasiticController.beginTransaction();
      const deletedCount = await antiparasiticController.deleteAntiparasitic(
        id,
        transaction
      );
      isTransactionCommit = await antiparasiticController.commitTransaction(
        transaction
      );
      if (deletedCount === 0) {
        throw new AntiparasiticNotExist(`Antiparasitic with ID [${id}] does not exist`);
      } else {
        log.info(`Antiparasitic with ID [${id}] has been deleted`);
        res.json({ message: `Antiparasitic with ID [${id}] has been deleted` });
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await antiparasiticController.rollbackTransaction(transaction);
      }
      handleUnknownError(
        res,
        error,
        `Error deleting the antiparasitic with ID [${id}].`
      );
    }
  })
);

export default antiparasiticRouter;
