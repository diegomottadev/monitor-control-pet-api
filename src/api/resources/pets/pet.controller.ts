import { FindOptions, Transaction } from 'sequelize';
import Pet from '../../../database/models/Pet';
import Tracking from '../../../database/models/Tracking';

// Function to start a transaction
export const beginTransaction = async (): Promise<Transaction> => {
  if (!Pet.sequelize) {
    throw new Error('Sequelize instance is not available.');
  }
  return await Pet.sequelize.transaction();
};

// Function to commit a transaction
export const commitTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    await transaction.commit();
    return true; // Transaction was successfully committed
  } catch (error) {
    console.error('Error committing transaction:', error);
    return false; // There was an error committing the transaction
  }
};

// Function to rollback a transaction
export const rollbackTransaction = async (transaction: Transaction): Promise<void> => {
  await transaction.rollback();
};

// Function to create a new pet
export const createPet = async (petData: {
  name: string;
  species: string;
  breed?: string;
  birthdate?: Date;
  size: 'small' | 'medium' | 'large';
  gender: 'male' | 'female' | 'other';
  color?: string;
  description?: string;
  weight?: number;
  isAdopted: boolean;
}, transaction?: Transaction): Promise<Pet> => {
  const { birthdate } = petData;
  const parsedBirthdate = birthdate ? new Date(birthdate) : undefined;

  let tracking;
  try {
    // Create the pet and tracking
    const pet = await Pet.create({ ...petData, birthdate: parsedBirthdate }, { transaction });
    tracking = await Tracking.create({ petId: pet.id }, { transaction });
    await Pet.update({ trackingId: tracking.id }, {
      where: { id: pet.id },
      transaction
    });
    return pet;
  } catch (error: any) {
    if (tracking) await tracking.destroy({ force: true, transaction });
    throw new Error('Error creating the pet: ' + error.message);
  }
};

// Function to get all pets
export const getAllPets = async (
  page: number,
  pageSize: number,
  where: any,
  transaction?: Transaction
): Promise<{ rows: Pet[]; count: number }> => {
  const options: FindOptions<Pet> = {
    where: where,
    transaction: transaction // Pass transaction to options
  };

  if (page && pageSize) {
    options.offset = (page - 1) * pageSize;
    options.limit = pageSize;
    options.order = [["id", "ASC"]];
  }

  const { rows } = await Pet.findAndCountAll(options);

  const userCount = await Pet.count({ where });

  return { rows, count: userCount };
};

// Function to get a pet by its ID
export const getPetById = async (id: number, transaction?: Transaction): Promise<Pet | null> => {
  try {
    const pet = await Pet.findByPk(id, { transaction }); // Pass transaction to options
    return pet;
  } catch (error: any) {
    throw new Error('Error getting the pet by ID: ' + error.message);
  }
};

// Function to update an existing pet
export const updatePet = async (
  id: number,
  petData: {
    name?: string;
    species?: string;
    breed?: string;
    birthdate?: Date;
    size?: 'small' | 'medium' | 'large';
    gender?: 'male' | 'female' | 'other';
    color?: string;
    description?: string;
    weight?: number;
    isAdopted?: boolean;
    trackingId?: number;
  },
  transaction?: Transaction
): Promise<Pet | null> => {
  try {
    const [updatedRowsCount] = await Pet.update(petData, {
      where: { id },
      transaction: transaction // Pass transaction to options
    });

    if (updatedRowsCount > 0) {
      const updatedPet = await Pet.findByPk(id);
      return updatedPet;
    } else {
      return null; // Return null if the pet was not found or not updated
    }
  } catch (error: any) {
    throw new Error('Error updating the pet: ' + error.message);
  }
};

// Function to delete an existing pet
export const deletePet = async (id: number, transaction?: Transaction): Promise<number> => {
  try {
    const deletedRowsCount = await Pet.destroy({
      where: { id },
      transaction: transaction // Pass transaction to options
    });
    return deletedRowsCount;
  } catch (error: any) {
    throw new Error('Error deleting the pet: ' + error.message);
  }
};

// Function to search for pets by a specific condition
export const findPets = async (condition: any, transaction?: Transaction): Promise<Pet[]> => {
  try {
    const pets = await Pet.findAll({ where: condition, transaction }); // Pass transaction to options
    return pets;
  } catch (error: any) {
    throw new Error('Error searching for pets: ' + error.message);
  }
};
