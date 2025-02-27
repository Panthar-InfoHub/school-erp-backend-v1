import {BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import User from "./user";


@Table
export default class Admin extends Model {

    @PrimaryKey @Column @ForeignKey(() => User) declare id: string;

    @BelongsTo(() => User) declare user: User;
}