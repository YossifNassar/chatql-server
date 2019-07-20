import { PubSub, withFilter } from 'apollo-server';
import { UsersDAO } from './data/users'
import { ChannelsDAO } from './data/channels'

const pubsub = new PubSub();
const usersDAO = new UsersDAO(pubsub)
const channelsDAO = new ChannelsDAO(pubsub, usersDAO)

const resolvers = {
    Query: {
        user: (parent, args, context, info) => {
            return usersDAO.getUserById(args.id)
        },
    },
    Mutation: {
        createUser: (parent, args, context, info) => {
            return usersDAO.createUser(args.input)
        },
        createMessage: (parent, args, context, info) => {
            const input = args.input
            return channelsDAO.createMessage(input)
        }
    },
    Subscription: {
        onCreateUser: {
            subscribe: () => pubsub.asyncIterator('createUser')
        },
        onCreateMessage: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('createMessage'),
                (payload, variables) => {
                    return payload.channelId === variables.channelId;
                }
            )
        }
    },
    User: {
        channels: (user) => {
            return channels.filter(channel => {
                const ch = channel.users.find(u => u.id === user.id)
                return ch != null
            })
        }
    }
};

export default resolvers