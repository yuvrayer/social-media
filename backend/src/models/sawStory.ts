import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    Default,
    AllowNull,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import User from "./user"; // adjust the import path as needed

@Table({
    tableName: "story_views",
    timestamps: true,
    underscored: true,
})

export default class StoryView extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @AllowNull(false)
    @Column(DataType.UUID)
    id: string;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({ field: "user_id_uploaded", type: DataType.UUID })
    userIdUploaded: string;

    @BelongsTo(() => User, "userIdUploaded")
    uploader: User;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({ field: "user_id_saw", type: DataType.UUID })
    userIdSaw: string;

    @BelongsTo(() => User, "userIdSaw")
    viewer: User;
}
