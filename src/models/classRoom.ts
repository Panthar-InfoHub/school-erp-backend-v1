import {Column, DataType, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import classSection from "./classSections";

@Table
export default class ClassRoom extends Model {

    @PrimaryKey @Column declare id:string

    @Column declare name:string

    @Column declare isActive:boolean

    @Column({type:DataType.FLOAT})
    declare defaultFee:number

    @HasMany(() => classSection)
    declare classSections: classSection[]

}