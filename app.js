
var mysql = require('./dbcon.js') // Set Up MySql: Export pool from module known as pool (in dbcon.js) and save that module to var mysql, allowing access via mysql.pool

var express = require('express') // Express module setup
var app = express()

var handlebars = require('express-handlebars').create({ defaultLayout: 'main' }) // Express-handlebars module set up
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', 5844) // Set Up Port

app.use(express.static('public')) // Setup static files in public directory


// DISPLAY root command
// Show everything in the database on the index.handlebars page, on the root URL
app.get('/', function (req, res, next) {

    var context = {} // Empty JavaScript object


    /* Run connection to server pool, pass query to select rows and columns from table called 'workouts'
    and run callback function for when query returns results, passing it the rows from the 'workouts' table */
    mysql.pool.query('SELECT * FROM `workouts`', function (err, rows, fields) {

        if (err) { // Always start with potential error handling
            next(err)
            return
        }

        /* Display 'workouts' table by creating empty list object, using a for-loop to pull parameters (id, name, etc) 
        for each row (synonymous with an individual exercise), then push those parameters into their associated key pairing for each row.
        This generates a JavaScript list of the exercises found on the SQL 'workouts' table. */
        var exerList = []

        for (var i in rows) {
            exerList.push({ 'id': rows[i].id, 'name': rows[i].name, 'reps': rows[i].reps, 'weight': rows[i].weight, 'date': rows[i].date, 'lbs': rows[i].lbs })
        }

        // For the 'context' JavaScript object, pair the 'workouts' key with the newly generated 'exerList' list
        context.workouts = exerList;

        /* Display 'exerList' list via express-handlebars render command. 
        index.handlebars displays the table by first rendering the 'context' object. It then uses the 'workouts' key of the 'context' object to access
        each entry ("row") in the 'exerList' list value via {{#each: workouts}} at the location of the table. Every parameter for each "row" that 
        was pushed into the 'exerList' list is then accessed and displayed directly based on the naming format designated in the above for-loop 
        via JavaScript's 'this'*/
        res.render('index', context)

    })
})


// INSERTION command
app.get('/add', function (req, res, next) {

    var context = {}

    /* Insert row into 'workouts' table via SQL INSERT command with names of parameters to be inserted corresponding to 'input' names on 'newExercise' form and script.js.
    Pass array of user input parameters to 'workouts' table via 'req.query' method which contains property for each query string parameter in /add route. 
    Then pair the 'workouts' key for the 'context' JavaScript object with the insert id 'insertId'. */
    mysql.pool.query("INSERT INTO `workouts` (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)", // Prevent execution with '?' for each input
        [req.query.exercise, req.query.reps, req.query.weight, req.query.date, req.query.lbs], function (err, result) { // Pass array of parameters to fill in each '?'

            if (err) {
                next(err)
                return
            }

            context.workouts = "Inserted ID: " + result.insertId

            /* Cannot use 'render' like module example. Need to convert context object into JSON string via JSON.stringify.
            Then use Express.js 'res.send' method to send JSON string as HTTP response to server for actual insertion of data into database. */
            res.send(JSON.stringify(context))
        })
})


// DELETE command
app.get('/delete', function (req, res, next) {

    // Remove exercise entry from 'workouts' table via SQL command. Client-side removal is handled through JavaScript function mapped to delete-button. 
    // Absence of this function and presence of client-side function would allow 'workouts' table to log every exercise datapoint even if user deletes it.
    mysql.pool.query("DELETE FROM `workouts` WHERE id = ?", [req.query.id], function (err, result) { // Delete the row matching the id given from the workouts table.

        if (err) {
            next(err)
            return
        }
    })
})


// EDIT command
app.get('/updateExercise', function (req, res, next) {

    var context = {}

    /* HTML anchor tag <a> is implemented on index.handlebars to then reference EDIT command for whichever entry based on it's unique ID via {{this.id}}.
    Upon click, entry to be edited is selected based on ID from 'workouts' table. Array/list 'exerciseList' and then populated with object containing input. 
    Input object then is declared value for 'workouts' key of 'context' object and rendered for updatedExercise.handlebars. */
    mysql.pool.query('SELECT * FROM `workouts` WHERE id=?', [req.query.id], function (err, rows, fields) {
        if (err) {
            next(err)
            return
        }

        var exerciseList = [{ 'id': rows[0].id, 'name': rows[0].name, 'reps': rows[0].reps, 'weight': rows[0].weight, 'date': rows[0].date, 'lbs': rows[0].lbs }]

        context.workouts = exerciseList[0]
        res.render('updateExercise', context)
    })
})


// UPDATE TABLE
app.get('/updateTable', function (req, res, next) {

    var context = {}

    /* Similar logic to INSERTION command and root DISPLAY command. Once SQL 'UPDATE' function is ran and '?' place holders are populated via user
    in the updateExercise.handlebars file, repeat code found in DISPLAY command to show new table with recent addition */
    mysql.pool.query("UPDATE `workouts` SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id = ?", [req.query.exercise, req.query.reps, req.query.weight, req.query.date, req.query.lbs, req.query.id], function (err, result) {
        mysql.pool.query('SELECT * FROM `workouts`', function (err, rows, fields) {
            if (err) {
                next(err)
                return
            }

            var exerList = []

            for (var i in rows) {
                exerList.push({ 'id': rows[i].id, 'name': rows[i].name, 'reps': rows[i].reps, 'weight': rows[i].weight, 'date': rows[i].date, 'lbs': rows[i].lbs })
            }

            context.workouts = exerList
            res.render('index', context)

        })
    })
})


/* Below Code either provided in class or borrowed from previous modules */
// RESET command
app.get('/reset-table', function (req, res, next) {
    var context = {}
    mysql.pool.query("DROP TABLE IF EXISTS workouts", function (err) { //replace your connection pool with the your variable containing the connection pool
        var createString = "CREATE TABLE workouts(" +
            "id INT PRIMARY KEY AUTO_INCREMENT," +
            "name VARCHAR(255) NOT NULL," +
            "reps INT," +
            "weight INT," +
            "date DATE," +
            "lbs BOOLEAN)"
        mysql.pool.query(createString, function (err) {
            context.results = "Table reset"
            res.render('index', context)
        })
    })
})

//Handle 404 error
app.use(function (req, res) {
    res.status(404); /* Set status of response to 404. */
    res.render('404'); /* Render 404.handlebars */
})

//Handle 500 error
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500 - Server Error');
})

app.listen(app.get('port'), function () {
    console.log('Express started on http://flip1.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
})

/*
References
Accessing CSS in Handlebars
https://stackoverflow.com/questions/45395947/what-is-the-proper-way-of-referencing-css-and-js-files-with-handlebars
Render
https://www.geeksforgeeks.org/express-js-res-render-function/
req.query
https://www.geeksforgeeks.org/express-js-req-query-property/
JSON.stringify
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify

*/
