const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../genie.sqlite'));

exports.all = function(req, res) {
	db.all("SELECT * FROM tblLR", function(err, rows) {
		res.json(rows);
	});
};

exports.getLocs = function(req, res) {
	db.all(`
        SELECT lr.Location AS loc,
    	CASE WHEN ir.IDLRBirth = lr.IDLR THEN ir.BirthD
    	WHEN ir.IDLRDeath = lr.IDLR THEN ir.DeathD END AS date
    	FROM tblLR as lr
        JOIN tblIR as ir
    	ON ir.IDLRBirth = lr.IDLR
    	WHERE loc IS NOT NULL
	`, function(err, rows) {
        if (err) {
			console.error(err);
		} else {
			res.json(rows);
		}
	});
};
