const Event = require("../../models/events");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");

const events = async (eventsIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventsIds } });

    return events.map((event) => {
      return {
        ...event._doc,
        id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator),
      };
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);

    return {
      ...user._doc,
      _id: user._id,
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      console.log(`return list of events: ${events}`);

      return events.map((event) => {
        return {
          ...events._doc,
          _id: events._id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator),
        };
      });
    } catch (error) {
      console.error(
        `Error has been occurred during the fetch list of events query ${error}`
      );
      throw error;
    }
  },
  createEvent: async (args) => {
    try {
      const { description, price, title, date } = args.eventInput;

      const event = new Event({
        title,
        description,
        price,
        date: new Date(date),
        creator: "616f7c48b52a3deac01d5d09",
      });
      let createdEvent;

      const result = await event.save();
      console.log(`New document was saved to DB: ${result._doc}`);
      createdEvent = {
        ...result._doc,
        id: result._doc._id.toString(),
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result.creator),
      };
      const creator = await User.findById("616f7c48b52a3deac01d5d09");

      if (!creator) {
        throw new Error("User was not found");
      }
      creator.createdEvents.push(event);

      await creator.save();

      return createdEvent;
    } catch (error) {
      console.error(
        `Error has been occurred during the save mutation ${error}`
      );
      throw error;
    }
  },
  createUser: async (args) => {
    try {
      const { email, password } = args.userInput;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new Error("User exist already");
      }
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        email,
        password: hashedPassword,
      });
      const result = await user.save();

      return { ...result._doc, password: null, _id: result.id };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
