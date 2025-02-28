import {BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import Employee from "./employee";


@Table
export default class Admin extends Model {

    @PrimaryKey @Column @ForeignKey(() => Employee) declare id: string;

    @BelongsTo(() => Employee) declare user: Employee;
}