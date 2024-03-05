import { FindOptions, Transaction } from "sequelize";
import Tracking from "../../../database/models/Tracking";
import Vaccine from "../../../database/models/Vaccine";
import Antiparasitic from "../../../database/models/Antiparasitic";
import MedicalConsultation from "../../../database/models/MedicalConsultation";
import Pet from "../../../database/models/Pet";
import Veterinarian from "../../../database/models/Veterinarian";
import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";


// Function to start a transaction
export const beginTransaction = async (): Promise<Transaction> => {
  if (!Tracking.sequelize) {
    throw new Error("Sequelize instance is not available.");
  }
  return await Tracking.sequelize.transaction();
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

// Function to get all medical consultations
export const getAllTrackings = async (
  page: number,
  pageSize: number,
  name: any,
  transaction?: Transaction
): Promise<{ rows: Tracking[] }> => {
  const where: any = {
    id: { [Op.not]: null },
};

if (name) {
    where[Op.or] = [
        { '$Pet.name$': { [Op.like]: `%${name}%` } },
        Sequelize.literal(`EXISTS (SELECT 1 FROM MedicalConsultations mc INNER JOIN Veterinarians v ON mc.veterinarianId = v.id WHERE mc.trackingId = Tracking.id AND v.name LIKE '%${name}%')`)
    ];
}

  const options: FindOptions<Tracking> = {
    where: where,
    transaction: transaction,
    include: [
        {
            model: Pet,
            required: true,
        }, // Incluir el modelo de Pet
        {
            model: MedicalConsultation,
            required: true,
            include: [
                {
                    model: Veterinarian,
   
                },
            ],
        },
        { model: Antiparasitic },
        { model: Vaccine },
    ],
};

  if (page && pageSize) {
    options.offset = (page - 1) * pageSize;
    options.limit = pageSize;
    options.order = [["id", "ASC"]];
  }

  const { rows } = await Tracking.findAndCountAll(options);

  // const trackingsCount = await Tracking.count(options);

  return { rows};
};

// Function to search for trackings by a specific condition
export const findTrackings = async (
  condition: any,
  transaction?: Transaction
): Promise<Tracking[]> => {
  try {
    const trackings = await Tracking.findAll({
      where: condition,
      transaction,
      include: [Pet, MedicalConsultation, Antiparasitic, Vaccine], // Include all relations
    }); // Pass transaction to options
    return trackings;
  } catch (error: any) {
    throw new Error("Error searching for trackings: " + error.message);
  }
};

// Function to get a tracking by its ID
export const getTrackingById = async (
  id: number,
  transaction?: Transaction
): Promise<Tracking | null> => {
  try {
    const tracking = await Tracking.findByPk(id, {
      transaction,
      include: [Pet, MedicalConsultation, Antiparasitic, Vaccine], // Include all relations
    }); // Pass transaction to options
    return tracking;
  } catch (error: any) {
    throw new Error("Error getting the tracking by ID: " + error.message);
  }
};
