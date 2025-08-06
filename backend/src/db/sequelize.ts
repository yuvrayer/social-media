import { Sequelize } from "sequelize-typescript";
import User from "../models/user";
import config from 'config'
import Post from "../models/post";
import Comment from "../models/comment";
import Follow from "../models/follow";
import Story from "../models/story";
import StoryView from "../models/sawStory";
import PendingFollowRequest from "../models/followRequest";

const logging = config.get<boolean>('sequelize.logging') ? console.log : false

const sequelize = new Sequelize({
    models: [User, Post, Comment, Follow, Story, StoryView, PendingFollowRequest],
    dialect: 'mysql',
    ...config.get('db'),
    logging,
})

User.belongsToMany(User, {
    through: Follow,
    as: 'followers',
    foreignKey: 'followeeId',
    otherKey: 'followerId',
})

User.belongsToMany(User, {
    through: Follow,
    as: 'following',
    foreignKey: 'followerId',
    otherKey: 'followeeId',
})

export default sequelize