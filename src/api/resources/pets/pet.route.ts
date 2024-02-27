import express, { Request, Response } from "express";
import log from "../utils/logger";
import passport from "passport";
import * as petController from "./pet.controller";
import { procesarErrores } from "../../libs/errorHandler";
import { validationPet } from "./pet.validation";
import { checkUserRolePermission } from "./../helpers/checkRolePermision.helper";
import { Op } from "sequelize";
import { Transaction } from "sequelize";
import { PetNotExist } from "./pet.error";

const jwtAuthenticate = passport.authenticate("jwt", { session: false });

const petRouter = express.Router();

// Función para manejar errores desconocidos
const handleUnknownError = (
  res: Response,
  error: unknown,
  defaultMessage: string
) => {
  if (error instanceof PetNotExist) {
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

// Create a new pet
petRouter.post(
  "/",
  [jwtAuthenticate, checkUserRolePermission("Create"), validationPet],
  procesarErrores(async (req: Request, res: Response) => {
    let petData = req.body;
    let transaction: Transaction | null = null; // Initialize transaction as null
    try {
      transaction = await petController.beginTransaction(); // Begin transaction
      const pet = await petController.createPet(petData, transaction);
      await petController.commitTransaction(transaction); // Commit transaction
      res
        .status(201)
        .json({
          message: `Pet with name [${pet.name}] created successfully.`,
          data: pet,
        });
      log.info(`Pet with name [${pet.name}] created successfully.`);
    } catch (error) {
      if (transaction !== null) {
        await petController.rollbackTransaction(transaction); // Rollback transaction if not null
      }
      handleUnknownError(res, error, "Error creating the pet.");
    }
  })
);

// Get all pets
petRouter.get(
  "/",
  [jwtAuthenticate, checkUserRolePermission("List")],
  procesarErrores(async (req: Request, res: Response) => {
    let transaction: Transaction | null = null; // Initialize transaction as null
    let isTransactionCommit = false; // Initialize isTransactionCommit as false
    try {
      transaction = await petController.beginTransaction(); // Begin transaction
      const { page = 1, pageSize = 10, name } = req.query;
      let where: any = {
        id: { [Op.not]: null },
      };

      if (name) {
        where.name = { [Op.like]: `%${name}%` };
      }

      const result = await petController.getAllPets(
        page as number,
        pageSize as number,
        where,
        transaction
      );
      isTransactionCommit = await petController.commitTransaction(transaction); // Commit transaction
      res.json({ data: result.rows, count: result.count });
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await petController.rollbackTransaction(transaction); // Rollback transaction if not null
      }
      handleUnknownError(res, error, "Error getting all pets.");
    }
  })
);

// Get a specific pet by ID
petRouter.get(
  "/:id",
  [jwtAuthenticate, checkUserRolePermission("Read")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null; // Initialize transaction as null
    let isTransactionCommit = false; // Initialize isTransactionCommit as false
    try {
      transaction = await petController.beginTransaction(); // Begin transaction
      const pet = await petController.getPetById(id, transaction);
      isTransactionCommit = await petController.commitTransaction(transaction); // Commit transaction
      if (!pet) {
        throw new PetNotExist(`Pet with ID [${id}] does not exist`);
      } else {
        res.json(pet);
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await petController.rollbackTransaction(transaction); // Rollback transaction if not null
      }
      handleUnknownError(res, error, `Error getting the pet with ID [${id}].`);
    }
  })
);

// Update a pet by ID
petRouter.put(
  "/:id",
  [jwtAuthenticate, checkUserRolePermission("Update"), validationPet],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null; // Initialize transaction as null
    let isTransactionCommit = false; // Initialize isTransactionCommit as false
    try {
      transaction = await petController.beginTransaction(); // Begin transaction
      const updatedPet = await petController.updatePet(
        id,
        req.body,
        transaction
      );
      isTransactionCommit = await petController.commitTransaction(transaction); // Commit transaction

      if (updatedPet) {
        res.json({
          message: `Pet with ID [${id}] has been successfully updated.`,
          data: updatedPet,
        });
        log.info(`Pet with ID [${id}] has been successfully updated.`);
      } else {
        throw new PetNotExist(`Pet with ID [${id}] does not exist`);
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await petController.rollbackTransaction(transaction); // Rollback transaction if not null and not committed
      }
      handleUnknownError(res, error, `Error updating the pet with ID [${id}].`);
    }
  })
);

// Delete a pet by ID
petRouter.delete(
  "/:id",
  [jwtAuthenticate, checkUserRolePermission("Delete")],
  procesarErrores(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    let transaction: Transaction | null = null; // Initialize transaction as null
    let isTransactionCommit = false; // Initialize isTransactionCommit as false
    try {
      transaction = await petController.beginTransaction(); // Begin transaction
      const deletedCount = await petController.deletePet(id, transaction);
      isTransactionCommit = await petController.commitTransaction(transaction); // Commit transaction
      if (deletedCount === 0) {
        throw new PetNotExist(`Pet with ID [${id}] does not exist`);
      } else {
        log.info(`Pet with ID [${id}] has been deleted`);
        res.json({ message: `Pet with ID [${id}] has been deleted` });
      }
    } catch (error) {
      if (transaction !== null && !isTransactionCommit) {
        await petController.rollbackTransaction(transaction); // Rollback transaction if not null
      }
      handleUnknownError(res, error, `Error deleting the pet with ID [${id}].`);
    }
  })
);

export default petRouter;
