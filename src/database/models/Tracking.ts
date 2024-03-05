// tracking.model.ts
import { Table, Model, Column, DataType, ForeignKey, HasMany, BelongsTo } from "sequelize-typescript";
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
  
  @BelongsTo(() => Pet) 
  pet?: Pet;

  @HasMany(() => MedicalConsultation, 'trackingId')
  consultations?: MedicalConsultation[];

  @HasMany(() => Antiparasitic, 'trackingId')
  antiparasitics?: Antiparasitic[];

  @HasMany(() => Vaccine, 'trackingId')
  vaccines?: Vaccine[];

  @Column(DataType.TEXT)
  notes?: string;

  @Column(DataType.DATE)
  deletedAt?: Date;
}

export default Tracking;
