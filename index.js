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
  let restaurants = await api.searchRestaurantsByTypeAndLocation("", "Toronto, ON");
  restaurants = restaurants.slice(0, 5);
  response.render("index", { title: "Home", restaurants });
});

app.get("/search", async (request, response) => {
  let restaurants = await api.searchRestaurantsByTypeAndLocation(request.query.type, request.query.location);
  restaurants = restaurants.slice(0, 10);
  response.render("searchResult", { title: `${request.query.type} in ${request.query.location}`, restaurants });
});

app.get("/restaurant/googleId/:googleId/yelpId/:yelpId", async (request, response) => {
  console.log("params", request.params);
  let restaurant = await api.getRestaurantDetailsAndReviewById(request.params.googleId, request.params.yelpId);
  console.log("restaurants", restaurant)
  response.render("restaurant", { title: `${restaurant.details.name}`, restaurant });
});

//server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});