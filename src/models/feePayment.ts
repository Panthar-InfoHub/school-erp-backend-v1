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

    @BelongsTo(() => Student, { onDelete: "CASCADE" }) // Cascade delete on student deletion
    declare student: Student;

    @BelongsTo(() => StudentEnrollment, { onDelete: "CASCADE" }) // Cascade delete on enrollment deletion
    declare studentEnrollment: StudentEnrollment;


}