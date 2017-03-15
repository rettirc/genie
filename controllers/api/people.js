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
};

exports.marriages = function(req, res) {
	db.all(`
	SELECT mr.IDMR AS marriage_id, mr.IDIRHusb, mr.IDIRWife
	FROM tblMR as mr
	ORDER BY mr.IDMR
	`, function(err, rows) {
		if (err) {
			console.error(err);
		} else {
			res.json(rows);
		}
	});
};

exports.queryId = function(req, res) {
	var command = `
	WITH related (IDIR, Surname, GivenName, IDMRPref, IDMRParents, n) AS
	(
		SELECT ir.IDIR, ir.Surname, ir.GivenName, ir.IDMRPref, ir.IDMRParents, 0 AS n
		FROM tblIR as ir
		WHERE IDIR=353

		UNION ALL

		SELECT ir.IDIR, ir.Surname, ir.GivenName, ir.IDMRPref, ir.IDMRParents, n + 1
		FROM tblIR as ir
		INNER JOIN tblMR as mr
		ON ir.IDIR = mr.IDIRHusb OR ir.IDIR = mr.IDIRWife
		INNER JOIN related
		ON related.IDMRPref = ir.IDMRPref
		WHERE n < 2

	)
	SELECT DISTINCT IDIR, Surname, GivenName, IDMRPref, IDMRParents, n
	FROM related
	`;
	db.all(command, function(err, rows) {
		res.json(rows);
		if (err) console.error(err);
	});

};

exports.people = function(req, res) {
	db.all(`
		SELECT ir.IDIR, ir.Surname, ir.GivenName, ir.IDMRPref, ir.IDMRParents
		FROM tblIR as ir
		`, function(err, rows) {
		if (err) console.error(err);
		res.json(rows);
	})
}

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
