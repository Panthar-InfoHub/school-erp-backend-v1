import {Column, Model, PrimaryKey, Table, DataType, ForeignKey, BelongsTo, HasMany} from "sequelize-typescript";
import Student from "./student";
import ClassRoom from "./classRoom";
import ClassSection from "./classSections";
import StudentMonthlyFee from "./studentMonthlyFeeModel";

  @Table({
    indexes: [
      {
        unique: true,
        name: "unique_student_enrollment_session",
        fields: [
          "studentId",
          "classRoomId",
          "classSectionId",
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
    declare classRoomId: string;

    @Column @ForeignKey(() => ClassSection)
    declare classSectionId: string;

    @Column({ type: DataType.DATE })
    declare sessionStart: Date;

    @Column({ type: DataType.DATE })
    declare sessionEnd: Date;

    @Column({type: DataType.FLOAT})
    declare monthlyFee: number;

    @Column
    declare isActive: boolean;

    @Column
    declare isComplete: boolean;

    @BelongsTo(() => Student)
    declare student: Student;

    @BelongsTo(() => ClassRoom)
    declare classRoom: ClassRoom;

    @BelongsTo(() => ClassSection)
    declare classSection: ClassSection;

    @HasMany(() => StudentMonthlyFee)
    declare monthlyFees: StudentMonthlyFee[]

}