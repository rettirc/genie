angular.module('genie.map-utils', [])
.service("MapScopeTracker", function(d3) {

    mapScopeTracker = function(mapManager) {
        this.mapScope = "Globe"; //See options in mapDict
        this.scopeStack = new Array(); //stack to hold previous scale of map

        this.getMapFilePath = function () {
            return this.mapScopeDict[this.mapScope][0]
        }

        this.getD3LocPath = function () {
            return d3.geoPath()
                         .projection(this.projection);
        }

        this.pushScope = function (newScope) {
            if (this.mapScope != newScope && this.mapScopeDict.hasOwnProperty(newScope)) {
                this.mapScope = newScope
                this.scopeStack.push(newScope)
                return true
            }
            return false
        }

        // D3 Projection
        this.projection = d3.geoAlbersUsa()
            .translate([mapManager.width/2, mapManager.height/2.2]) // move to center screen
            .scale([1000]); // scale things down so see entire US

        // D3 World Projection; geoAlbersUsa creates a map zoomed into us only
        // this.worldProjection = d3.geoEquirectangular()
        //                     .scale(mapManager.height / Math.PI);
        this.worldProjection = d3.geoEquirectangular()
                            // .scale(mapManager.height / Math.PI);
        // Define US path generator
        this.usPath = d3.geoPath()
                     .projection(this.projection);

        // World path for the world projection rather than US
        this.worldPath = d3.geoPath()
                            .projection(this.worldProjection);

        this.mapScopeDict = {
            "USA": ["data/us-states.json", this.usPath],
            "Globe": ["data/world-countries.json", this.worldPath]
        }
    }

    return mapScopeTracker
})
.service("MapUtil", function(){ // Any modules or services needed for this go in the parens

    locDate = function (loc, date) {
        this.date = date;
        this.loc = loc;
    }

    mapUtil = function() {
        this.formatDate = function (date) {
            if(date) {
                var newDate
                newDate = parseInt(date.substr(6,4))
                return newDate
            }
        }

        //Convert sqlite json '.data' field to array of state/date pairs formatted for d3's use
        this.convertToStateLocDates = function (all_json) {
            var states = [];
            for (var i = 0; i < all_json.length; i++) {
                var locStr = all_json[i].loc;
                if (locStr) {
                    var arr = locStr.split(",");
                    for (index = 0; index < arr.length; index++) {
                        element = arr[index].trim()
                        if (this.stateNameDict[element] != null) {
                            states.push(new locDate(this.stateNameDict[element],
                                this.formatDate(all_json[i].date)));
                        }
                    }
                }
            }
            return states
        }

        //Map of any value that could represent a state name
        this.stateNameDict = {
            'Arizona':'Arizona',
            'Alabama':'Alabama',
            'Alaska':'Alaska',
            'Arizona':'Arizona',
            'Arkansas':'Arkansas',
            'California':'California',
            'Colorado':'Colorado',
            'Connecticut':'Connecticut',
            'Delaware':'Delaware',
            'Florida':'Florida',
            'Georgia':'Georgia',
            'Hawaii':'Hawaii',
            'Idaho':'Idaho',
            'Illinois':'Illinois',
            'Indiana':'Indiana',
            'Iowa':'Iowa',
            'Kansas':'Kansas',
            'Kentucky':'Kentucky',
            'Louisiana':'Louisiana',
            'Maine':'Maine',
            'Maryland':'Maryland',
            'Massachusetts':'Massachusetts',
            'Michigan':'Michigan',
            'Minnesota':'Minnesota',
            'Mississippi':'Mississippi',
            'Missouri':'Missouri',
            'Montana':'Montana',
            'Nebraska':'Nebraska',
            'Nevada':'Nevada',
            'New Hampshire':'New Hampshire',
            'New Jersey':'New Jersey',
            'New Mexico':'New Mexico',
            'New York':'New York',
            'North Carolina':'North Carolina',
            'North Dakota':'North Dakota',
            'Ohio':'Ohio',
            'Oklahoma':'Oklahoma',
            'Oregon':'Oregon',
            'Pennsylvania':'Pennsylvania',
            'Rhode Island':'Rhode Island',
            'South Carolina':'South Carolina',
            'South Dakota':'South Dakota',
            'Tennessee':'Tennessee',
            'Texas':'Texas',
            'Utah':'Utah',
            'Vermont':'Vermont',
            'Virginia':'Virginia',
            'Washington':'Washington',
            'West Virginia':'West Virginia',
            'Wisconsin':'Wisconsin',
            'Wyoming':'Wyoming',
            'AZ':'Arizona',
            'AL':'Alabama',
            'AK':'Alaska',
            'AZ':'Arizona',
            'AR':'Arkansas',
            'CA':'California',
            'CO':'Colorado',
            'CT':'Connecticut',
            'DE':'Delaware',
            'FL':'Florida',
            'GA':'Georgia',
            'HI':'Hawaii',
            'ID':'Idaho',
            'IL':'Illinois',
            'IN':'Indiana',
            'IA':'Iowa',
            'KS':'Kansas',
            'KY':'Kentucky',
            'LA':'Louisiana',
            'ME':'Maine',
            'MD':'Maryland',
            'MA':'Massachusetts',
            'MI':'Michigan',
            'MN':'Minnesota',
            'MS':'Mississippi',
            'MO':'Missouri',
            'MT':'Montana',
            'NE':'Nebraska',
            'NV':'Nevada',
            'NH':'New Hampshire',
            'NJ':'New Jersey',
            'NM':'New Mexico',
            'NY':'New York',
            'NC':'North Carolina',
            'ND':'North Dakota',
            'OH':'Ohio',
            'OK':'Oklahoma',
            'OR':'Oregon',
            'PA':'Pennsylvania',
            'RI':'Rhode Island',
            'SC':'South Carolina',
            'SD':'South Dakota',
            'TN':'Tennessee',
            'TX':'Texas',
            'UT':'Utah',
            'VT':'Vermont',
            'VA':'Virginia',
            'WA':'Washington',
            'WV':'West Virginia',
            'WI':'Wisconsin',
            'WY':'Wyoming',
        };
    }

    return mapUtil
});
