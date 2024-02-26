// veterinarian.model.ts
import { Table, Model, Column, DataType } from "sequelize-typescript";

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
}

export default Veterinarian