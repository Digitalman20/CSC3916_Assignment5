#### Project overview:
> The purpose of this project to create a movies API. The API handles user authentication and authorization, the movies database to store the information like the title, movieID, genre, realease, and actors. It also supports reviews for specific movies.

#### Installation and Usage:
> To install the required packages run npm install.
The frontend is a react site and should include the following funtionality:
>> SignUp, SignIn, Get movies, Get specific movie, Add a movie, Delete a movie, update a movie, Add a new review, Get reviews, Get reviews for specific movie.

#### Postman collection
##### Tests include:
###### From assignment 3:
>Signup - both passing and failing ones

>Signin - both passing and failing ones; 
Create a movie (POST) - both passing and failing ones

>Read a movie (GET) - both passing and failing ones

>Update a movie (PUT) - passing test as failing one is just movie not found

>Delete a movie (DELETE) - passing test as failing one is just movie not found

###### New tests:
> Post reviews - valid movieID and invalid movieID; 

> Get movies with reviews query parameter

> Get reviews - passing case and failing case with invalid movieID

##### Collection access:
> Exported colelction and the environment shared under 'Postman collection' directory in this repo
> Deployment URL: https://csc3916-assignment4-ondj.onrender.com 

#### Environments
Server.js has environments for the database access and a secure token. 

