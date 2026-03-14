import {
    Table, Column, Model, ForeignKey, BelongsTo,
    Default,
    DataType,
    PrimaryKey
} from 'sequelize-typescript';
import User from './user';

@Table({
    tableName: 'games_best_scores',
    underscored: true,
    timestamps: false
})
export default class GamesBestScores extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'user_id'
    })
    userId!: string;

    @Default(-1)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    bestScore!: number;

    @Column({
        type: DataType.CHAR(36),
        allowNull: false,
        field: 'game_code'
    })
    gameCode!: string;

    @BelongsTo(() => User)
    user!: User;
}