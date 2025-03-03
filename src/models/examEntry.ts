import {
    AllowNull,
    BelongsTo,
    Column,
    DataType,
    Default,
    ForeignKey,
    Model,
    PrimaryKey,
    Table
} from "sequelize-typescript";
import StudentEnrollment from "./studentEnrollment";
import {subjectResult} from "../types";
import Student from "./student";


@Table({
    indexes: [
        {
            fields: ["studentId", "examDate"],
            unique: true,
        },
        {
            fields: ["enrollmentId", "examDate"],
            unique: true,
        }
    ]
})
export default class ExamEntry extends Model {

    @PrimaryKey @Column declare examEntryId:string

    @Column declare examName:string

    @Column @ForeignKey(() => Student) declare studentId:string

    @Default(null) @AllowNull(true) @Column({type: DataType.STRING}) declare note: string | null; // some extra info that might be included

    @Column @ForeignKey(() => StudentEnrollment)
    declare enrollmentId:string

    @Column declare examType:string // this can be pre-defined in front-end. CT/Half-Yearly/Yearly/Final

    @Column({ type: DataType.JSON })
    declare subjects: subjectResult[]

    @Column({ type: DataType.DATEONLY })
    declare examDate:Date

    @Default(true) @Column({
        type: DataType.BOOLEAN,
    }) declare studentPassed: boolean;

    @BelongsTo(() => StudentEnrollment)
    declare studentEnrollment:StudentEnrollment

    @BelongsTo(() => Student)
    declare student:Student

}