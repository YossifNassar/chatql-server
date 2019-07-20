var users = [{
    id: "y7",
    firstname: "Yossef",
    lastName: "Nassar",
    username: "ynassar",
    age: 27.2,
}]


class UsersDAO {
    constructor(pubsub) {
        this.pubsub = pubsub
    }

    createUser(input) {
        const found = users.find(u => u.id === input.id || u.username === input.username)
        if (found) {
            return new Error(`user already exists with username or id`)
        }
        const user = {
            id: input.id,
            firstname: input.firstname,
            lastName: input.lastName,
            username: input.username,
            age: input.age,
            channels: []
        }
        users.push(user)
        this.pubsub.publish('createUser', { onCreateUser: user });
        return user
    }

    getUserById(id) {
        console.log(`looking for user with id ${id}`)
        const user = users.find(user => user.id === id)
        if (!user) {
            throw new Error(`no user found matching id ${id}`)
        }
        return user
    }
}

export { UsersDAO }