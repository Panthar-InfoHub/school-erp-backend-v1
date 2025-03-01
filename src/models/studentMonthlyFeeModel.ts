import {
    AllowNull,
    BelongsTo,
    Column,
    DataType, Default,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
} from "sequelize-typescript";
import StudentEnrollment from "./studentEnrollment";

@Table({
    // You could also add indexes if needed to ensure uniqueness per enrollment and month.
    indexes: [
        {
            unique: true,
            fields: ["studentEnrollmentId", "dueDate"],
        },
    ],
})
export default class StudentMonthlyFee extends Model {
    @PrimaryKey
    @Column
    declare id: string;

    // Link the fee entry to the enrollment record.
    @ForeignKey(() => StudentEnrollment)
    @Column
    declare studentEnrollmentId: string;

    // The month for which this fee entry applies.
    // Here we use DATE ONLY to focus on the date portion (for example, setting day to 1) without time specifics.
    @Column({ type: DataType.DATEONLY })
    declare dueDate: Date;

    // The fee due for this month (copied from StudentEnrollment.monthlyFee or overridden if necessary).
    @Column({ type: DataType.FLOAT })
    declare feeDue: number;

    // The total amount paid so far for this month’s fee.
    @Column({ type: DataType.FLOAT, defaultValue: 0 })
    declare amountPaid: number;

    // The balance remaining for this month after payments.
    // This can be calculated, but storing it directly could be useful for quick lookups.
    @Column({ type: DataType.FLOAT, defaultValue: 0 })
    declare balance: number;

    @Default(null) @AllowNull(true) @Column({ type: DataType.DATEONLY }) // Only set when fully paid!
    declare paidDate: Date | null;

    @BelongsTo(() => StudentEnrollment, { onDelete: "CASCADE" }) // Cascade delete when the enrollment is deleted
    declare studentEnrollment: StudentEnrollment;




}