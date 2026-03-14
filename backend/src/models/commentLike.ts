import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  DataType,
  CreatedAt
} from "sequelize-typescript";
import User from "./user";
import Comment from "./comment";

@Table({
  tableName: "comment_likes",
  underscored: true,
  timestamps: false
})
export default class CommentLikes extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @PrimaryKey
  @ForeignKey(() => Comment)
  @Column(DataType.UUID)
  commentId!: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  createdAt!: Date;
}
