# Welcome to Coinpengin-Backend 👋
![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000)


This is the backend for Coinpengin. It is a simple server in Node.js using Express that stores and retrieves data from a MongoDB Database.

### ✨ [View Live Website here](https://coin-pengin.netlify.app/)
### ⚙️ [Backend Deployed on Heroku](https://crypto-price-tracker-backend.herokuapp.com/)

## Features
- Fetch user data from MongoDB database collection.
- Store user data to MongoDb database collection.
- Store user wishlist cryptocurrency in MongoDB.
- Generate and verify JSON Web Token as User Authentication.

## Installation

1. Clone this repo with `git clone https://github.com/syliow/coinpengin-backend.git` command.
2. Run `npm install` to install all the dependencies.
3. Run `npm run dev` to start the project.
4. Great! You will now have access to Coinpengin backend on your localhost at `localhost:5000`. 

## Deployment

- Deployed on [Heroku](https://www.heroku.com/)

## Technologies Used

* [Axios](https://axios-http.com/) - Used to make requests to Coingecko API
* [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) - Enables storing of passwords as hashed passwords instead of plaintext.
* [JSON Web Tokens](https://jwt.io/) - Used for User Authentication
* [Express](https://expressjs.com/) - Set up middlewares to respond to HTTP Requests
* [MongoDB](https://mongodb.com/) - Used to manage and store user account information
* [Node.js](https://nodejs.org/en/) - Used for listening to requests on a port
* [Moment.js](https://momentjs.com/) - Used to validate account registration date

## Room for improvement:
- Improve Code quality.

To do:
- Allow user to edit and update their personal information on profile page.

## Acknowledgements
- This project was inspired by Coingecko.
- This project was based on Coingecko's frontend design and their [API](https://www.coingecko.com/en/api)

## Contact
Created by [@Shanyi Liow](http://liowshanyi.website/) - feel free to contact me!



