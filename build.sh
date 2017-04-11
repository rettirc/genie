 #!/usr/bin/env bash

 cd /srv/www/genie && npm install && bower install && gulp build && sudo service genie restart
