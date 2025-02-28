import {Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import ClassRoom from "./classRoom";
import StudentEnrollment from "./studentEnrollment";


@Table
export default class ClassSection extends Model {

    @PrimaryKey @Column declare id:string

    @Column @ForeignKey(() => ClassRoom)
    declare classRoomId:string

    @Column declare name:string

    @Column declare isActive:boolean

    @Column({type:DataType.FLOAT})
    declare defaultFee:number

    @Column({type: DataType.JSON})
    declare subjects: subject[]

    @HasMany(() => StudentEnrollment)
    declare studentEnrollments: StudentEnrollment[]

}

type subject = {
    name: string,
    code: string,
    theoryExam: boolean,
    practicalExam: boolean,
}