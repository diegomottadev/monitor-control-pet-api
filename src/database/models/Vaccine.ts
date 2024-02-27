// vaccine.model.ts
import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import Tracking from "./Tracking";

@Table({
  timestamps: true,
  paranoid: true,
  modelName: "Vaccine",
})
class Vaccine extends Model {

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  dateApplied!: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true, // Por defecto, suponemos que la vacuna tiene fecha de vencimiento
  })
  hasExpiration!: boolean;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  expirationDate?: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  nextVaccineDate?: Date;

  @BelongsTo(() => Vaccine, 'nextVaccineId')
  nextVaccine?: Vaccine;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Por defecto, no recordar la siguiente vacuna
  })
  rememberNextVaccine!: boolean;

  @Column(DataType.DATE)
  deletedAt?: Date;

  @ForeignKey(() => Tracking)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  trackingId!: number;

  @BelongsTo(() => Tracking)
  tracking!: Tracking;
}
export default Vaccine