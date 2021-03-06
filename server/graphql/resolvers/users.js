import User from '../../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {UserInputError} from 'apollo-server';
import { validateRegisterInput, validateLoginInput } from '../../utils/validators.js';

import {SECRET} from '../../config.js'
function genToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        preferredGenre1: user.preferredGenre1,
        preferredGenre2: user.preferredGenre2,
        preferredGenre3: user.preferredGenre3
    }, SECRET, {expiresIn: '2h'});
}

export default {
    Mutation : {
        async login(_, {username, password}){
            const { valid, errors} = validateLoginInput(username, password);
            if(!valid){
                throw new UserInputError('Incorrect Credentials', {errors})
            }
            const user = await User.findOne({username});
            if (!user){
                errors.general = 'User does not exist';
                throw new UserInputError('User does not exist', {errors})
            } 
            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = 'Incorrect Credentials';
                throw new UserInputError('Incorrect Credentials', {errors})
            }
            const token = genToken(user);
            return {
                ...user._doc,
                id: user._id,
                token
            }
        },
        async register(
            _,
            {
                registerInput: {username, email, password, confirmPassword, preferredGenre1, preferredGenre2, preferredGenre3}
            }, 
            context, 
            info)
            {
            //Validation
            const { valid, errors} = validateRegisterInput(username, email, password, confirmPassword)
            if (!valid){
                throw new UserInputError('Errors', {errors});
            }
            //Make sure user doesn't exist
            const user = await User.findOne({username});
            if (user){
                throw new UserInputError('username is taken', {
                    errors: {
                        username: 'Taken Username'
                    }
                })
            }
            //hash password and create auth token
            password  = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString(),
                preferredGenre1,
                preferredGenre2,
                preferredGenre3
            })
            const res = await newUser.save();
            const token = genToken(res);
            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}