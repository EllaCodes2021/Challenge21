const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");
const { User, Book } = require("../models");


const resolvers = {
  //obtain user query
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password");

          return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation:{
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      // wait for sign up and then assign token to user
      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      // auth failure: email 
      if (!user) {
        throw new AuthenticationError('Email or password are incorrect. Please try again!');
      }

      const correctPw = await user.isCorrectPassword(password);
    // auth failure: password 
      if (!correctPw) {
        throw new AuthenticationError('Email or password are incorrect. Please try again!');
      }
    },
    saveBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args.input } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('Please log in to save your information.')
    },
    removeBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('Please log in to delete this information.');
    },
  
  },
}
  module.exports = resolvers;