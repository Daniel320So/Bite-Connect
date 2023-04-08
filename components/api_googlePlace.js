const API_KEY = "AIzaSyDTovu7zZTCP39wLMmAcC5PKC5YH5D1sQQ";

//Object Constructor
function GooglePlaceRestaurantResult(id, name, image_url, review_count, rating, price, location, phone) {
    this.id = id,
    this.name = name,
    this.image_url = image_url,
    this.review_count = review_count,
    this.rating = rating,
    this.price = price,
    this.location = location,
    this.phone = phone
};

function GoogleReview(text, rating, userName, profileImage, time) {
    this.text = text,
    this.rating = rating,
    this.userName = userName,
    this.profileImage = profileImage,
    this.time = time,
    this.type = "GOOGLE"
};

//Returns 30 restaurants on the searched type and location
const searchRestaurantsByTypeAndLocation = async(type, location) => {
    let results;
    const url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=";
    let query = "";
    if (type && type !== "") query = `${type}%20`;
    query = query + `restaurants%20in%20${location}&key=${API_KEY}`;
    await fetch(url + query)
    .then(async(response) => {
        const data = await response.json();
        results = data.results.slice(0, 30).map( restaurant => {
            return new GooglePlaceRestaurantResult(
                restaurant.place_id,
                restaurant.name,
                restaurant.photos? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${restaurant.photos[0].photo_reference}&key=${API_KEY}`: undefined,
                restaurant.user_ratings_total,
                restaurant.rating,
                restaurant.price_level,
                restaurant.formatted_address,
                restaurant.formatted_phone_number
            )
        });
    })
    return results;
}

const getRestaurantDetailsByPlaceId = async (id) => {
    let results = {};
    await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&key=${API_KEY}`)
    .then(async(response) => {
        const data = await response.json();
        results.details = new GooglePlaceRestaurantResult(
            data.result.place_id,
            data.result.name,
            data.result.photos? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${data.result.photos[0].photo_reference}&key=${API_KEY}`: undefined,
            data.result.user_ratings_total,
            data.result.rating,
            data.result.price_level,
            data.result.formatted_address,
            data.result.formatted_phone_number
        )
        results.reviews = data.result.reviews.map( review => {
            return new GoogleReview(
                review.text,
                review.rating,
                review.author_name,
                review.profile_photo_url,
                new Date(review.time * 1000).toLocaleString() //convert unix time to date
            );
        });
    })
    return results;
}

module.exports = {
    searchRestaurantsByTypeAndLocation,
    getRestaurantDetailsByPlaceId
};