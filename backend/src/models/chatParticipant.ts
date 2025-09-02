import {
    Table, Column, Model, ForeignKey, BelongsTo,
    Default,
    DataType
} from 'sequelize-typescript';
import User from './user';
import Chat from './chat';

@Table({
    tableName: 'chat_participants',
    underscored: true,
    timestamps: false
})
export default class ChatParticipant extends Model {
    @ForeignKey(() => Chat)
    @Column({
        type: 'char(36)',
        allowNull: false,
    })
    chatId: string;

    @ForeignKey(() => User)
    @Column({
        type: 'char(36)',
        allowNull: false,
    })
    userId: string;

    @Default(0)
    @Column(DataType.NUMBER)
    unreadMessages: Number;

    @BelongsTo(() => Chat)
    chat: Chat;

    @BelongsTo(() => User)
    user: User;
}
