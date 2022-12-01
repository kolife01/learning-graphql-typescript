import { GraphQLScalarType } from 'graphql'
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';

const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

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
    githubUser: 'gPlake',
    created: '3-28-1977'
  },
  {
    id: 2,
    name: 'test photos2',
    description: 'test d2',
    category: 'ACTION',
    githubUser: 'sSchmidt',
    created: '1-2-1977'
  },
  {
    id: 3,
    name: 'test photos3',
    description: 'test d3',
    category: 'ACTION',
    githubUser: 'sSchmidt',
    created: '2018-04-15T19:09:67.308Z'
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
        ...args.input,
        created: new Date()
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
  },
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value',
    parseValue: value => new Date(value as string),
    serialize: value => new Date(value as string).toISOString(),
    parseLiteral: ast => (ast as any).value
  })
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`Server ready at: ${url}`);