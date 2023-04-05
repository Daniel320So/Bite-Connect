const yelp = require('yelp-fusion');

const apiKey = 'HbI8tXihOIcBVIEuj2ViNeKYam3BbpRy3TIoO2dxe4qkJ3uO0jFpWYKJTMmPX5_il3k5aDObEakibygtloWMzbed7-burCIy_mAaU8buOVJyQ0MK1WZ1ytz5-3ELZHYx';
const client = yelp.client(apiKey);

//Object Constructor

function YelpRestaurantResult(id, name, image_url, review_count, rating, price, phone, location, categories = []) {
    this.id = id;
    this.name = name;
    this.image_url = image_url;
    this.review_count = review_count;
    this.rating = rating;
    this.price = price;
    this.phone = phone;
    this.location = location;
    this.categories = [];
    categories.forEach( c => this.categories.push(c.title));
}

function YelpReview(id, url, text, rating, userName) {
    this.id = id,
    this.url = url,
    this.text = text,
    this.rating = rating,
    this.userName = userName
}

//Returns 30 restaurants on the searched location
const searchRestaurantsByTypeAndLocation = async(type, location) => {
    let results;
    let term;
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
            restaurant.categories
        ))
    }).catch(e => {
        console.log(e);
    });


        // {
        //   id: 'MTHgT0rSQ56t-aWCJcnjVw',
        //   alias: 'yokai-izakaya-vaughan',
        //   name: 'Yokai Izakaya',
        //   image_url: 'https://s3-media2.fl.yelpcdn.com/bphoto/aJ5WDpKACZBVJvXYEYDxog/o.jpg',
        //   is_closed: false,
        //   url: 'https://www.yelp.com/biz/yokai-izakaya-vaughan?adjust_creative=TtHLb_1RvVt9MZf4qZooyw&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=TtHLb_1RvVt9MZf4qZooyw',       
        //   review_count: 37,
        //   categories: [ [Object], [Object], [Object] ],
        //   rating: 4.5,
        //   coordinates: { latitude: 43.82898, longitude: -79.53722 },
        //   transactions: [],
        //   location: {
        //     address1: '3175 Rutherford Road',
        //     address2: 'Unit 28',
        //     address3: '',
        //     city: 'Vaughan',
        //     zip_code: 'L4K 5Y6',
        //     country: 'CA',
        //     state: 'ON',
        //     display_address: [Array]
        //   },
        //   phone: '+16479302623',
        //   display_phone: '+1 647-930-2623',
        //   distance: 11268.731564023185
        // }

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
            review.user.name
        ))
    }).catch(e => {
        console.log(e);
    });
    return results;
}

module.exports = {
    searchRestaurantsByTypeAndLocation,
    getReviewsByRestaurantId
};