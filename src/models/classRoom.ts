import {Column, DataType, HasMany, Model, PrimaryKey, Table, Unique} from "sequelize-typescript";
import classSection from "./classSections";
import StudentEnrollment from "./studentEnrollment";

@Table
export default class ClassRoom extends Model {

    @PrimaryKey @Column declare id:string

    @Unique @Column declare name:string

    @Column declare isActive:boolean

    @Column({type:DataType.FLOAT})
    declare defaultFee:number

    @HasMany(() => classSection)
    declare classSections: classSection[]

    @HasMany(() => StudentEnrollment)
    declare studentEnrollments: StudentEnrollment[]

}