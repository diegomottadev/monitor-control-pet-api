// veterinarian.controller.ts
import { FindOptions, Transaction } from "sequelize";
import Veterinarian from "../../../database/models/Veterinarian";
import { Op } from "sequelize";
import { InfoVeterinarianInUse } from "./veterinarian.error";

// Function to start a transaction
export const beginTransaction = async (): Promise<Transaction> => {
  if (!Veterinarian.sequelize) {
    throw new Error("Sequelize instance is not available.");
  }
  return await Veterinarian.sequelize.transaction();
};

// Function to commit a transaction
export const commitTransaction = async (
  transaction: Transaction
): Promise<boolean> => {
  try {
    await transaction.commit();
    return true; // Transaction was successfully committed
  } catch (error) {
    console.error("Error committing transaction:", error);
    return false; // There was an error committing the transaction
  }
};

// Function to rollback a transaction
export const rollbackTransaction = async (
  transaction: Transaction
): Promise<void> => {
  await transaction.rollback();
};

// Function to create a new veterinarian
export const createVeterinarian = async (
    veterinarianData: {
      name: string;
      email?: string;
      phone?: string;
    },
    transaction?: Transaction
  ): Promise<Veterinarian> => {

      // Check if the name is unique
      const existingVeterinarian = await Veterinarian.findOne({ where: { name: veterinarianData.name } });
      if (existingVeterinarian) {
        throw new InfoVeterinarianInUse(`A veterinarian with the name ${veterinarianData.name} already exists.`);
      }
  
      // Create the veterinarian
      const veterinarian = await Veterinarian.create(veterinarianData, { transaction });
      return veterinarian;

  };
// Function to get all veterinarians
export const getAllVeterinarians = async (
  page: number,
  pageSize: number,
  where: any,
  transaction?: Transaction
): Promise<{ rows: Veterinarian[]; count: number }> => {
  const options: FindOptions<Veterinarian> = {
    where: where,
    transaction: transaction, // Pass transaction to options
  };

  if (page && pageSize) {
    options.offset = (page - 1) * pageSize;
    options.limit = pageSize;
    options.order = [["id", "ASC"]];
  }

  const { rows } = await Veterinarian.findAndCountAll(options);

  const veterinarianCount = await Veterinarian.count({ where });

  return { rows, count: veterinarianCount };
};

// Function to get a veterinarian by its ID
export const getVeterinarianById = async (
  id: number,
  transaction?: Transaction
): Promise<Veterinarian | null> => {
  try {
    const veterinarian = await Veterinarian.findByPk(id, { transaction }); // Pass transaction to options
    return veterinarian;
  } catch (error: any) {
    throw new Error("Error getting the veterinarian by ID: " + error.message);
  }
};

// Function to update an existing veterinarian
// Function to update an existing veterinarian
export const updateVeterinarian = async (
    id: number,
    veterinarianData: {
      name?: string;
      email?: string;
      phone?: string;
    },
    transaction?: Transaction
  ): Promise<Veterinarian | null> => {

      const { name } = veterinarianData;
  
      // Check if there's another veterinarian with the same name excluding the current veterinarian
      const existingVeterinarian = await Veterinarian.findOne({ where: { name, id: { [Op.ne]: id } } });
      if (existingVeterinarian) {
        throw new InfoVeterinarianInUse(`A veterinarian with the name [${name}] already exists.`);
      }
  
      const [updatedRowsCount] = await Veterinarian.update(veterinarianData, {
        where: { id },
        transaction: transaction, // Pass transaction to options
      });
  
      if (updatedRowsCount === 0) {
        return null; // No rows were updated
      }
  
      const updatedVeterinarian = await Veterinarian.findOne({ where: { id } });
      return updatedVeterinarian;
  };
  

// Function to delete an existing veterinarian
export const deleteVeterinarian = async (
  id: number,
  transaction?: Transaction
): Promise<number> => {
  try {
    const deletedRowsCount = await Veterinarian.destroy({
      where: { id },
      transaction: transaction, // Pass transaction to options
    });
    return deletedRowsCount;
  } catch (error: any) {
    throw new Error("Error deleting the veterinarian: " + error.message);
  }
};

// Function to search for veterinarians by a specific condition
export const findVeterinarians = async (
  condition: any,
  transaction?: Transaction
): Promise<Veterinarian[]> => {
  try {
    const veterinarians = await Veterinarian.findAll({ where: condition, transaction }); // Pass transaction to options
    return veterinarians;
  } catch (error: any) {
    throw new Error("Error searching for veterinarians: " + error.message);
  }
};
