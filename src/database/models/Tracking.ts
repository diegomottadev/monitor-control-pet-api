// tracking.model.ts
import { Table, Model, Column, DataType, ForeignKey, HasMany } from "sequelize-typescript";
import Pet from "./Pet";
import Antiparasitic from "./Antiparasitic";
import Vaccine from "./Vaccine";
import MedicalConsultation from "./MedicalConsultation";

@Table({
  timestamps: true,
  paranoid: true,
  modelName: "Tracking",
})
class Tracking extends Model {

  @ForeignKey(() => Pet)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  petId!: number;

  @HasMany(() => MedicalConsultation)
  consultations?: MedicalConsultation[];

  @HasMany(() => Antiparasitic)
  antiparasitics?: Antiparasitic[];

  @HasMany(() => Vaccine)
  vaccines?: Vaccine[];

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  dateApplied!: Date;

  @Column(DataType.TEXT)
  notes?: string;

  @Column(DataType.DATE)
  deletedAt?: Date;
}

export default Tracking;
