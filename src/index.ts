import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `
  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }
  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    postedBy: User!
    taggedUsers: [User!]!
  }
  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }
  type Mutation {
    postPhoto(name: String! description: String): Photo!
  }
`
let _id = 0
const users = [
  {githubLogin: "mHattrup", name: 'Mike'},
  {githubLogin: "gPlake", name: 'Glen'},
  {githubLogin: "sSchmidt", name: 'Scor'}
]
const photos = [
  {
    id: 1,
    name: 'test photos',
    description: 'test d',
    category: 'ACTION',
    githubUser: 'gPlake'
  },
  {
    id: 2,
    name: 'test photos2',
    description: 'test d2',
    category: 'ACTION',
    githubUser: 'sSchmidt'
  },
  {
    id: 3,
    name: 'test photos3',
    description: 'test d3',
    category: 'ACTION',
    githubUser: 'sSchmidt'
  }
]

const tags = [
  { photoID: 1, userID: 'gPlake'},
  { photoID: 2, userID: 'sSchmidt'},
  { photoID: 2, userID: 'mHattrup'},
  { photoID: 2, userID: 'gPlake'},
]

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },
  Mutation: {
    postPhoto(parent, args) {
      const newPhoto = {
        id: _id++,
        ...args
      }
      photos.push(args)
      return newPhoto
    }
  },
  Photo: {
    url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: parent => {
      return users.find(u => u.githubLogin === parent.githubUser)
    },
    taggedUsers: parent => tags.filter(tag => tag.photoID === parent.id)
                                .map(tag => tag.userID)
                                .map(userID => users.find(u => u.githubLogin === userID))
  },
  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin)
    },
    inPhotos: parent => tags.filter(tag => tag.userID === parent.id)
                            .map(tag => tag.photoID)
                            .map(photoID => photos.find(p => p.id === photoID))
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`Server ready at: ${url}`);