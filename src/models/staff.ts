import {
    BelongsTo,
    Column,
    DataType,
    Default,
    ForeignKey,
    Model,
    PrimaryKey,
    Table
} from "sequelize-typescript";
import User from "./user";


@Table
export default class Staff extends Model {


    @PrimaryKey @Column @ForeignKey(() => User) declare id:string

    @Default("") @Column declare address: string

    @Default("") @Column declare fatherName: string

    @Default("") @Column declare motherName: string

    @Column declare dateOfBirth: Date;

    @Default("") @Column declare fatherPhone: string

    @Default("") @Column declare motherPhone: string

    @Column
    declare workRole: string

    @Default(0) @Column({type:DataType.FLOAT})
    declare salary: number

    @Default(true) @Column
    declare isActive: boolean

    @Default(false) @Column
    declare isFired: boolean

    @BelongsTo(() => User)
    declare user: User;

}