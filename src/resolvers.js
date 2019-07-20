import { PubSub, withFilter } from 'apollo-server';
import uuidv1 from 'uuid/v1'

var users = [{
    id: "y7",
    firstname: "Yossef",
    lastName: "Nassar",
    username: "ynassar",
    age: 27.2,
    messages: []
}]

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

const resolvers = {
    Query: {
        user: (parent, args, context, info) => {
            console.log(`looking for user with id ${args.id}`)
            const user = users.find(user => user.id === args.id)
            if (!user) {
                throw new Error(`no user found matching id ${args.id}`)
            }
            return user
        },
    },
    Mutation: {
        createUser: (parent, args, context, info) => {
            const found = users.find(u => u.id === args.input.id || u.username === args.input.username)
            console.log(`args ${args}`)
            if (found) {
                return new Error(`user already exists with username or id`)
            }
            const user = {
                id: args.input.id,
                firstname: args.input.firstname,
                lastName: args.input.lastName,
                username: args.input.username,
                age: args.input.age,
                channels: [],
                messages: []
            }
            users.push(user)
            pubsub.publish('createUser', { onCreateUser: user });
            return user
        },
        createMessage: (parent, args, context, info) => {
            const input = args.input
            const generatedId = uuidv1();
            const date = Date.now();
            const user = users.find(u => u.id === input.userId)
            if (!user) {
                return new Error(`no user found matching id ${input.userId}`)
            }
            const channel = channels.find(c => c.id === input.channelId)
            if (!channel) {
                return new Error(`no channel found matching id ${input.channelId}`)
            }
            if(!channel.users.find(u => u.id === user.id)) {
                return new Error(`user with id ${user.id} is not authorized to send messages`+
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