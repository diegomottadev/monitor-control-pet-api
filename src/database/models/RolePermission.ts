import { Table, Model, Column, ForeignKey, DataType } from "sequelize-typescript"
import Permission  from "./Permission";
import  Role  from "./Role";


@Table({
    timestamps: false,
    modelName: "RolePermission",
  })
   class RolePermission extends Model {
    @ForeignKey(() => Role)
    @Column(DataType.INTEGER) // Specify the data type as INTEGER
    roleId!: number;
  
    @ForeignKey(() => Permission)
    @Column(DataType.INTEGER) 
    permissionId!: number;
  }

  export default RolePermission