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
import Post from "./post";

@Table({
  tableName: "post_likes",
  underscored: true,
  timestamps: false
})
export default class PostLikes extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @PrimaryKey
  @ForeignKey(() => Post)
  @Column(DataType.UUID)
  postId!: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  createdAt!: Date;
}
