import {AllowNull, Column, DataType, Default, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import StudentEnrollment from "./studentEnrollment";


@Table
export default class Student extends Model {

    @PrimaryKey @Column declare id:string

    @Column declare name:string

    @Column declare searchName:string

    @Column declare address:string

    @Column declare dateOfBirth:Date

    @Column declare fatherName:string

    @Column declare motherName:string

    @Default(null) @AllowNull(true) @Column declare fatherPhone:string

    @Default(null) @AllowNull(true) @Column declare motherPhone:string

    @Default(true) @Column declare isActive:boolean

    @Default(false) @Column({type: DataType.JSON})
    declare ids: identityEntry[];

    @Column({
        type: DataType.BLOB("long"), // 'long' allows for large files
        allowNull: true,
        defaultValue: null,
    })
    declare profileImg: Buffer;

    @HasMany(() => StudentEnrollment, { onDelete: "CASCADE", hooks: true }) // Cascade delete
    declare studentEnrollments: StudentEnrollment[];


}

type identityEntry = {
    idDocName:string,
    idDocValue:string
}