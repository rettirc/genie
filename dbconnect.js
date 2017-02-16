// Installed
const mysql = require('mysql');

module.exports = (conName) => {

  function dbConnect(queryText) {
    var con = mysql.createConnection({
      host : 'localhost',
      user : 'admin',
      password : '12345', // Same as my luggage
      database : String(conName) // Make sure it's a string
    });

    con.connect();

    var queryString = queryText; // CLEAN ME CLEAN ME CLEAN ME

    con.query(queryString, function(err, rows, fields) {
      if (err) console.error(err);

      for (var i in rows) {
        return rows;
      }
    })
  }

  return {
    query: dbConnect
  }
}
