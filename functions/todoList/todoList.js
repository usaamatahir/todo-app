const { ApolloServer, gql } = require("apollo-server-lambda");
const faunadb = require("faunadb");
const query = faunadb.query;
require("dotenv").config();

const typeDefs = gql`
  type Query {
    todos: [TODO!]!
  }

  type Mutation {
    addTodo(task: String): TODO!
    checkedTodo(id: ID!, done: Boolean): TODO
  }

  type TODO {
    id: ID!
    task: String!
    done: Boolean!
  }
`;

const resolvers = {
  Query: {
    todos: async (root, args, context) => {
      try {
        const client = new faunadb.Client({
          secret: process.env.TODO_FAUNA_SECRET_KEY,
        });

        const result = await client.query(
          query.Map(
            query.Paginate(query.Match(query.Index("all_todos"))),
            query.Lambda("X", query.Get(query.Var("X")))
          )
        );
        console.log(
          "Result : ",
          result.data.map((d) => {
            return {
              id: d.ref.id,
              task: d.data.task,
              done: d.data.done,
            };
          })
        );
        return result.data.map((d) => {
          return {
            id: d.ts,
            task: d.data.task,
            done: d.data.done,
          };
        });
      } catch (error) {
        console.log("ERROR : ", error);
      }
    },
  },

  Mutation: {
    addTodo: async (_, { task }) => {
      try {
        const client = new faunadb.Client({
          secret: process.env.TODO_FAUNA_SECRET_KEY,
        });

        const data = await client.query(
          query.Create(query.Collection("Todos"), {
            data: { task: task, done: false },
          })
        );
        console.log("DATA : ", data);
        return data;
      } catch (error) {
        console.log("Error : ", error);
      }
    },

    checkedTodo: async (_, { id, done }) => {
      try {
        const client = new faunadb.Client({
          secret: process.env.TODO_FAUNA_SECRET_KEY,
        });

        const data = await client.query(
          q.Update(q.Ref(q.Collection("Todos"), id), {
            data: { done: done },
          })
        );
        console.log("Data : ", data);
        return data;
      } catch (error) {}
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = server.createHandler();

module.exports = { handler };
