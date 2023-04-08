const yelp = require('yelp-fusion');

const apiKey = 'HbI8tXihOIcBVIEuj2ViNeKYam3BbpRy3TIoO2dxe4qkJ3uO0jFpWYKJTMmPX5_il3k5aDObEakibygtloWMzbed7-burCIy_mAaU8buOVJyQ0MK1WZ1ytz5-3ELZHYx';
const client = yelp.client(apiKey);

//Object Constructor

function YelpRestaurantResult(id, name, image_url, review_count, rating, price, phone, location) {
    this.id = id,
    this.name = name,
    this.image_url = image_url,
    this.review_count = review_count,
    this.rating = rating,
    this.price = price,
    this.phone = phone,
    this.location = location
};

function YelpReview(id, url, text, rating, userName, profileImage, time) {
    this.id = id,
    this.url = url,
    this.text = text,
    this.rating = rating,
    this.userName = userName,
    this.profileImage = profileImage,
    this.time = time,
    this.type = "YELP"
};

//Returns 30 restaurants on the searched location
const searchRestaurantsByTypeAndLocation = async(type, location) => {
    let results;
    let term = "";
    if (type && type !== "") term = `${type} `;
    term = term + "Restaurants";
    await client.search({term, location}).then(response => {
        const data = response.jsonBody.businesses.slice(0, 30);

        results = data.map( restaurant => new YelpRestaurantResult(
            restaurant.id,
            restaurant.name, 
            restaurant.image_url, 
            restaurant.review_count, 
            restaurant.rating, 
            restaurant.price ? restaurant.price.length: undefined,
            restaurant.phone, 
            restaurant.location.display_address.toString(),
        ))
    }).catch(e => {
        console.log(e);
    });

    return results;
};

//Returns 3 reviews on the restaurants (3 is the limit of the API)
const getReviewsByRestaurantId = async(id) => {
    let results;
    await client.reviews(id).then(response => {
        const data = response.jsonBody.reviews;
        results = data.map( review => new YelpReview(
            review.id,
            review.url, 
            review.text, 
            review.rating, 
            review.user.name,
            review.user.image_url,
            new Date(review.time_created).toLocaleString()
        ))
    }).catch(e => {
        console.log(e);
    });
    return results;
}

const getDetailsByRestaurantId = async(id) => {
    let results;
    await client.business(id).then(response => {
        const data = response.jsonBody;
        results = new YelpRestaurantResult(
            data.id,
            data.name, 
            data.image_url, 
            data.review_count, 
            data.rating, 
            data.price ? data.price.length: undefined,
            data.phone, 
            data.location.display_address.toString(),
        )
    }).catch(e => {
        console.log(e);
    });
    return results;
}

const getRestaurantDetailsByPlaceId = async(id) => {
    let results = {};
    results.reviews = await getReviewsByRestaurantId(id);
    results.details = await getDetailsByRestaurantId(id);
    return results;
}

module.exports = {
    searchRestaurantsByTypeAndLocation,
    getRestaurantDetailsByPlaceId
};