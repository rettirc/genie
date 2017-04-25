# Genie app quick start

first of all... let's show how all this works

for now, we have a website that will later be _compiled_ into an **Electron** app
that will be the finished product.

For the sake of the demo, we will just have a _locally hosted_ website.

## The Repo Structure

```
build // scripts and tools for doing the pre-work to actually running the app
	gulp // read up on gulp it's a neat little streaming build tool

controllers // these are "routes" this is how nodejs renders a specific page
	index // in our case we have ".pug" files that get rendered to html on the fly
	api // These contain database services and are connected to the routes in app.js
	helpers // Not used currently, but contains the spot where pagination would live

genie-* // Build folders from electron-package, mostly added to the .gitignore

public // all statically hosted files
	data // genealogy json data
	fonts // Self explanatory. We're using Roboto and Open Sans currently
	media // Images
	scripts
		to-min // gulp concatenates everything in here to the genie.js file
			config // The state configuration files. This enumerates all of the states for angular and connects them to controllers
			states // This folder contains all of the states (parts of pages) used by angular
				layout // The master state. Most everything is a substate of this and the main layout contains the information in the substate and the nav / footer
		genie.js // all of the javascript code used by our app
	styles
		sass // sass code gets compiled into css
		style.min.css // all of the css for our app in one file

views // all of the ".pug" files (think of this as our html) NOTE: These are from an older version of the application and don't currently get used

.editorconfig // different text editors or IDEs do tabbing and editing differently this puts everyone on same page

app.js // this is what node runs in order to launch the app  ---- START HERE!

bower.json // bower is used to download all frontend js and css packages like angular and d3

gulpfile.js // a streaming build tool this is where we convert sass -> css and js -> concatenated and minified to one file

index.html // unused currently

main.js // unused for now

package.json // backend javascript packages go here
	dependencies // all packages used by the app
	devDependencies // all packages used to BUILD the app

```

## Get Up and Running!

make sure node is installed (I'm using version 6.x)

first of all we need gulp

this gulp thing takes care of compiling sass and javascript files on the fly SUPER HELPFUL

if it's the first time you're building the app in a terminal at the project:

1. `npm install -g gulp-cli` (this installs gulp so that the application can be run)
2. `npm install -g bower` (this installs bower, which handles downloading everything for the front end)
3. `npm install` and `bower install` (run these commands separately to download all the dependencies needed to run the app. You may need to repeat these when you install another package)

next, let's get this thing fired up!

`gulp`

Yes, that's it. A local server will be launched and can be accessed in any browser at localhost:3000

Recommended browser: Google Chrome. The desktop application will run using Chromium, so Google Chrome gives the closest experience needed

Pro Tip: Ctrl + Shift + R will do a hard refresh
