const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const app = express();

const graphqlSchema = require("./graphql/schemas");
const graphqlResolver = require("./graphql/resolvers");

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
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
