const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../genie.sqlite'));

exports.all = function(req, res) {
	db.all("SELECT * FROM tblIR", function(err, rows) {
		res.json(rows);
	});
};

exports.queryId = function(req, res) {
	var command = "SELECT * FROM tblIR WHERE ID=" + 3;
	console.log(command);
	db.all(command, function(err, rows) {
		res.json(rows);
		if (err) console.error(err);
	});

};
