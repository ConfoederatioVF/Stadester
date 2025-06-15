//Initialise functions
{
  /**
   * getCityCoords() - Returns city coordinates as a [lat, lng] array. Async, so you must either await or use .then().
   * @param {String} arg0_city_name 
   * 
   * @returns {Array<number, number>}
   */
  global.getCityCoords = async function (arg0_city_name) {
    //Convert from parameters
    var city_name = arg0_city_name;

    //Declare local instance variables
    if (!global.browser_instance) await launchCityCoordsInstance();

    //Clear the search box before entering the new city name
    await browser_instance.evaluate((city_name) => {
      var place_input = document.getElementById("searchboxinput");
      place_input.value = city_name;
    }, city_name);
    await sleep(randomNumber(1000, 1400));
    await browser_instance.evaluate(() => {
      var search_btn = document.querySelector("button[aria-label='Search']");
      search_btn.click();
    });

    //Fetch URL; this is where the latlng coordinates reside
    await browser_instance.waitForNavigation({ waitUntil: 'networkidle2' });
    await sleep(randomNumber(8000, 10000)); //You want to sleep for a long time for reliability

    var lat_value = 0;
    var lng_value = 0;
    var url = browser_instance.url();
    var match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

    //Get the lat and lng inputs
    if (match) {
      lat_value = match[1];
      lng_value = match[2];
    }

    await sleep(randomNumber(800, 1000));

    //Check to see if Google Maps could find the coordinate; if not override lat_value, lng_value
    try {
      var coords_found = true;
      var search_result_el = await getElement("div.fontHeadlineSmall");
      await sleep(randomNumber(800, 1000));
      var search_result_text_content = await search_result_el.evaluate((element) => element.textContent, search_result_el);
      console.log(`- Search result text content: ${search_result_text_content}`);
  
      if (search_result_text_content.includes("can't find"))
        coords_found = false;
  
      if (!coords_found) {
        lat_value = 0;
        lng_value = 0;
      }
    } catch (e) {}

    //Return statement
    return [parseFloat(lat_value), parseFloat(lng_value)];
  };

  global.getGoogleMapsCityCoords = async function (arg0_city_name) {
    //Convert from parameters
    var city_name = arg0_city_name;

    //Declare local instance variables
    var lat_value = 0;
    var local_exec = util.promisify(exec);
    var lng_value = 0;
    var processed_city_name = city_name.replace(/ /gm, "+");

    //Run exec call to CURL
    var { stdout, stderr } = await local_exec(`curl -s "https://maps.googleapis.com/maps/api/geocode/json?components=locality:${processed_city_name}&key=${settings.google_maps_api_key}"`);

    //Guard clause if error occurs from CURL call
    if (stderr) {
      console.error(stderr);
      return;
    }

    var gmaps_obj = JSON.parse(stdout);
    try {
      var location_obj = gmaps_obj.results[0].geometry.location;

      lat_value = location_obj.lat;
      lng_value = location_obj.lng;
    } catch (e) {
      console.error(e);
    }

    //Return statement
    return [parseFloat(lat_value), parseFloat(lng_value)];
  };

  global.getOSMCityCoords = async function (arg0_city_name) {
    //Convert from parameters
    var city_name = arg0_city_name;

    //Declare local instance variables
    var params = new URLSearchParams({
      q: city_name,
      format: "jsonv2",
      addressdetails: "1",
      extratags: "1",
      limit: "10"
    });
    var url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    console.log(`Fetching data from ${url}:`);
    try {
      var response = await fetch(url, { headers: { "User-Agent": "Stadestér/0.2 (vf.confoederatio@gmail.com) "} });
        if (!response.ok) throw new Error(`HTTP Error. Status: ${response.status}`);
      var results = await response.json();

      if (!results || results.length == 0) {
        console.warn(`No results found for ${city_name}.`);
        return [0, 0];
      }
      var max_population = -1;
      var most_populous_result = null;

      for (var local_result of results) {
        //Population data is in local_result.extratags.population if it exists
        var local_population_string = local_result.extratags?.population;

        if (local_population_string) {
          var local_population = parseInt(local_population_string, 10);

          if (!isNaN(local_population) && local_population > max_population) {
            max_population = local_population;
            most_populous_result = local_result;
          }
        }
      }

      //If we found a result with population data return it; otherwise return the first result.
      var processed_result = (most_populous_result) ?
        most_populous_result : results[0];

      //Return statement
      return [processed_result.lat, processed_result.lon];
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * launchCityCoordsInstance() - Launches a browser instance to go to Google Maps. Internal helper function.
   */
  global.launchCityCoordsInstance = async function () {
    if (!global.browser_instance)
      await initialiseChrome();
    global.browser_instance.setDefaultNavigationTimeout(120000);

    //Run a browser instance to go to latlong.net
    await global.browser_instance.goto('https://www.google.com/maps/');
  };
}