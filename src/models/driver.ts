import {AllowNull, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import Employee from "./employee";
import Vehicle from "./vehicle";


@Table
export default class Driver extends Model {

    @PrimaryKey @Column @ForeignKey(() => Employee) declare id:string

    @AllowNull(true) @Column @ForeignKey(() => Vehicle) declare vehicle_id: string

    @BelongsTo(() => Employee) declare user: Employee;


    @BelongsTo(() => Vehicle)
    declare vehicle: Vehicle

}