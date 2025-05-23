import {Column, DataType, Default, HasMany, HasOne, Model, PrimaryKey, Table, Unique} from "sequelize-typescript";
import Admin from "./admin";
import Teacher from "./teacher";
import {identityEntry} from "../types";
import EmployeeAttendance from "./employeeAttendance";


@Table
export default class Employee extends Model {
    @PrimaryKey @Column declare id: string;

    @Unique @Column declare email: string;

    @Column declare passwordHash: string;

    @Column declare name: string;
    
    @Column declare searchName: string;

    @Default("") @Column declare address: string

    @Default("") @Column declare fatherName: string

    @Default("") @Column declare motherName: string

    @Column declare dateOfBirth: Date;

    @Default("") @Column declare fatherPhone: string

    @Default("") @Column declare motherPhone: string

    @Default([]) @Column({type: DataType.JSON})
    declare ids: identityEntry[];
    
    @Default("") @Column
    declare phone: string ;

    @Column
    declare workRole: string

    @Default(0) @Column({type:DataType.FLOAT})
    declare salary: number

    @Default(true) @Column
    declare isActive: boolean

    @Default(false) @Column
    declare isFired: boolean

    @Column({
        type: DataType.BLOB("long"), // 'long' allows for large files
        allowNull: true,
        defaultValue: null,
    })
    declare profileImg: Buffer | null;

    @HasOne(() => Admin)
    declare admin: Admin;

    @HasOne(() => Teacher)
    declare teacherData: Teacher;
    
    @HasMany(() => EmployeeAttendance)
    declare attendance: EmployeeAttendance[]


}