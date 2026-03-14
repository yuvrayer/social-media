import { Sequelize } from "sequelize-typescript";
import User from "../models/user";
import config from 'config'
import Post from "../models/post";
import Comment from "../models/comment";
import Follow from "../models/follow";
import Story from "../models/story";
import StoryView from "../models/sawStory";
import PendingFollowRequest from "../models/followRequest";
import CommentLike from "../models/commentLike";
import PostLike from "../models/postLike";
import ChatParticipant from "../models/chatParticipant";
import Chat from "../models/chat";
import Message from "../models/message";
import StoryArchive from "../models/storyArchive";
import GamesBestScores from "../models/gamesBestScore";

const logging = config.get<boolean>('sequelize.logging') ? console.log : false

const sequelize = new Sequelize({
    models: [User, Post, Comment, Follow, Story, StoryView, PendingFollowRequest, CommentLike, PostLike,
        ChatParticipant, Chat, Message, StoryArchive, GamesBestScores
    ],
    dialect: 'mysql',
    ...config.get('db'),
    logging,
})


export default sequelize