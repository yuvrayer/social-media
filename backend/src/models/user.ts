import {
    AllowNull,
    BelongsToMany,
    Column,
    DataType,
    Default,
    HasMany,
    Index,
    Model,
    PrimaryKey,
    Table
} from "sequelize-typescript";
import Post from "./post";
import Comment from "./comment";
import PendingFollowRequest from "./followRequest";
import PostLike from "./postLike";
import CommentLike from "./commentLike";
import Chat from "./chat";
import Message from "./message";
import ChatParticipant from "./chatParticipant";
import Story from "./story";
import StoryArchive from "./storyArchive";

@Table({
    underscored: true,
})
export default class User extends Model {

    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id: string

    @AllowNull(false)
    @Column(DataType.STRING(40))
    name: string

    @Index({ unique: true })
    @AllowNull(false)
    @Column(DataType.STRING(40))
    username: string

    @AllowNull(false)
    @Column(DataType.STRING(64))
    password: string

    @AllowNull(true)
    @Column(DataType.STRING(255))
    profileImgUrl: string

    @HasMany(() => Post, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    posts: Post[]

    @HasMany(() => PostLike)
    postLikes: PostLike[]

    @HasMany(() => Comment)
    comments: Comment[]

    @HasMany(() => CommentLike)
    commentLikes: CommentLike[]

    // @BelongsToMany(() => User, () => Follow, 'followeeId', 'followerId')
    followers: User[]

    // @BelongsToMany(() => User, () => Follow, 'followerId', 'followeeId')
    following: User[]


    @HasMany(() => PendingFollowRequest, 'senderId')
    sentFollowRequests: PendingFollowRequest[];

    @HasMany(() => PendingFollowRequest, 'receiverId')
    receivedFollowRequests: PendingFollowRequest[];

    @BelongsToMany(() => Chat, () => ChatParticipant)
    chats: Chat[];

    // Messages sent by this user
    @HasMany(() => Message, `senderId`)
    messages: Message[];

    @HasMany(() => Story, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    stories: Story[];

    @HasMany(() => StoryArchive, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    storiesArchive: StoryArchive[];
}
