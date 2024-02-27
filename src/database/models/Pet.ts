// pet.model.ts
import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import Tracking from "./Tracking";

@Table({
  timestamps: true,
  paranoid: true,
  modelName: "Pet",
  
})
class Pet extends Model {

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  species!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  breed?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    get() {
      const birthdate = this.getDataValue('birthdate');
      // Verificar si appliedDate es una instancia de Date y si no está vacío
      if (birthdate instanceof Date && !isNaN(birthdate.getTime())) {
        // Convertir la fecha al formato 'dd/mm/yyyy'
        return `${birthdate.getDate()}/${birthdate.getMonth() + 1}/${birthdate.getFullYear()}`;
      }
      return birthdate;
    },
  })
  birthdate?: Date;

  @Column({
    type: DataType.ENUM('small', 'medium', 'large'),
    allowNull: false,
  })
  size!: 'small' | 'medium' | 'large';

  @Column({
    type: DataType.ENUM('male', 'female', 'other'),
    allowNull: false,
  })
  gender!: 'male' | 'female' | 'other';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  color?: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  weight?: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isAdopted!: boolean;

  @Column(DataType.DATE)
  deletedAt?: Date;

  @ForeignKey(() => Tracking)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  trackingId!: number;

  @BelongsTo(() => Tracking)
  tracking!: Tracking;
}
export default Pet