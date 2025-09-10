import {
    Table, Column, Model, DataType, PrimaryKey, Default, BelongsToMany, HasMany,
    CreatedAt,
} from 'sequelize-typescript';
import User from './user';
import Message from './message';
import ChatParticipant from './chatParticipant';

@Table({
    tableName: 'chats',
    timestamps: false,
    underscored: true,
})
export default class Chat extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.CHAR(36),
        allowNull: false,
    })
    id: string;

    @Column(DataType.STRING)
    name: string;

    @Default(null)
    @Column({
        type: DataType.STRING(255),
        allowNull: true,
        field: 'photo_url',
    })
    photoUrl: string | null;

    @Default(false)
    @Column(DataType.BOOLEAN)
    isGroup: boolean;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW
    })
    createdAt: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    updatedAt: Date;

    @BelongsToMany(() => User, () => ChatParticipant)
    participants: User[];

    @HasMany(() => Message)
    messages: Message[];

    @HasMany(() => ChatParticipant)
    ChatParticipants: ChatParticipant[]; // 👈 Add this for type safety
}