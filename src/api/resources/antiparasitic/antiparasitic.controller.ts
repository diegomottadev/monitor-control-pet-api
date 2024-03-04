// antiparasitic.controller.ts
import { FindOptions, Transaction } from "sequelize";
import Antiparasitic from "../../../database/models/Antiparasitic";

// Function to start a transaction
export const beginTransaction = async (): Promise<Transaction> => {
  if (!Antiparasitic.sequelize) {
    throw new Error("Sequelize instance is not available.");
  }
  return await Antiparasitic.sequelize.transaction();
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

// Function to create a new antiparasitic
export const createAntiparasitic = async (
  antiparasiticData: {
    name: string;
    type: 'external' | 'internal';
    dateApplied: Date;
    expirationDate: Date;
    description?: string;
  },
  trackingId: number,
  transaction?: Transaction
): Promise<Antiparasitic> => {
  const { dateApplied, expirationDate } = antiparasiticData;
  const parsedDateApplied = dateApplied ? new Date(dateApplied) : undefined;
  const parsedExpirationDate = expirationDate ? new Date(expirationDate) : undefined;

  try {
    // Create the antiparasitic
    const antiparasitic = await Antiparasitic.create(
      {
        ...antiparasiticData,
        dateApplied: parsedDateApplied,
        expirationDate: parsedExpirationDate,
        trackingId: trackingId,
      },
      { transaction }
    );
    return antiparasitic;
  } catch (error: any) {
    throw new Error("Error creating the antiparasitic: " + error.message);
  }
};

// Function to get all antiparasitics
export const getAllAntiparasitics = async (
  page: number,
  pageSize: number,
  where: any,
  transaction?: Transaction
): Promise<{ rows: Antiparasitic[]; count: number }> => {
  const options: FindOptions<Antiparasitic> = {
    where: where,
    transaction: transaction, // Pass transaction to options
  };

  if (page && pageSize) {
    options.offset = (page - 1) * pageSize;
    options.limit = pageSize;
    options.order = [["id", "ASC"]];
  }

  const { rows } = await Antiparasitic.findAndCountAll(options);

  const antiparasiticCount = await Antiparasitic.count({ where });

  return { rows, count: antiparasiticCount };
};

// Function to get an antiparasitic by its ID
export const getAntiparasiticById = async (
  id: number,
  transaction?: Transaction
): Promise<Antiparasitic | null> => {
  try {
    const antiparasitic = await Antiparasitic.findByPk(id, { transaction }); // Pass transaction to options
    return antiparasitic;
  } catch (error: any) {
    throw new Error("Error getting the antiparasitic by ID: " + error.message);
  }
};

// Function to update an existing antiparasitic
export const updateAntiparasitic = async (
  id: number,
  antiparasiticData: {
    name?: string;
    type?: 'external' | 'internal';
    dateApplied?: Date;
    expirationDate?: Date;
    description?: string;
  },
  transaction?: Transaction
): Promise<Antiparasitic | null> => {
  try {
    const [updatedRowsCount] = await Antiparasitic.update(antiparasiticData, {
      where: { id },
      transaction: transaction, // Pass transaction to options
    });

    if (updatedRowsCount === 0) {
      return null; // No rows were updated
    }

    const updatedAntiparasitic = await Antiparasitic.findOne({ where: { id } });
    return updatedAntiparasitic;
  } catch (error: any) {
    throw new Error("Error updating the antiparasitic: " + error.message);
  }
};


// Function to delete an existing antiparasitic
export const deleteAntiparasitic = async (
  id: number,
  transaction?: Transaction
): Promise<number> => {
  try {
    const deletedRowsCount = await Antiparasitic.destroy({
      where: { id },
      transaction: transaction, // Pass transaction to options
    });
    return deletedRowsCount;
  } catch (error: any) {
    throw new Error("Error deleting the antiparasitic: " + error.message);
  }
};

// Function to search for antiparasitics by a specific condition
export const findAntiparasitics = async (
  condition: any,
  transaction?: Transaction
): Promise<Antiparasitic[]> => {
  try {
    const antiparasitics = await Antiparasitic.findAll({ where: condition, transaction }); // Pass transaction to options
    return antiparasitics;
  } catch (error: any) {
    throw new Error("Error searching for antiparasitics: " + error.message);
  }
};
