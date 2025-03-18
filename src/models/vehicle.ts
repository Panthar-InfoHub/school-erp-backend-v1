import {
    Column,
    Model,
    PrimaryKey,
    Table,
    Unique
} from "sequelize-typescript";


@Table
export default class Vehicle extends Model {

    @PrimaryKey @Column declare id:string
    
    @Unique @Column declare vehicleNumber:string

    @Column declare latest_lat:number

    @Column declare latest_long:number
    
}