import express, { Request, Response } from "express";
import log from "../utils/logger";
import passport from "passport";
import { Transaction } from "sequelize";
import * as trackingController from "./trackings.controller";
import { procesarErrores } from "../../libs/errorHandler";
import { checkUserRolePermission } from "../helpers/checkRolePermision.helper";
import { TrackingNotExist } from "./tracking.error";

const jwtAuthenticate = passport.authenticate("jwt", { session: false });

const trackingsRouter = express.Router();

const handleUnknownError = (
  res: Response,
  error: unknown,
  defaultMessage: string
) => {
  if (error instanceof TrackingNotExist) {
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

trackingsRouter.get(
  "/",
  [jwtAuthenticate, checkUserRolePermission("List")],
  procesarErrores(async (req: Request, res: Response) => {
    let transaction: Transaction | null = null;
     let isTransactionCommit = false;
    try {
      transaction = await trackingController.beginTransaction();
      const { page = 1, pageSize = 10, name } = req.query;

    
      const result = await trackingController.getAllTrackings(
        page as number,
        pageSize as number,
        name as string,
        transaction
      );
      isTransactionCommit = await trackingController.commitTransaction(
        transaction
      );
      res.json({ data: result.rows });
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await trackingController.rollbackTransaction(transaction);
      }
       handleUnknownError(res, error, "Error getting all trackings.");
    }
  })
);

trackingsRouter.get(
  "/:id",
  [jwtAuthenticate, checkUserRolePermission("Read")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null;
    let isTransactionCommit = false;
    try {
      transaction = await trackingController.beginTransaction();
      const tracking = await trackingController.getTrackingById(id, transaction);
      isTransactionCommit = await trackingController.commitTransaction(
        transaction
      );
      if (!tracking) {
        throw new TrackingNotExist(`Tracking with ID [${id}] does not exist`);
      } else {
        res.json(tracking);
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await trackingController.rollbackTransaction(transaction);
      }
      handleUnknownError(res, error, `Error getting the tracking with ID [${id}].`);
    }
  })
);

export default trackingsRouter;
