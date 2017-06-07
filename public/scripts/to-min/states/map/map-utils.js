angular.module('genie.map-utils', [])
.service("MapScopeTracker", function(d3) {

    mapScopeTracker = function(mapManager) {
        this.mapScope = "Globe"; //See options in mapDict
        this.scopeStack = new Array(); //stack to hold previous scale of map

        this.getMapFilePath = function () {
            return this.mapScopeDict[this.mapScope][0]
        }

        this.getProjection = function () {
            return this.mapScopeDict[this.mapScope][2]
        }

        this.getD3LocPath = function () {
            return this.mapScopeDict[this.mapScope][1]
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
        this.worldProjection = d3.geoEquirectangular()
                                .scale(mapManager.height / Math.PI);

        // Define US path generator
        this.usPath = d3.geoPath()
                     .projection(this.projection);

        // World path for the world projection rather than US
        this.worldPath = d3.geoPath()
                            .projection(this.worldProjection);

        this.mapScopeDict = {
            "USA": ["data/us-states.json", this.usPath, this.projection],
            "Globe": ["data/world-countries.json", this.worldPath, this.worldProjection]
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

        this.getLocDict = function (mapManager) {
            var scope = mapManager.mapScopeTracker.mapScope;

            var locDict;
            switch (scope) {
                case 'USA':
                    locDict = this.stateNameDict;
                    break;
                case 'Globe':
                    locDict = this.countryNameDict;
                    break;
            }
            return locDict;
        }

        this.locInScope = function(loc, mapManager) {
            locDict = this.getLocDict(mapManager);

            return locDict[element] != null || (mapManager.mapScopeTracker
                .mapScope == 'Globe' && this.stateNameDict[element] != null)
        }

        this.convertToLocDates = function (all_json, mapManager) {
            locDict = this.getLocDict(mapManager);

            var locations = [];
            for (var i = 0; i < all_json.length; i++) {
                var locStr = all_json[i].loc;
                if (locStr) {
                    var arr = locStr.split(",");
                    var isState = false;
                    for (index = 0; index < arr.length; index++) {
                        element = arr[index].trim()
                        if (locDict[element] != null) {
                            locations.push(new locDate(locDict[element],
                                this.formatDate(all_json[i].date)));
                                if (this.formatDate(all_json[i].date) == 804) {
                                    console.log(locDict[element]);
                                }
                            isState = false;
                        } else if (mapManager.mapScopeTracker.mapScope == 'Globe'
                            && this.stateNameDict[element] != null) {
                            isState = true;
                        }
                    }
                    if (isState) {
                        locations.push(new locDate('United States of America',
                            this.formatDate(all_json[i].date)));
                    }
                }
            }
            return locations
        }

        this.countryNameDict = {
            'Afghanistan': 'Afghanistan',
            'Angola': 'Angola',
            'Albania':'Albania',
            'Emirates':'United Arab Emirates',
            'UAE':'United Arab Emirates',
            'Argentina': 'Argentina',
            'Armenia': 'Armenia',
            'Antarctica': 'Antarctica',
            'Antarctic': 'French Southern and Antarctic Lands',
            'Australia': 'Australia',
            'Austria': 'Austria',
            'Azerbaijan':'Azerbaijan',
            'Burundi':'Burundi',
            'Belgium': 'Belgium',
            'Benin': 'Benin',
            'Burkina Faso': 'Burkina Faso',
            'Bangladesh': 'Bangladesh',
            'Bulgaria': 'Bulgaria',
            'Bahamas': 'The Bahamas',
            'Bosnia': 'Bosnia and Herzegovina',
            'Herzegovina': 'Bosnia and Herzegovina',
            'Belarus': 'Belarus',
            'Belize': 'Belize',
            'Bermuda': 'Bermuda',
            'Bolivia': 'Bolivia',
            'Brazil': 'Brazil',
            'Brunei': 'Brunei',
            'Bhutan': 'Bhutan',
            'Botswana': 'Botswana',
            'Central African Republic': 'Central African Republic',
            'African Republic': 'Central African Republic',
            'Canada': 'Canada',
            'Switzerland': 'Switzerland',
            'Chile': 'Chile',
            'China': 'China',
            'Ivory Coast': 'Ivory Coast',
            'Cameroon': 'Cameroon',
            'Republic of the Congo': 'Republic of the Congo',
            'Colombia': 'Colombia',
            'Costa Rica': 'Costa Rica',
            'Cuba': 'Cuba',
            'Northern Cyprus': 'Northern Cyprus',
            'Cyprus': 'Cyprus',
            'Czech Republic': 'Czech Republic',
            'Germany': 'Germany',
            'Djibouti': 'Djibouti',
            'Denmark': 'Denmark',
            'Dominican Republic': 'Dominican Republic',
            'Algeria': 'Algeria',
            'Ecuador': 'Ecuador',
            'Egypt': 'Egypt',
            'Eritrea': 'Eritrea',
            'Spain': 'Spain',
            'Estonia': 'Estonia',
            'Ethiopia': 'Ethiopia',
            'Finland': 'Finland',
            'Fiji': 'Fiji',
            'Falkland Islands': 'Falkland Islands',
            'France': 'France',
            'Gabon': 'Gabon',
            'United Kingdom': 'United Kingdom',
            'Kingdom': 'United Kingdom',
            'Britain': 'United Kingdom',
            'Great Britain': 'United Kingdom',
            'UK': 'United Kingdom',
            // 'Georgia': 'Georgia' assuming GA is a state
            'Ghana': 'Ghana',
            'Guinea': 'Guinea',
            'Gambia': 'Gambia',
            'Guinea Bissau': 'Guinea Bissau',
            'Equatorial Guinea': 'Equatorial Guinea',
            'Greece':'Greece',
            'Greenland':'Greenland',
            'Guatemala':'Guatemala',
            'French Guiana': 'French Guiana',
            'Guiana': 'French Guiana',
            'Guyana': 'Guyana',
            'Honduras': 'Honduras',
            'Croatia': 'Croatia',
            'Haiti': 'Haiti',
            'Hungary': 'Hungary',
            'Indonesia': 'Indonesia',
            'India': 'India',
            'Ireland': 'Ireland',
            'Iran': 'Iran',
            'Iraq': 'Iraq',
            'Iceland': 'Iceland',
            'Israel': 'Israel',
            'Italy': 'Italy',
            'Jamaica': 'Jamaica',
            'Jordan': 'Jordan',
            'Japan': 'Japan',
            'Kazakhstan': 'Kazakhstan',
            'Kenya': 'Kenya',
            'Kyrgyzstan': 'Kyrgyzstan',
            'Cambodia': 'Cambodia',
            'South Korea': 'South Korea',
            'Kosovo': 'Kosovo',
            'Kuwait': 'Kuwait',
            'Laos': 'Laos',
            'Lebanon': 'Lebanon',
            'Liberia': 'Liberia',
            'Libya': 'Libya',
            'Sri Lanka': 'Sri Lanka',
            'Lesotho': 'Lesotho',
            'Lithuania': 'Lithuania',
            'Luxembourg': 'Luxembourg',
            'Latvia': 'Latvia',
            'Morocco': 'Morocco',
            'Moldova': 'Moldova',
            'Madagascar':'Madagascar',
            'Mexico': 'Mexico',
            'Macedonia': 'Macedonia',
            'Mali': 'Mali',
            'Malta': 'Malta',
            'Myanmar': 'Myanmar',
            'Montenegro': 'Montenegro',
            'Mongolia': 'Mongolia',
            'Mozambique': 'Mozambique',
            'Mauritania': 'Mauritania',
            'Malawi': 'Malawi',
            'Malaysia': 'Malaysia',
            'Namibia': 'Namibia',
            'New Caledonia': 'New Caledonia',
            'Niger': 'Niger',
            'Nigeria': 'Nigeria',
            'Nicaragua': 'Nicaragua',
            'Netherlands': 'Netherlands',
            'Norway': 'Norway',
            'Nepal': 'Nepal',
            'New Zealand': 'New Zealand',
            'Oman': 'Oman',
            'Pakistan': 'Pakistan',
            'Panama': 'Panama',
            'Peru': 'Peru',
            'Philippines': 'Philippines',
            'Papua New Guinea': 'Papua New Guinea',
            'Poland': 'Poland',
            'Puerto Rico': 'Puerto Rico',
            'North Korea': 'North Korea',
            'Portugal': 'Portugal',
            'Paraguay': 'Paraguay',
            'Qatar': 'Qatar',
            'Romania': 'Romania',
            'Russia': 'Russia',
            'Rwanda': 'Rwanda',
            'Western Sahara': 'Western Sahara',
            'Saudi Arabia': 'Saudi Arabia',
            'Sudan': 'Sudan',
            'South Sudan': 'South Sudan',
            'Senegal': 'Senegal',
            'Solomon Islands': 'Solomon Islands',
            'Sierra Leone': 'Sierra Leone',
            'El Salvador': 'El Salvador',
            'Somaliland': 'Somaliland',
            'Somalia': 'Somalia',
            'Republic of Serbia': 'Republic of Serbia',
            'Serbia': 'Republic of Serbia',
            'Suriname': 'Suriname',
            'Slovakia': 'Slovakia',
            'Slovenia': 'Slovenia',
            'Sweden': 'Sweden',
            'Swaziland': 'Swaziland',
            'Syria': 'Syria',
            'Chad': 'Chad',
            'Togo': 'Togo',
            'Thailand': 'Thailand',
            'Tajikistan': 'Tajikistan',
            'Turkmenistan': 'Turkmenistan',
            'East Timor': 'East Timor',
            'Timor': 'East Timor',
            'Trinidad': 'Trinidad and Tobago',
            'Tobago': 'Trinidad and Tobago',
            'Tunisia': 'Tunisia',
            'Turkey': 'Turkey',
            'Taiwan': 'Taiwan',
            'United Republic of Tanzania': 'United Republic of Tanzania',
            'Tanzania': 'United Republic of Tanzania',
            'Uganda': 'Uganda',
            'Ukraine': 'Ukraine',
            'Uruguay': 'Uruguay',
            'United States of America': 'United States of America',
            'USA': 'United States of America',
            'US': 'United States of America',
            'America': 'United States of America',
            'United States': 'United States of America',
            'Uzbekistan': 'Uzbekistan',
            'Venezuela': 'Venezuela',
            'Vietnam': 'Vietnam',
            'Vanuatu': 'Vanuatu',
            'West Bank': 'West Bank',
            'Yemen': 'Yemen',
            'South Africa': 'South Africa',
            'Zambia': 'Zambia',
            'Zimbabwe': 'Zimbabwe'
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
