// antiparasitic.model.ts
import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import Tracking from "./Tracking";

enum ParasiteType {
  External = 'external',
  Internal = 'internal',
}

@Table({
  timestamps: true,
  paranoid: true,
  modelName: "Antiparasitic",
})
class Antiparasitic extends Model {

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.ENUM(...Object.values(ParasiteType)),
    allowNull: false,
  })
  type!: 'external' | 'internal';

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  dateApplied!: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  expirationDate!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  description?: string;

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
export default Antiparasitic