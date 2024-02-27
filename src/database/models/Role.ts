import { Table, Model, Column, DataType, BeforeValidate, BelongsToMany } from "sequelize-typescript"
import Permission  from "./Permission";
import RolePermission  from "./RolePermission";

@Table({
  timestamps: true,
  paranoid: true,
  modelName: "Role",
})
 class Role extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  // Define the many-to-many association with permissions
  @BelongsToMany(() => Permission, () => RolePermission)
  permissions!: Permission[];


  @BeforeValidate
  static async checkUniqueName(role: Role) {
    const existingRole = await Role.findOne({
      where: { name: role.name },
    });

    if (existingRole && existingRole.id !== role.id) {
      throw new Error("Role name must be unique");
    }
  }

  toJSON(): any {
    const values = { ...this.get() };
    values.permissions = this.permissions; // Include permissions
    return values;
  }
}

export default Role