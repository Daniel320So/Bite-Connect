const google = require("./api_googlePlace")
const yelp = require("./api_yelp")

function RestaurantBrief(name, img, rating, numberOfReview, price) {
    this.name = name,
    this.img = img,
    this.rating = rating,
    this.numberOfReview = numberOfReview,
    this.price = price
}

// Search Restaurants by Type and Location
// Limitaion: Due to rate limit, cannot fetch all results
const searchRestaurantsByTypeAndLocation = async(type, location) => {

    let googleResult = (await google.searchRestaurantsByTypeAndLocation(type, location)).filter( r => r.numberOfReview != 0);
    let yelpResult = (await yelp.searchRestaurantsByTypeAndLocation(type, location)).filter( r => r.numberOfReview != 0);

    // console.log(googleResult);
    // console.log(yelpResult);

    // Combine results from 2 API
    let results = [];
    googleResult.forEach( async(g) => {
        // if has the same result in the top 30 results
        let y = yelpResult.find( y => y.name == g.name);
        if (y) {
            let price = g.price? y.price? (g.price + y.price)/2 : g.price : y.price //check whether there is a price
            results.push( new RestaurantBrief(
                g.name,
                g.image_url,
                (g.rating + y.rating)/2,
                g.review_count + y.review_count,
                price
            ))
            // Remove from yelpResults
            yelpResult = yelpResult.filter( y => y.name !== g.name);
        } else { 
            // Only Google Review is found
            results.push( new RestaurantBrief(
                g.name,
                g.image_url,
                g.rating,
                g.review_count,
                g.price
            ))
        }
    })

    //Handle Remaining Yelp Review
    yelpResult.forEach( y => {
        results.push( new RestaurantBrief(
            y.name,
            y.image_url,
            y.rating,
            y.review_count,
            y.price
        ))
    })

    results = results.sort((a, b) => b.rating - a.rating);
    console.log("results", results)
    return results;
}

module.exports = {
    searchRestaurantsByTypeAndLocation
};