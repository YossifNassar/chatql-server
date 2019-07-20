import uuidv1 from 'uuid/v1'

var channels = []

class ChannelsDAO {
    constructor(pubsub, usersDAO) {
        this.pubsub = pubsub
        this.usersDAO = usersDAO
    }

    createMessage(input) {
        const generatedId = uuidv1();
        const date = Date.now();
        const user = this.usersDAO.getUserById(input.userId)
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
        channel.messages.push(message)
        this.pubsub.publish('createMessage', { onCreateMessage: message, channelId: input.channelId });
        return message
    }

    createChannel(input) {
        const channel = {
            id: uuidv1(),
            name: input.name,
            createdAt: Date.now(),
            users: [],
            messages: []
        }

        channels.push(channel)
        this.pubsub.publish('createChannel', { onCreateChannel: channel });
        return channel
    }

    addUserToChannel(channelId, userId) {
        const user = this.usersDAO.getUserById(userId)
        if (!user) {
            return new Error(`no user found matching id ${userId}`)
        }
        var channel = channels.find(ch => ch.id === channelId)
        if (!channel) {
            return new Error(`no channel found matching id ${channelId}`)
        }
        if (channel.users.find(u => u.id === user.id)) {
            return new Error("user already in channel")
        }
        channel.users.push(user)
        this.pubsub.publish('addUserToChannel', { onAddUserToChannel: user, userId: user.id, channelId: channelId });
        return user
    }

    getUserChannels(user) {
        return channels.filter(channel => {
            const ch = channel.users.find(u => u.id === user.id)
            return ch != null
        })
    }
}

export { ChannelsDAO }