const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../genie.sqlite'));

exports.all = function(req, res) {
	db.all("SELECT * FROM tblIR", function(err, rows) {
		res.json(rows);
	});
};

exports.childrenOfMarriage = function(req, res) {
	db.all(`
	SELECT cr.IDMR AS marriage_id, cr.IDIR AS child_id
	FROM tblCR as cr
	JOIN tblIR as ir
	ON ir.IDIR = cr.IDIR
	ORDER BY cr.IDMR
	`, function(err, rows) {
		if (err) {
			console.error(err);
		} else {
			res.json(rows);
		}
	});
}

exports.queryId = function(req, res) {
	var command = `
	WITH related AS
	(
		SELECT * 

	)
	SELECT *
	FROM tblIR
	`;
	console.log(command);
	db.all(command, function(err, rows) {
		res.json(rows);
		if (err) console.error(err);
	});

};

// JOIN IDIR on Table IR

// SELECT *
// FROM tblMR
// JOIN tblIR
// ON tblMR.IDIR = tablIR.IDIR
// JOIN
//
//
// SELECT cr.IDMO AS marriage_id, cr.IDIR AS child_id
// FROM tblCR as cr
// JOIN tblIR as ir
// ON ir.IDIR = cr.IDIR
// ORDER BY cr."IDMR"
