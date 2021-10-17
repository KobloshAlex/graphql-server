const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const app = express();

const events = [];

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }
    
    input EventInput {
      title: String!
      description: String!
      price: Float!
    }
    
    type RootQuery {
      events: [Event!]!
    }
    
    type RootMutation {
      createEvent(eventInput: EventInput): Event
    }
  
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      events: () => events,
      createEvent: (args) => {
        const { description, price, title } = args.eventInput;
        const event = {
          _id: Math.random().toString(),
          title: title,
          description: description,
          price: Number(price),
          date: new Date().toString(),
        };
        events.push(event);

        return event;
      },
    },

    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ttjke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  )
  .catch((error) => {
    console.log(error);
  });

app.listen(3000, () => {
  console.log("server is up and running");
});
