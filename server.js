/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');


var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.route('/movies')

/* GET all movies */

.get(authJwtController.isAuthenticated, async (req, res) => {

    try {

        // ✅ Check if query param exists
        if (req.query.reviews === 'true') {

            const movies = await Movie.aggregate([
                {
                    $lookup: {
                        from: "reviews",              // collection name in MongoDB
                        localField: "_id",            // Movie._id
                        foreignField: "movieID",      // Review.movieID
                        as: "reviews"                 // output array
                    }
                }
            ]);

            return res.status(200).json(movies);
        }

        // ✅ Default behavior (no aggregation)
        const movies = await Movie.find();
        res.status(200).json(movies);

    } catch (err) {

        res.status(500).json({
            message: "Error retrieving movies"
        });

    }

})
/* CREATE movie */

.post(authJwtController.isAuthenticated, async (req, res) => {

    if (!req.body.actors || req.body.actors.length === 0) {
        return res.status(400).json({
            message: "Movie must contain at least one actor"
        });
    }

    try {

        const movie = new Movie({
            title: req.body.title,
            releaseDate: req.body.releaseDate,
            genre: req.body.genre,
            actors: req.body.actors
        });

        await movie.save();

        res.status(201).json({
            message: "Movie created",
            movie: movie
        });

    } catch (err) {

        res.status(500).json({
            message: "Error creating movie" + err.message // Include error message for debugging
        });

    }

});

/* -------------------------
   Movies by Title
--------------------------*/

router.route('/movies/:title')

/* GET specific movie */

.get(authJwtController.isAuthenticated, async (req, res) => {

    try {

        const movie = await Movie.findOne({
            title: req.params.title
        });

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.json(movie);

    } catch (err) {

        res.status(500).json({
            message: "Error retrieving movie"
        });

    }

})

/* UPDATE movie */

.put(authJwtController.isAuthenticated, async (req, res) => {

    try {

        const movie = await Movie.findOneAndUpdate(
            { title: req.params.title },
            req.body,
            { new: true }
        );

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.json({
            message: "Movie updated",
            movie: movie
        });

    } catch (err) {

        res.status(500).json({
            message: "Error updating movie"
        });

    }

})

/* DELETE movie */

.delete(authJwtController.isAuthenticated, async (req, res) => {

    try {

        const movie = await Movie.findOneAndDelete({
            title: req.params.title
        });

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.json({
            message: "Movie deleted"
        });

    } catch (err) {

        res.status(500).json({
            message: "Error deleting movie"
        });

    }

});

router.route('/reviews')

/* GET all reviews */

.get(async (req, res) => {

    try {

        const reviews = await Review.find().populate('movieID', 'title');

        res.status(200).json(reviews);

    } catch (err) {

        res.status(500).json({
            message: "Error retrieving reviews"
        });

    }

})

/* CREATE review */

.post(authJwtController.isAuthenticated, async (req, res) => {

    try {

        const review = new Review({
            movieID: req.body.movieID,
            username: req.body.username,
            review: req.body.review,
            rating: req.body.rating
        });

        await review.save();

        res.status(201).json({
            message: "Review created",
            review: review
        });

    } catch (err) {

        res.status(500).json({
            message: "Error creating review" + err.message // Include error message for debugging
        });     
    }       
});

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


