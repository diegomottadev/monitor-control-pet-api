// medicalConsultation.model.ts
import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import Pet from "./Pet";
import Veterinarian  from "./Veterinarian";
import Tracking from "./Tracking";

@Table({
  timestamps: true,
  paranoid: true,
  modelName: "MedicalConsultation",
})
export class MedicalConsultation extends Model {

  @ForeignKey(() => Pet)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  petId!: number;

  @BelongsTo(() => Pet)
  pet!: Pet;

  @ForeignKey(() => Veterinarian)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  veterinarianId!: number;

  @BelongsTo(() => Veterinarian, { foreignKey: 'veterinarianId' })
  veterinarian!: Veterinarian;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  date!: Date;

  @Column(DataType.TEXT)
  symptoms?: string;

  @Column(DataType.TEXT)
  treatment?: string;

  @Column(DataType.TEXT)
  notes?: string;

  @Column(DataType.DATE)
  deletedAt?: Date;

  @ForeignKey(() => Tracking)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  trackingId!: number;

  @BelongsTo(() => Tracking,{ foreignKey: 'trackingIdId' })
  tracking!: Tracking;
}
export default MedicalConsultation