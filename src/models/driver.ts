import {AllowNull, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import User from "./user";
import Vehicle from "./vehicle";


@Table
export default class Driver extends Model {

    @PrimaryKey @Column @ForeignKey(() => User) declare id:string

    @AllowNull(true) @Column @ForeignKey(() => Vehicle) declare vehicle_id: string

    @BelongsTo(() => User) declare user: User;


    @BelongsTo(() => Vehicle)
    declare vehicle: Vehicle

}