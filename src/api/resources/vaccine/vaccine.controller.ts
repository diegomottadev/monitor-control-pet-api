import { FindOptions, Transaction } from "sequelize";
import Vaccine from "../../../database/models/Vaccine";

// Function to start a transaction
export const beginTransaction = async (): Promise<Transaction> => {
  if (!Vaccine.sequelize) {
    throw new Error("Sequelize instance is not available.");
  }
  return await Vaccine.sequelize.transaction();
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

// Function to create a new vaccine
export const createVaccine = async (
  vaccineData: {
    name: string;
    description?: string;
    dateApplied: Date;
    hasExpiration: boolean;
    expirationDate?: Date;
    nextVaccineDate?: Date;
    rememberNextVaccine: boolean;
  },
  trackingId: number,
  transaction?: Transaction
): Promise<Vaccine> => {
  const { dateApplied } = vaccineData;
  const parsedDateApplied = dateApplied ? new Date(dateApplied) : undefined;

  try {
    // Create the vaccine
    const vaccine = await Vaccine.create(
      {
        ...vaccineData,
        dateApplied: parsedDateApplied,
        trackingId: trackingId,
      },
      { transaction }
    );
    return vaccine;
  } catch (error: any) {
    throw new Error("Error creating the vaccine: " + error.message);
  }
};

// Function to get all vaccines
export const getAllVaccines = async (
  page: number,
  pageSize: number,
  where: any,
  transaction?: Transaction
): Promise<{ rows: Vaccine[]; count: number }> => {
  const options: FindOptions<Vaccine> = {
    where: where,
    transaction: transaction, // Pass transaction to options
  };

  if (page && pageSize) {
    options.offset = (page - 1) * pageSize;
    options.limit = pageSize;
    options.order = [["id", "ASC"]];
  }

  const { rows } = await Vaccine.findAndCountAll(options);

  const vaccineCount = await Vaccine.count({ where });

  return { rows, count: vaccineCount };
};

// Function to get a vaccine by its ID
export const getVaccineById = async (
  id: number,
  transaction?: Transaction
): Promise<Vaccine | null> => {
  try {
    const vaccine = await Vaccine.findByPk(id, { transaction }); // Pass transaction to options
    return vaccine;
  } catch (error: any) {
    throw new Error("Error getting the vaccine by ID: " + error.message);
  }
};

// Function to update an existing vaccine
export const updateVaccine = async (
  id: number,
  vaccineData: {
    name?: string;
    description?: string;
    dateApplied?: Date;
    hasExpiration?: boolean;
    expirationDate?: Date;
    nextVaccineId?: number;
    rememberNextVaccine?: boolean;
  },
  transaction?: Transaction
): Promise<Vaccine | null> => {
  try {
    const [updatedRowsCount] = await Vaccine.update(vaccineData, {
      where: { id },
      transaction: transaction, // Pass transaction to options
    });

    if (updatedRowsCount > 0) {
      const updatedVaccine = await Vaccine.findByPk(id);
      return updatedVaccine;
    } else {
      return null; // Return null if the vaccine was not found or not updated
    }
  } catch (error: any) {
    throw new Error("Error updating the vaccine: " + error.message);
  }
};

// Function to delete an existing vaccine
export const deleteVaccine = async (
  id: number,
  transaction?: Transaction
): Promise<number> => {
  try {
    const deletedRowsCount = await Vaccine.destroy({
      where: { id },
      transaction: transaction, // Pass transaction to options
    });
    return deletedRowsCount;
  } catch (error: any) {
    throw new Error("Error deleting the vaccine: " + error.message);
  }
};

// Function to search for vaccines by a specific condition
export const findVaccines = async (
  condition: any,
  transaction?: Transaction
): Promise<Vaccine[]> => {
  try {
    const vaccines = await Vaccine.findAll({ where: condition, transaction }); // Pass transaction to options
    return vaccines;
  } catch (error: any) {
    throw new Error("Error searching for vaccines: " + error.message);
  }
};
