//Initialise functions
{
  /**
   * fixCoordsInUUD() - Fixes broken coords within UUD; optionally saving it to the processed UUD file stack.
   * @param {Object} arg0_uud_obj
   * @param {Object} [arg1_options]
   *  @param {boolean} [arg1_options.save_uud_obj=false] - Whether to save the UUD object to the processed UUD file stack.
   *
   * @returns {Object}
   */
  global.fixCoordsInUUD = async function (arg0_uud_obj, arg1_options) {
    //Convert from parameters
    var uud_obj = (arg0_uud_obj) ?
      arg0_uud_obj : JSON.parse(fs.readFileSync(config.defines.common.input_file_paths.processed_uud_cities));
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_countries = Object.keys(uud_obj);

    //Iterate over all_countries
    for (var i = 0; i < all_countries.length; i++) {
      var local_country = uud_obj[all_countries[i]];

      if (local_country.type != "chandler_modelski") {
        //Iterate over all_cities
        var all_cities = Object.keys(local_country);
        var local_country_name = config.populstat.countries[all_countries[i]];

        for (var x = 0; x < all_cities.length; x++) {
          var local_city = local_country[all_cities[x]];
          var reparse_coords = false;

          if (local_city.latitude != undefined && local_city.longitude != undefined)
            local_city.coords = [local_city.latitude, local_city.longitude];
          if (local_city.coords == undefined || local_city.coords == null) reparse_coords = true;
          if (!reparse_coords && (local_city.coords[0] == 0 && local_city.coords[1] == 0)) reparse_coords = true;
          
          /*if (reparse_coords) {
            var local_city_names = [local_city.name];

            if (local_city.other_names)
              local_city_names = local_city_names.concat(local_city.other_names);

            //Iterate over all local_city_names to fix coords
            for (var y = 0; y < local_city_names.length; y++) try {
              var local_coords = await getOSMCityCoords(`${local_city_names[y]}, ${local_country_name}`);

              if (local_coords && (local_coords[0] != 0 || local_coords[1] != 0)) {
                local_city.coords = local_coords;
                break;
              }
            } catch (e) { console.error(e); }
          }*/
        }
      } else {
        try {
          //This is a Chandler-Modelski city, geolocate using Google Maps if possible first
          var processed_city_name = all_countries[i].split("-").join(", ");
          var reparse_coords = false;

          if (local_country.latitude == undefined || local_country.longitude == undefined) reparse_coords = true;
          if (local_country.latitude == undefined || local_country.longitude == undefined) reparse_coords = true;
          
          if (local_country.latitude != undefined && local_country.longitude != undefined)
            local_country.coords = [local_country.latitude, local_country.longitude];

          /*if (reparse_coords) {
            console.log(`- Attempting to reparse coords for ${processed_city_name} ..`);
            var local_coords = await getGoogleMapsCityCoords(processed_city_name);
            if (!local_coords) local_coords = await getOSMCityCoords(processed_city_name);

            console.log(` - local_coords:`, local_coords);
            if (local_coords && (local_coords[0] != 0 || local_coords[1] != 0)) {
              local_country.coords = local_coords;
              local_country.latitude = local_coords[0];
              local_country.longitude = local_coords[1];

              continue;
            }
          }*/

          //Assign local_country.coords otherwise
          local_country.coords = [local_country.latitude, local_country.longitude];
        } catch (e) {
          console.error(e);
        }
      }
    }

    //Save UUD object if necessary
    if (options.save_uud_obj) saveUUDObject(uud_obj);

    //Return statement
    return uud_obj;
  };
  
  //[WIP] - REFACTOR START
  global.initialiseUUD = function (arg0_options) {
    var options = arg0_options || {};
    
    // Fetch datasets
    var buringh_obj = getBuringhObject();
    var devries_obj = getDeVriesCitiesObject();
    var populstat_obj = JSON.parse(JSON.stringify(main.population.populstat));
    var chandler_modelski_obj = main.population.chandler_modelski;
    
    // --- Step 0: Multiply Populstat population values by 1000 ---
    Object.keys(populstat_obj).forEach((country) => {
      Object.keys(populstat_obj[country]).forEach((cityKey) => {
        var city = populstat_obj[country][cityKey];
        if (city.population) {
          city.population = operateObject(city.population, "n = n*1000");
        }
      });
    });
    
    // --- Helper: semantic check (simple version) ---
    function semanticMatch(nameA, nameB) {
      if (!nameA || !nameB) return false;
      nameA = nameA.trim().toLowerCase();
      nameB = nameB.trim().toLowerCase();
      return (
        nameA === nameB ||
        nameA.includes(nameB) ||
        nameB.includes(nameA)
      );
    }
    
    // --- Helper: merge populations using weightedGeometricMean ---
    function mergePopulations(populationsArr) {
      var years = new Set();
      populationsArr.forEach((popObj) => {
        Object.keys(popObj || {}).forEach((year) => years.add(year));
      });
      
      var merged = {};
      years.forEach((year) => {
        var values = populationsArr
        .map((popObj) => popObj && popObj[year])
        .filter((v) => v !== undefined && v > 0);
        if (values.length === 1) merged[year] = values[0];
        else if (values.length > 1) merged[year] = weightedGeometricMean(values);
      });
      return merged;
    }
    
    // --- Helper: flatten all cities from all sources into a flat array ---
    function flattenCities() {
      var arr = [];
      // Populstat
      Object.keys(populstat_obj).forEach((country) => {
        Object.keys(populstat_obj[country]).forEach((cityKey) => {
          var city = populstat_obj[country][cityKey];
          arr.push({
            ...city,
            __source: "populstat",
            __country: country,
            __cityKey: cityKey
          });
        });
      });
      // Chandler-Modelski
      Object.keys(chandler_modelski_obj).forEach((cityKey) => {
        var city = chandler_modelski_obj[cityKey];
        arr.push({
          ...city,
          __source: "chandler_modelski",
          __country: null,
          __cityKey: cityKey
        });
      });
      // Buringh
      Object.keys(buringh_obj).forEach((cityKey) => {
        var city = buringh_obj[cityKey];
        arr.push({
          ...city,
          __source: "buringh",
          __country: null,
          __cityKey: cityKey
        });
      });
      // DeVries
      Object.keys(devries_obj).forEach((cityKey) => {
        var city = devries_obj[cityKey];
        arr.push({
          ...city,
          __source: "devries",
          __country: null,
          __cityKey: cityKey
        });
      });
      return arr;
    }
    
    // --- Helper: check if two cities are mergeable ---
    function canMerge(cityA, cityB) {
      // Defensive: both must have coords as arrays of length 2
      if (
        !cityA.coords ||
        !cityB.coords ||
        !Array.isArray(cityA.coords) ||
        !Array.isArray(cityB.coords) ||
        cityA.coords.length < 2 ||
        cityB.coords.length < 2
      ) {
        return false;
      }
      
      if (cityA.__source === cityB.__source) return false;
      if (!semanticMatch(cityA.key || cityA.name, cityB.key || cityB.name)) return false;
      var latA = parseFloat(cityA.coords[0]);
      var lonA = parseFloat(cityA.coords[1]);
      var latB = parseFloat(cityB.coords[0]);
      var lonB = parseFloat(cityB.coords[1]);
      var dLat = Math.abs(latA - latB);
      var dLon = Math.abs(lonA - lonB);
      
      // Populstat rule
      if (cityA.__source === "populstat" || cityB.__source === "populstat") {
        return dLat <= 0.1 && dLon <= 0.1;
      }
      // Non-populstat rule: 5 arcmin = 0.083333...
      return dLat <= 0.0833334 && dLon <= 0.0833334;
    }
    
    // --- Step 1: Merge all cities into a single list, merging as needed ---
    var mergedCities = [];
    
    flattenCities().forEach((city) => {
      // Try to merge with an existing city
      var found = false;
      for (var i = 0; i < mergedCities.length; i++) {
        var merged = mergedCities[i];
        if (
          canMerge(city, merged) &&
          !merged.sources.includes(city.__source)
        ) {
          // Merge populations
          merged.population = mergePopulations([
            merged.population || {},
            city.population || {}
          ]);
          merged.sources.push(city.__source);
          // Optionally, merge other metadata as needed
          found = true;
          break;
        }
      }
      if (!found) {
        // New merged city
        var newCity = { ...city };
        newCity.sources = [city.__source];
        newCity.type = city.__source;
        mergedCities.push(newCity);
      }
    });
    
    // --- Step 2: Build UUD structure ---
    var uud_obj = {};
    // When building UUD structure
    mergedCities.forEach((city) => {
      // Try to get a valid country name
      var country = city.__country;
      if (!country || country === null || country === undefined) {
        // Try to use .region, .country, or fallback to "unknown"
        country =
          city.region ||
          city.country ||
          "unknown";
      }
      var cityKey = city.__cityKey || city.key || city.name;
      if (!uud_obj[country]) uud_obj[country] = {};
      uud_obj[country][cityKey] = city;
    });
    
    return uud_obj;
  };
  //[WIP] - REFACTOR END

  global.interpolateUUD = function (arg0_uud_obj) {
    //Convert from parameters
    var uud_obj = arg0_uud_obj;

    //Iterate over all years in config.uud.processing
    for (var i = config.uud.processing.uud_domain[0]; i <= config.uud.processing.uud_domain[1]; i++)
      uud_obj = interpolateUUDForYear(uud_obj, i);

    //Return statement
    return uud_obj;
  };

  global.interpolateUUDForYear = function (arg0_uud_obj, arg1_year) {
    //Convert from parameters
    var uud_obj = arg0_uud_obj;
    var year = arg1_year;

    //Declare local instance variables
    var all_countries = Object.keys(uud_obj);

    //Iterate over all_countries
    for (var i = 0; i < all_countries.length; i++) try {
      var local_country = uud_obj[all_countries[i]];
      var log_interpolated_country_string = `- Interpolated country: ${all_countries[i]}, (${i}/${all_countries.length})`;

      console.time(log_interpolated_country_string);
      if (local_country.type != "chandler_modelski") {
        //Iterate over all_cities
        var all_cities = Object.keys(local_country);

        for (var x = 0; x < all_cities.length; x++) try {
          var local_city = local_country[all_cities[x]];

          if (local_city.population && Object.keys(local_city.population).length >= 2)
            local_city.population = cubicSplineInterpolationObject(local_city.population, { years: year });
        } catch (e) { console.error(e); }
      } else {
        //This is a Chandler-Modelski city, so interpolate based on the so-called 'country' level
        if (local_country.population && Object.keys(local_country.population).length >= 2) try {
          local_country.population = cubicSplineInterpolationObject(local_country.population, { years: year });
        } catch (e) { console.error(e); }
      }
      console.timeEnd(log_interpolated_country_string);
    } catch (e) {
      console.error(e);
    }

    //Return statement
    return uud_obj;
  };

  /**
   * processUUD() - Merges all UUD city data into having monolithic .population estimates
   * @param {*} arg0_uud_obj 
   * 
   * @returns {Object}
   */
  global.processUUD = function (arg0_uud_obj) {
    //Convert from parameters
    var uud_obj = arg0_uud_obj;

    //Interpolate and flatten UUD data for all years
    try { uud_obj = interpolateUUD(uud_obj); } catch (e) { console.error(e); }
    
    //Return statement
    return uud_obj;
  };

  global.processUUDForYear = function (arg0_uud_obj, arg1_year) {
    //Convert from parameters
    var uud_obj = arg0_uud_obj;
    var year = parseInt(arg1_year);

    //Interpolate and flatten UUD data for given year
    try { uud_obj = interpolateUUDForYear(uud_obj, year); } catch (e) { console.error(e); }

    //Return statement
    return uud_obj;
  };

  //saveUUDData() - Both initialises, then saves UUD data.
  global.saveUUDData = async function () {
    //Declare local instance variables
    console.log(`Began the process of saving UUD data.`);
    console.time(`- Initialising UUD ..`);
    var uud_obj = initialiseUUD();
    console.timeEnd(`- Initialising UUD ..`);
    
    console.time(`- Fixing missing coords in UUD ..`);
    uud_obj = await fixCoordsInUUD(uud_obj);
    console.timeEnd(`- Fixing missing coords in UUD ..`);

    //Save uud_obj
    console.time(`- Saving raw UUD data...`);
    FileManager.saveFileAsJSON(config.defines.common.input_file_paths.uud_cities, uud_obj);
    console.timeEnd(`- Saving raw UUD data...`);

    var new_uud_obj = JSON.parse(JSON.stringify(uud_obj));

    //Iterate over all hyde_years in config.uud.processing
    for (var i = 0; i < config.uud.processing.hyde_years.length; i++) {
      var local_year = config.uud.processing.hyde_years[i];

      console.time(`- Processing UUD for ${local_year} ..`);
      new_uud_obj = saveUUDDataForYear(new_uud_obj, local_year);
      console.timeEnd(`- Processing UUD for ${local_year} ..`);
    }

    //Finish processing new_uud_obj by rounding all population figures
    var all_countries = Object.keys(new_uud_obj);

    for (var i = 0; i < all_countries.length; i++) {
      var local_country = new_uud_obj[all_countries[i]];

      if (local_country.type != "chandler_modelski") {
        //Iterate over all_cities
        var all_cities = Object.keys(local_country);

        for (var x = 0; x < all_cities.length; x++) {
          var local_city = local_country[all_cities[x]];

          if (local_city.population)
            local_city.population = operateObject(local_city.population, `Math.round(n)`);
        }
      } else {
        if (local_country.population)
          local_country.population = operateObject(local_country.population, `Math.round(n)`);
      }
    }

    //Save new uud_obj
    console.time(`- Saving final processed UUD data...`)
    saveUUDObject(new_uud_obj);
    console.timeEnd(`- Saving final processed UUD data...`);
  };

  global.saveUUDDataForYear = function (arg0_uud_obj, arg1_year) {
    //Convert from parameters
    var uud_obj = (arg0_uud_obj) ? arg0_uud_obj : initialiseUUD();
    var year = parseInt(arg1_year);

    //Process uud_obj
    console.time(`- Processing UUD data...`);
    uud_obj = processUUDForYear(uud_obj, year);
    console.timeEnd(`- Processing UUD data...`);

    //Save new uud_obj
    console.time(`- Saving processed UUD data...`);
    FileManager.saveFileAsJSON(config.defines.common.input_file_paths.processed_uud_cities, uud_obj);
    console.timeEnd(`- Saving processed UUD data...`);

    //Return statement
    return uud_obj;
  };

  global.saveUUDObject = function (arg0_uud_obj) {
    //Convert from parameters
    var uud_obj = arg0_uud_obj;

    //Save uud_obj
    console.time(`- Saving UUD object ..`);
    FileManager.saveFileAsJSON(config.defines.common.input_file_paths.processed_uud_cities, uud_obj);
    console.timeEnd(`- Saving UUD object ..`);
  };
  
  global.testUUD = function () {
  
  };
}
