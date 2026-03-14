import {
    Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo,
    Default,
} from 'sequelize-typescript';
import User from './user';
import Chat from './chat';

@Table({
    tableName: 'messages',
    underscored: true,
    timestamps: false
})
export default class Message extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.CHAR(36),
        allowNull: false,
    })
    id!: string;

    @ForeignKey(() => Chat)
    @Column({
        type: DataType.CHAR(36),
        allowNull: false,
    })
    chatId!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    senderId!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    content!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: `created_at`,
        defaultValue: DataType.NOW
    })
    createdAt!: Date;

    @Default(``)
    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    sentThroughStory!: string;

    @BelongsTo(() => Chat)
    chat!: Chat;

    @BelongsTo(() => User, { foreignKey: 'senderId', as: 'sender' })
    sender!: User;

}
