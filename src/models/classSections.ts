import {Column, DataType, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import ClassRoom from "./classRoom";


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

}

type subject = {
    name: string,
    code: string,
    theoryExam: boolean,
    practicalExam: boolean,
}