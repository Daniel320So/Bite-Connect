const express = require("express");
const path = require("path");

const api = require("./components/api");

const app = express();
const port = process.env.PORT || "8888";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
//set up static path (for use with CSS, client-side JS, and image files)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (request, response) => {
  let restaurants = await api.searchRestaurantsByTypeAndLocation("", "Toronto");
  restaurants = restaurants.slice(0, 5);
  response.render("index", { title: "Home", restaurants });
});

app.get("/search/:", async (request, response) => {
});

//server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});