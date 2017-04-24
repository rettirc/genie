const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../genie.sqlite'));

/**
 * GET /
 * Home page.
 */


// Release v1: This function is needed for routes to connect properly, it is never given to anything
exports.index = function(req, res) {

	db.all("SELECT * FROM tblIR", function(err, rows) {
		// TO DO SOMETHING HERE
	});

	res.render('layout', {});
};
