/**
 * Module dependencies.
 */

// come with NodeJS
const path = require('path');
const fs = require('fs');

// installed
const express = require('express');
const errorHandler = require('errorhandler');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

// ours But not now
// const dbConnect = require('./dbconnect.js');

/**
 * Controllers (route handlers).
 */
const controller = require(path.join(__dirname, 'controllers/index'));
const locApiController = require(path.join(__dirname, 'controllers/api/locations'));
const peopleApiController = require(path.join(__dirname, 'controllers/api/people'));

/**
 * Create Express server.
 */
const app = express();

/**
 * Launch Electron
 */
// const electronWindow = require('./main.js');
/**
 * Connect body parser
 */
app.use(bodyParser.json()); // JSON encoded bodies
app.use(bodyParser.urlencoded({ extended: true})); // URL extended bodies
app.use(fileUpload());

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);

// set views (html)
app.set('views', [
    path.join(__dirname, '/views')
]);
app.set('view engine', 'pug');

// set routing
app.enable('strict routing');
const router = express.Router({
	caseSensitive		: app.get('case sensitive routing'),
	strict					: app.get('strict routing')
});
app.use(router);

// static files (i.e. styles, scripts, etc.)
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * App routes.
 */

router.get('/', controller.index);
router.get('', function(req, res) { res.redirect('/') });
router.get('/auth', controller.index);
router.get('/river', controller.index);
router.get('/gallery', controller.index);
router.get('/map', controller.index);
router.get('/upload', controller.index);
router.post('/db', function(req, res) { // Plug into database
  var db = dbConnect('fam_data');
  res.json(db.query(req.body));
  res.end();
});
router.post('/fileList', function(req, res) {
  fs.readdir(path.join(__dirname, 'public/data/uploads/'), (err, files) => {
    let list = [];
    files.forEach(file => {
      list.push(file);
    });
    res.send(list);
  })
});
router.post('/uploadFile',  function(req, res) {
  // console.log(req.files.inputFile);
  if(!req.files) {
    res.redirect("/upload");
  }
  let inputFile = req.files.inputFile;

  inputFile.mv(path.join(__dirname, "public/data/uploads/", inputFile.name), function(err) {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/upload");
  });
});
router.get('/api/locations', locApiController.getLocs);
router.get('/api/people', peopleApiController.people); // All people
// router.get('/api/children', peopleApiController.childrenOfMarriage);
// router.get('/api/marriages', peopleApiController.marriages);
router.get('/api/relations', peopleApiController.relatedGraph); // People of a certain depth and links

/**
 * 500 Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
