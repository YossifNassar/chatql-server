import { withFilter } from 'apollo-server';

class ResolversProvider {
    constructor(pubsub, usersDAO, channelsDAO) {
        this.pubsub = pubsub;
        this.usersDAO = usersDAO
        this.channelsDAO = channelsDAO
    }

    provideResolvers() {
        return {
            Query: {
                user: (parent, args, context, info) => {
                    return this.usersDAO.getUserById(args.id)
                },
            },
            Mutation: {
                createUser: (parent, args, context, info) => {
                    return this.usersDAO.createUser(args.input)
                },
                createMessage: (parent, args, context, info) => {
                    const input = args.input
                    return this.channelsDAO.createMessage(input)
                },
                createChannel: (parent, args, context, info) => {
                    return this.channelsDAO.createChannel(args.input)
                },
                addUserToChannel: (parent, args, context, info) => {
                    return this.channelsDAO.addUserToChannel(args.channelId, args.userId)
                },
            },
            Subscription: {
                onCreateUser: {
                    subscribe: () => this.pubsub.asyncIterator('createUser')
                },
                onCreateChannel: {
                    subscribe: () => this.pubsub.asyncIterator('createChannel')
                },
                onCreateMessage: {
                    subscribe: withFilter(
                        () => this.pubsub.asyncIterator('createMessage'),
                        (payload, variables) => {
                            return payload.channelId === variables.channelId;
                        }
                    )
                },
                onAddUserToChannel: {
                    subscribe: withFilter(
                        () => this.pubsub.asyncIterator('addUserToChannel'),
                        (payload, variables) => {
                            return payload.channelId === variables.channelId || 
                                    payload.userId === variables.userId;
                        }
                    )
                }
            },
            User: {
                channels: (user) => {
                    return this.channelsDAO.getUserChannels(user)
                }
            }
        }
    }
}

export { ResolversProvider }