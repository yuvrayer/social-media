import {
    Table,
    Model,
    Column,
    DataType,
    ForeignKey,
    PrimaryKey,
    BelongsTo,
    Default
} from "sequelize-typescript";
import User from "./user";

@Table({
    tableName: "pending_follow_requests",
    underscored: true,
})

export default class PendingFollowRequest extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id: string

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    senderId: string

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    receiverId: string

    @BelongsTo(() => User, 'senderId')
    sender: User;

    @BelongsTo(() => User, 'receiverId')
    receiver: User;

}
