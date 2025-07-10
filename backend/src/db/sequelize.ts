import { Sequelize } from "sequelize-typescript";
import User from "../models/user";
import config from 'config'
import Post from "../models/post";
import Comment from "../models/comment";
import Follow from "../models/follow";
import Story from "../models/story";

const logging = config.get<boolean>('sequelize.logging') ? console.log : false

const sequelize = new Sequelize({
    models: [User, Post, Comment, Follow, Story],
    dialect: 'mysql',
    ...config.get('db'),
    logging,
})

export default sequelize