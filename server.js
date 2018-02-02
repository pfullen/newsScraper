var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');
var serverStatic = require('serve-static');
var clear = require('clear');
var path = require('path');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var request = require("request");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3015;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));


// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/mongoScarperDB", {
  useMongoClient: true
});

// Set Handlebars as the default templating engine
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
app.use('/', express.static(path.join(__dirname + '/public')));

// Routes

app.get("/", function(req, res) {
        res.sendFile(path.join(__dirname, "./public/home.html"));
    });




var articles = [];
// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  // Making a request for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
request('http://www.reuters.com/news/archive/technologyNews?view=page', function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var results = [];

  // (i: iterator. element: the current element)
  $("article.story").each(function(i, element) {
   
   var result = {};
          result.image = $(this).children('.story-photo.lazy-photo').children('a')
          .children('img').attr('src');
         const storyContent = $(this).children('.story-content');
         result.title = storyContent.children('a').children('h3').text(); 
         result.summary = storyContent.children('p').text();


    // Save these results in an object that we'll push into the results array we defined earlier
    articles.push(result)

    });
    console.log(articles)

    // If we were able to successfully scrape and save an Article, send a message to the client
    return res.redirect("articles");

  });
});


app.get("/articles", function(req, res) {
  
  console.log("These are the articles: " + articles)
  res.render("articles", {
    articles
  })

})




// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});