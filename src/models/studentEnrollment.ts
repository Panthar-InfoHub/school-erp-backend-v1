import {
    Column,
    Model,
    PrimaryKey,
    Table,
    DataType,
    ForeignKey,
    BelongsTo,
    HasMany,
    Default
} from "sequelize-typescript";
import Student from "./student";
import ClassRoom from "./classRoom";
import ClassSection from "./classSections";
import StudentMonthlyFee from "./studentMonthlyFeeModel";
import {subject} from "../types";
import ExamEntry from "./examEntry";
import FeePayment from "./feePayment";

  @Table({
    indexes: [
      {
        unique: true,
        name: "unique_student_enrollment_session",
        fields: [
          "studentId",
          "classroomId",
          "classroomSectionId",
          "sessionStart",
          "sessionEnd",
        ],
      },
    ],
  })

export default class StudentEnrollment extends Model {
    @PrimaryKey
    @Column
    declare id: string;

    @Column @ForeignKey(() => Student)
    declare studentId: string;

    @Column @ForeignKey(() => ClassRoom)
    declare classroomId: string;

    @Column @ForeignKey(() => ClassSection)
    declare classroomSectionId: string;

    @Column({ type: DataType.DATE })
    declare sessionStart: Date;

    @Column({ type: DataType.DATE })
    declare sessionEnd: Date;

    @Column({type: DataType.FLOAT})
    declare monthlyFee: number;
    
    @Column({type: DataType.FLOAT})
    declare one_time_fee: number;
    
    @Column({type: DataType.JSON})
    declare subjects: subject[]

    @Default(true) @Column
    declare isActive: boolean;

    @Default(false) @Column
    declare isComplete: boolean;

    @BelongsTo(() => Student)
    declare student: Student;


    @BelongsTo(() => ClassRoom)
    declare classRoom: ClassRoom;

    @BelongsTo(() => ClassSection)
    declare classSection: ClassSection;

    @HasMany(() => StudentMonthlyFee, { onDelete: "CASCADE", hooks: true }) // Cascade delete for monthly fees
    declare monthlyFees: StudentMonthlyFee[];

    @HasMany(() => ExamEntry)
    declare examDetails: ExamEntry[];
    
    @HasMany(() => FeePayment)
    declare feePayments: FeePayment[];


}