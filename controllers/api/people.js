const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../genie.sqlite'));

/*
	This contains exported functions that will be called by the router to query the
	database. Note that all functions have the expected paramaters from Express:
	Req - The request
			- query: method that can be called on req to get the parameters passed by the user
	Res - The object that handles the results

  Note: This is the point of highest coupling with the database and the rest of
	the application. This was neccessary due to the time constraints and resources
	for this project

	These names are arbitrary and mainly for the poor team member working on the
	database at the moment

*/

// Every person
exports.all = function(req, res) {
	db.all("SELECT * FROM tblIR", function(err, rows) {
		res.json(rows);
	});
};

// Get everyone in an object with their biological parents
exports.childrenOfMarriage = function(req, res) {
	db.all(`
	SELECT cr.IDMR AS marriage_id, mr.IDIRHusb, mr.IDIRWife , cr.IDIR AS child_id
	FROM tblCR as cr
	JOIN tblMR as mr
	ON mr.IDMR = cr.IDMR
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
		SELECT ir.IDIR, ir.Surname, ir.GivenName, ir.IDMRPref, ir.IDMRParents, ir.Notes, attr.PROFESSION as professionID, prof.VALUE as profession, attr.EDUCATION as educationID, edu.VALUE as education
		FROM tblIR as ir
		LEFT JOIN individualAttributesIfKnown as attr
		ON attr.IDIR = ir.IDIR
		LEFT Join professionValues as prof
		ON attr.PROFESSION = prof.PROFESSIONID
		LEFT JOIN educationValues as edu
		ON attr.EDUCATION = edu.ID
		`, function(err, rows) {
		if (err) console.error(err);
		res.json(rows);
	})
}

exports.relatedGraph = function(req, res) {
	db.all(`
		SELECT ir.IDIR, ir.Surname, ir.GivenName, ir.BirthSD as birth, ir.IDMRPref, mr.IDIRWife as mother, mr.IDIRHusb as father, prof.VALUE as profession, edu.VALUE as education
		FROM tblIR as ir
		LEFT JOIN tblMR as mr
		ON mr.IDMR = ir.IDMRParents
		LEFT JOIN individualAttributesIfKnown as attr
		ON attr.IDIR = ir.IDIR
		LEFT JOIN professionValues as prof
		ON attr.PROFESSION = prof.PROFESSIONID
		LEFT JOIN educationValues as edu
		ON attr.EDUCATION = edu.ID
		`, function(err, rows) {
		if (err) console.error(err);

		var idirToIndex = [];
		for (var i = 0; i < rows.length; i++) {
			let p = rows[i];
			idirToIndex[p.IDIR] = i;
			p["index"] = i;
			p["children"] = [];
		}

		for (var i = 0; i < rows.length; i++) {
			let p = rows[i];
			let motherIDIR = p["mother"];
			let fatherIDIR = p["father"];
			let motherIndex = idirToIndex[motherIDIR];
			let fatherIndex = idirToIndex[fatherIDIR];
			rows[motherIndex].children.push(p.IDIR);
			rows[fatherIndex].children.push(p.IDIR);
		}
		var out = {"rows": rows, "lookup":idirToIndex};
		res.json(out);
	})
}

exports.attributeData = function(req, res) {
	db.all(`
			SELECT professionValues.PROFESSIONID as id, professionValues.VALUE as value, 'profession' as category
			FROM professionValues
			UNION
			SELECT educationValues.ID as id, educationValues.VALUE as value, 'education' as category
			FROM educationValues
		`, function(err, rows) {
			if (err) {
				console.error(err);
			} else {
				res.json(rows);
			}
		});
};

exports.uploadAttribute = function(req, res) {
	// Sanitize the inputs

	db.run(`
			UPDATE individualAttributesIfKnown SET PROFESSION = $prof, EDUCATION = $edu
			WHERE individualAttributesIfKnown.IDIR = $id
		`, {
			$id: req.query.idir,
			$prof: req.query.newProf,
			$edu: req.query.newEdu
		}, function(err, rows) {
			if (err) {
				console.error(err);
			} else {
				res.json(rows);
			}
		});
}

exports.uploadNewProfession = function(req, res) {

	db.run(`
			INSERT INTO professionValues (PROFESSIONID, VALUE) VALUES ($id, $name)
		`, {
			$id: req.query.profID,
			$name: req.query.newProf
		}, function(err, rows) {
			if (err) {
				console.error(err);
			} else {
				res.json(rows);
			}
		});
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
