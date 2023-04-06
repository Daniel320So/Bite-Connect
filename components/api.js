const google = require("./api_googlePlace")
const yelp = require("./api_yelp")

function Restaurant(name, img, googleId, googleRating, googleReviews, yelpId, yelpRating, yelpReviews) {
    this.name = name,
    this.img = img,
    this.googleId = googleId,
    this.googleRating = googleRating,
    this.googleReviews = googleReviews,
    this.yelpId = yelpId,
    this.yelpRating = yelpRating,
    this.yelpReviews = yelpReviews
}

// Search Restaurants by Type and Location => combine results from Google Place & Yelp
// Limitaion: Due to rate limit, cannot fetch all results
const searchRestaurantsByTypeAndLocation = async(type, location) => {

    let googleResult = (await google.searchRestaurantsByTypeAndLocation(type, location)).filter( r => r.numberOfReview !== 0);
    let yelpResult = (await yelp.searchRestaurantsByTypeAndLocation(type, location)).filter( r => r.numberOfReview !== 0);

    // Combine results from 2 API
    let results = [];
    googleResult.forEach( async(g) => {
        // if has the same result in the top 30 results
        let y = yelpResult.find( y => y.name == g.name);
        if (y) {
            results.push( new Restaurant(
                g.name,
                g.image_url,
                g.id,
                g.rating,
                g.review_count,
                y.id,
                y.rating,
                y.review_count
            ))
            // Remove from yelpResults
            yelpResult = yelpResult.filter( y => y.name !== g.name);
        } else { 
            // Only Google Review is found
            results.push( new Restaurant(
                g.name,
                g.image_url,
                g.id,
                g.rating,
                g.review_count,
                "No_ID",
                null,
                null
            ))
        }
    })

    //Handle Remaining Yelp Review
    yelpResult.forEach( y => {
        results.push( new Restaurant(
            y.name,
            y.image_url,
            "No_ID",
            null,
            null,
            y.id,
            y.rating,
            y.review_count
        ))
    })

    // Sort by the ratings
    results = results.sort((a, b) => {
        let aRating = Math.max(a.googleRating, a.yelpRating);
        let bRating = Math.max(b.googleRating, b.yelpRating);
        return bRating - aRating;
    });

    return results;
}

const getRestaurantDetailsAndReviewById = async(googleId, yelpId) => {

    let googleResult, yelpResult;
    let results = {
        restaurant: null,
        googleReviews: null,
        yelpReviews: null
    }; 

    // Get place details and reviews on google
    if (googleId && googleId !== "No_ID") {
        googleResult = await google.getRestaurantDetailsByPlaceId(googleId); 
        results.googleReviews = googleResult.reviews;
    }

    // Get place details and reviews on Yelp
    if (yelpId && yelpId !== "No_ID") {
        yelpResult = await yelp.getRestaurantDetailsByPlaceId(yelpId); 
        results.yelpReviews = yelpResult.reviews;
    }

    // Construct new Restaurant Object
    results.details = new Restaurant(
        googleResult? googleResult.details.name : yelpResult.details.name,
        googleResult? googleResult.details.image_url : yelpResult.details.image_url,
        googleResult? googleResult.details.id: "No_ID",
        googleResult? googleResult.details.rating: null,
        googleResult? googleResult.details.review_count: null,
        yelpResult? yelpResult.details.id: "No_ID",
        yelpResult? yelpResult.details.rating: null,
        yelpResult? yelpResult.details.review_count: null
    );

    return results;
}

module.exports = {
    searchRestaurantsByTypeAndLocation,
    getRestaurantDetailsAndReviewById
};