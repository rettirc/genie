# Genie v1.0

Release Notes:

```
New Features:
  Home Page
  River View
  Map View
  Database Integration

Bugs Fixed:
  Routing through Express connects all pages and api calls locally

Known Bugs:
  An issue with the sqlite3-database module prevents the application from building into an electron application
    Either replace the module or wait for them to fix it.
    After installing electron-package through npm, the entire application can be turned into a desktop app

  Map View
    After doing a time lapse, it's possible to get the map view into an unstable state
      Some group members could not reproduce this bug
      Fixed by refreshing the page

  River View
    Switching to the personal connections lost functionality when updating the database
      Changing the way that reverse attribute lookup is performed is required, but attributes are needed in the database to test any code

  Detail View
    This visualization contains the least development, but shows the required steps to create a new visualization

```
