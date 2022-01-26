const express = require("express");
const mongose = require("mongoose");
const cors = require("cors");

const app = express();

const feed = require("./Schema/feeds.ts");

require("dotenv").config();

app.use(
  cors({
    origin: "*",
  })
);

const PORT = process.env.PORT;

app.get("/", async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const startIndex = (page - 1) * limit;

    const [response, count] = await Promise.all([
      feed.find({}).sort({ _id: -1 }).limit(limit).skip(startIndex),
      feed.find({}).count(),
    ]);

    console.log("responsePosts: ", response);
    console.log("count: ", count);

    res.json({ success: true, msg: "", payload: response, count: count });
  } catch (e) {
    res.status(401).json({ success: false, msg: "Could not get the posts!" });
  }
});

app.use(express.json());
app.post("/create-feed", async (req, res) => {
  console.log("req:", req);
  const body = req.body;
  console.log("body: ", body);
  const { title, content, createdAt } = body;
  try {
    const response = await feed.create({
      title,
      content,
      createdAt,
    });
    console.log("response: ", response);

    res.json({ success: true, msg: "", payload: response });
  } catch (e) {
    res
      .status(401)
      .json({ success: false, msg: "Could not create a new feed!" });
  }
});

mongose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => console.log("no connection", err));

app.listen(PORT, () => {
  console.debug(`Server is live at http://localhost:${PORT}`);
});
