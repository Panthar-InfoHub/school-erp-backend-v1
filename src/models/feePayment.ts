import {BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import Student from "./student";
import StudentEnrollment from "./studentEnrollment";


@Table
export default class FeePayment extends Model {

    @PrimaryKey @Column declare id:string

    @Column @ForeignKey(()=> StudentEnrollment) declare enrollmentId:string

    @Column @ForeignKey(() => Student)
    declare studentId:string

    @Column declare originalBalance:number

    @Column declare paidAmount:number

    @Column declare paidOn:Date

    @Column declare remainingBalance: number

    @BelongsTo(() => Student)
    declare student:Student

    @BelongsTo(() => StudentEnrollment)
    declare studentEnrollment:StudentEnrollment

}