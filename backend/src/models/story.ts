import {
    AllowNull,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    Default,
} from "sequelize-typescript";
import User from "./user";

@Table({
    tableName: "stories",
    timestamps: true, // automatically adds createdAt and updatedAt
    underscored: true, // use snake_case for column names if you want
})
export default class Story extends Model {

    @PrimaryKey
    @Default(DataType.UUIDV4)
    @AllowNull(false)
    @Column(DataType.UUID)
    id: string;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId: string;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    storyImgUrl: string;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    profileImgUrl: string;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    name: string;

    @BelongsTo(() => User)
    user: User;
}
