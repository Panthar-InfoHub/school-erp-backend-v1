import {Column, HasOne, Model, PrimaryKey, Table} from "sequelize-typescript";
import Admin from "./admin";
import Teacher from "./teacher";
import Staff from "./staff";
import Driver from "./driver";


@Table
export default class User extends Model {
    @PrimaryKey @Column declare id: string;

    @HasOne(() => Admin)
    declare admin: Admin;

    @HasOne(() => Teacher)
    declare teacherData: Teacher;

    @HasOne(() => Staff)
    declare staffData: Staff;

    @HasOne(() => Driver)
    declare driverData: Driver;


}