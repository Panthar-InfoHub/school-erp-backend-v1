import {BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import Employee from "./employee";

@Table
export default class Teacher extends Model {

    @PrimaryKey @Column @ForeignKey(() => Employee) declare id: string;

    @BelongsTo(() => Employee) declare user: Employee;

}