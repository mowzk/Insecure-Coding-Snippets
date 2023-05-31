var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));

// H3LP?!
function sanitizeInput(input) {
    return input
}

// Route for the form
app.get('/', function(req, res){
    var html = `
    <html>
        <body>
            <form action="/submit" method="post">
                <label for="name">Name:</label><br>
                <input type="text" id="name" name="name"><br>
                <label for="homepage">Homepage:</label><br>
                <input type="text" id="homepage" name="homepage"><br>
                <input type="submit" value="Submit">
            </form>
        </body>
    </html>
    `;

    res.send(html);
});

app.post('/submit', function(req, res){
    var userName = req.body.name ? req.body.name : "John Doe";
    var userHomepage = req.body.homepage ? req.body.homepage : "https://exmaple.com";

    var html = `
        <html>
            <body>
                <h1>User Data</h1>
                <p>Name: ${sanitizeInput(userName)}</p>
                <p>Homepage: <a href="${sanitizeInput(userHomepage)}">${sanitizeInput(userHomepage)}</a></p>
            </body>
        </html>
    `;

    res.send(html);
});

app.listen(3000, function(){
    console.log('Example app listening on port 3000!');
});
