import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";
import ClassRoom from "./classRoom";
import StudentEnrollment from "./studentEnrollment";
import {subject} from "../types";


@Table({
    indexes: [
        {
            unique: true,
            name: "unique_class_section_name",
            fields: [
                "classRoomId",
                "name",
            ],
        },
    ]
})
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

    @BelongsTo(() => ClassRoom)
    declare classRoom: ClassRoom

    @HasMany(() => StudentEnrollment)
    declare studentEnrollments: StudentEnrollment[]

}

