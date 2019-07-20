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
                }
            },
            Subscription: {
                onCreateUser: {
                    subscribe: () => this.pubsub.asyncIterator('createUser')
                },
                onCreateMessage: {
                    subscribe: withFilter(
                        () => this.pubsub.asyncIterator('createMessage'),
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
        }
    }
}

export { ResolversProvider }