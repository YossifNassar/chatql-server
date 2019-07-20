import uuidv1 from 'uuid/v1'

var channels = [{
    id: "aaa111",
    name: "friends",
    createdAt: 1234556,
    users: [{
        id: "y7",
        firstname: "Yossef",
        lastName: "Nassar",
        username: "ynassar",
        age: 27.2,
    }],
    messages: []
},
{
    id: "aaa22",
    name: "friends",
    createdAt: 1234556,
    users: [],
    messages: []
}]

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
        if (channels.find(c => c.name === input.name)) {
            return new Error(`channel with name ${input.name} already exists!`)
        }

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
}

export { ChannelsDAO }