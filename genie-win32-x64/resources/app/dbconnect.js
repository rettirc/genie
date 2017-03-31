// Installed
const mysql = require('mysql');

module.exports = (conName) => {

  function dbConnect(queryData) {
    var con = mysql.createConnection({
      host : 'localhost',
      user : 'cody',
      password : '', // Same as my luggage
      database : String(conName) // Make sure it's a string
    });

    con.connect();

    var queryString = 'IF EXISTS (SELECT * FROM indi)'; // CLEAN ME CLEAN ME CLEAN ME

    con.query(queryString, function(err, rows, fields) {
      if (err) console.error(err);

      for (var i in rows) {
        return rows;
      }
    })

    con.end();
  }

  return {
    query: dbConnect
  }
}
