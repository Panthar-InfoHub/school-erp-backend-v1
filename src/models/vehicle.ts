import {
    AllowNull,
    Column,
    Default,
    ForeignKey,
    HasOne,
    Model,
    PrimaryKey,
    Table,
    Unique
} from "sequelize-typescript";
import Driver from "./driver";


@Table
export default class Vehicle extends Model {

    @PrimaryKey @Column declare id:string

    @Column @ForeignKey(() => Driver)
    declare driverId:string

    @Default(null) @AllowNull(true) @Column @ForeignKey(() => Vehicle) declare vehicle_id:string

    @Unique @Column declare vehicleNumber:string

    @Column declare latest_lat:number

    @Column declare latest_long:number

    @HasOne(() => Driver)
    declare driver:Driver

}