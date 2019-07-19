import  { PubSub }  from 'apollo-server';

var users = [{
    id: 7,
    firstname: "Yossef",
    lastName: "Nassar",
    username: "ynassar",
    age: 27.2
}]

var channels = [{
    id: "aaa111",
    name: "friends",
    createdAt: 1234556,
    users: users
},
{
  id: "aaa22",
  name: "friends",
  createdAt: 1234556,
  users: []
}]

const pubsub = new PubSub();

const resolvers = {
    Query: {
      user: (parent, args, context, info) => {
        console.log(`looking for user with id ${args.id}`)
        const user = users.find(user => user.id === args.id)
        if(!user) {
          throw new Error(`no user found matching id ${args.id}`)
        }
        return user
      },
    },
    Mutation: {
      createUser: (parent, args, context, info) => {
        const found = users.find(u => u.id === args.input.id || u.username === args.input.username)
        console.log(`args ${args}`)
        if(found) {
          return new Error(`user already exists with username or id`)
        }
        const user = {
          id: args.input.id,
          firstname: args.input.firstname,
          lastName: args.input.lastName,
          username: args.input.username,
          age: args.input.age
        }
        pubsub.publish('createUser', { onCreateUser: user });
        users.push(user)
        return user
      }
    },
    Subscription: {
      onCreateUser: {
        subscribe: () => pubsub.asyncIterator('createUser')
      }
    },
    User: {
        channels: (user) =>  {
          return channels.filter(channel => { 
              const ch = channel.users.find(u => u.id === user.id)
              return ch != null
          })
        }
    }
  };

export default resolvers