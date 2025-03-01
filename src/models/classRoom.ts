import {Column, HasMany, Model, PrimaryKey, Table, Unique} from "sequelize-typescript";
import classSection from "./classSections";
import StudentEnrollment from "./studentEnrollment";

@Table
export default class ClassRoom extends Model {

    @PrimaryKey @Column declare id:string

    @Unique @Column declare name:string

    @Column declare isActive:boolean

    @HasMany(() => classSection, { onDelete: "CASCADE", hooks: true })
    declare classSections: classSection[];

    @HasMany(() => StudentEnrollment)
    declare studentEnrollments: StudentEnrollment[]

}