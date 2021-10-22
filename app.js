const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = express();

const Event = require("./models/events");
const User = require("./models/user");

app.use(bodyParser.json());

const events = (eventsIds) => {
  return Event.find({ _id: { $in: eventsIds } })
    .then((events) => {
      return events.map((event) => {
        return {
          ...event._doc,
          id: event.id,
          creator: user.bind(this, event.creator),
        };
      });
    })
    .catch((error) => {
      throw error;
    });
};
//16:00
const user = (userId) => {
  return User.findById(userId)
    .then((user) => {
      return {
        ...user._doc,
        _id: user._id,
        createdEvents: events.bind(this, user._doc.createdEvents),
      };
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
};

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
      creator: User!
    }
    
    type User {
      _id: ID!
      email: String!
      password:String
      createdEvents: [Event!]
    }
    
    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }
    
    input UserInput {
      email: String!
      password: String!
    }
    
    type RootQuery {
      events: [Event!]!
    }
    
    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }
  
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => {
            console.log(`return list of events: ${events}`);
            return events.map((event) => {
              return {
                ...events._doc,
                _id: events._id,
                creator: user.bind(this, event._doc.creator),
              };
            });
          })
          .catch((error) =>
            console.error(
              `Error has been occurred during the fetch list of events query ${error}`
            )
          );
      },
      createEvent: (args) => {
        const { description, price, title, date } = args.eventInput;

        const event = new Event({
          title,
          description,
          price,
          date: new Date(date),
          creator: "616f7c48b52a3deac01d5d09",
        });

        let createdEvent;

        return event
          .save()
          .then((result) => {
            console.log(`New document was saved to DB: ${result._doc}`);
            createdEvent = { ...result._doc };
            return User.findById("616f7c48b52a3deac01d5d09");
          })
          .then((user) => {
            if (!user) {
              throw new Error("User was not found");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then((result) => {
            return createdEvent;
          })
          .catch((error) => {
            console.error(
              `Error has been occurred during the save mutation ${error}`
            );
            throw error;
          });
      },
      createUser: (args) => {
        const { email, password } = args.userInput;
        return User.findOne({ email })
          .then((user) => {
            if (user) {
              throw new Error("User exist already");
            }
            return bcrypt.hash(password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => {
            return { ...result._doc, password: null, _id: result.id };
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });
      },
    },
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ttjke.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .catch((error) => {
    console.error(error);
  });

app.listen(3000, () => {
  console.log("server is up and running");
});
