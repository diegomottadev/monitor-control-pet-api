// veterinarian.model.ts
import { Table, Model, Column, DataType, HasMany } from "sequelize-typescript";
import MedicalConsultation from "./MedicalConsultation";

@Table({
  timestamps: true,
  paranoid: true,
  modelName: "Veterinarian",
})
class Veterinarian extends Model {

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone?: string;

  @Column(DataType.DATE)
  deletedAt?: Date;

  @HasMany(() => MedicalConsultation, { foreignKey: 'veterinarianId' })
  consultations!: MedicalConsultation[];
}

export default Veterinarian