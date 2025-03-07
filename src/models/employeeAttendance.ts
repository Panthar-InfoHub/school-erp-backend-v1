import {BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import Employee from "./employee";


@Table({
	indexes: [{
		unique: true,
		fields: ["employeeId", "date"]
	}]
})
export default class EmployeeAttendance extends Model {
	
	@PrimaryKey @Column declare attendanceId:string
	
	@Column @ForeignKey(() => Employee)
	declare employeeId:string
	
	@Column({type: DataType.DATEONLY})
	declare date:Date
	
	@Default(false)
	@Column
	declare isPresent:boolean
	
	@Column({type: DataType.TIME, allowNull: true})
	declare clockInTime:Date
	
	@Default(false)
	@Column
	declare isHoliday:boolean
	
	@Default(false)
	@Column
	declare isLeave:boolean
	
	@Column
	declare isInvalid:boolean // If we want to disable this entry for some reason since we don't want to allow deletion
	
	@BelongsTo(() => Employee)
	declare employee:Employee
	
}