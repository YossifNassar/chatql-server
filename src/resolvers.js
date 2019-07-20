import { PubSub, withFilter } from 'apollo-server';
import uuidv1 from 'uuid/v1'
import { UsersDAO, users } from './data/users.js'

var channels = [{
    id: "aaa111",
    name: "friends",
    createdAt: 1234556,
    users: users,
    messages: []
},
{
    id: "aaa22",
    name: "friends",
    createdAt: 1234556,
    users: [],
    messages: []
}]


const pubsub = new PubSub();
const usersDAO = new UsersDAO(pubsub)

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
            const generatedId = uuidv1();
            const date = Date.now();
            const user = usersDAO.getUserById(input.userId)
            if (!user) {
                return new Error(`no user found matching id ${input.userId}`)
            }
            const channel = channels.find(c => c.id === input.channelId)
            if (!channel) {
                return new Error(`no channel found matching id ${input.channelId}`)
            }
            if (!channel.users.find(u => u.id === user.id)) {
                return new Error(`user with id ${user.id} is not authorized to send messages` +
                    ` in channel with id ${channel.id}`)
            }
            const message = {
                id: generatedId,
                text: input.text,
                owner: user,
                channel: channel,
                createdAt: date,
                updateAt: date
            }
            user.messages.push(message)
            channel.messages.push(message)
            pubsub.publish('createMessage', { onCreateMessage: message, channelId: input.channelId });
            return message
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