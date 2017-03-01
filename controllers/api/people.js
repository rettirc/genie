const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../genie.sqlite'));

exports.all = function(req, res) {
	db.all("SELECT * FROM tblIR", function(err, rows) {
		res.json(rows);
	});
};
