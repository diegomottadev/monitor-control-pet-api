import { FindOptions, Transaction } from "sequelize";
import MedicalConsultation from "../../../database/models/MedicalConsultation";

// Function to start a transaction
export const beginTransaction = async (): Promise<Transaction> => {
  if (!MedicalConsultation.sequelize) {
    throw new Error("Sequelize instance is not available.");
  }
  return await MedicalConsultation.sequelize.transaction();
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

// Function to create a new medical consultation
export const createMedicalConsultation = async (
  consultationData: {
    petId: number;
    veterinarianId: number;
    date: Date;
    symptoms?: string;
    treatment?: string;
    notes?: string;
  },
  trackingId: number,
  transaction?: Transaction
): Promise<MedicalConsultation> => {
  try {
    // Create the medical consultation
    const consultation = await MedicalConsultation.create(
      {
        ...consultationData,
        trackingId: trackingId,
      },
      { transaction }
    );
    return consultation;
  } catch (error: any) {
    throw new Error("Error creating medical consultation: " + error.message);
  }
};

// Function to get all medical consultations
export const getAllMedicalConsultations = async (
  page: number,
  pageSize: number,
  where: any,
  transaction?: Transaction
): Promise<{ rows: MedicalConsultation[]; count: number }> => {
  const options: FindOptions<MedicalConsultation> = {
    where: where,
    transaction: transaction, // Pass transaction to options
  };

  if (page && pageSize) {
    options.offset = (page - 1) * pageSize;
    options.limit = pageSize;
    options.order = [["id", "ASC"]];
  }

  const { rows } = await MedicalConsultation.findAndCountAll(options);

  const consultationCount = await MedicalConsultation.count({ where });

  return { rows, count: consultationCount };
};

// Function to get a medical consultation by its ID
export const getMedicalConsultationById = async (
  id: number,
  transaction?: Transaction
): Promise<MedicalConsultation | null> => {
  try {
    const consultation = await MedicalConsultation.findByPk(id, { transaction }); // Pass transaction to options
    return consultation;
  } catch (error: any) {
    throw new Error("Error getting medical consultation by ID: " + error.message);
  }
};

// Function to update an existing medical consultation
export const updateMedicalConsultation = async (
  id: number,
  medicalConsultationData: {
    petId?: number;
    veterinarianId?: number;
    date?: Date;
    symptoms?: string;
    treatment?: string;
    notes?: string;
  },
  transaction?: Transaction
): Promise<MedicalConsultation | null> => {

    const [updatedRowsCount] = await MedicalConsultation.update(
      medicalConsultationData,
      {
        where: { id },
        transaction: transaction, // Pass transaction to options
      }
    );

    if (updatedRowsCount === 0) {
      return null; // No rows were updated
    }

    const updatedMedicalConsultation = await MedicalConsultation.findOne({
      where: { id },
    });
    return updatedMedicalConsultation;
};

// Function to delete an existing medical consultation
export const deleteMedicalConsultation = async (
  id: number,
  transaction?: Transaction
): Promise<number> => {
  try {
    const deletedRowsCount = await MedicalConsultation.destroy({
      where: { id },
      transaction: transaction, // Pass transaction to options
    });
    return deletedRowsCount;
  } catch (error: any) {
    throw new Error(
      "Error deleting medical consultation: " + error.message
    );
  }
};

// Function to search for medical consultations by a specific condition
export const findMedicalConsultations = async (
  condition: any,
  transaction?: Transaction
): Promise<MedicalConsultation[]> => {
  try {
    const medicalConsultations = await MedicalConsultation.findAll({
      where: condition,
      transaction, // Pass transaction to options
    });
    return medicalConsultations;
  } catch (error: any) {
    throw new Error(
      "Error searching for medical consultations: " + error.message
    );
  }
};
