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

          if (local_city.coords == undefined || local_city.coords == null) reparse_coords = true;
          if (!reparse_coords && (local_city.coords[0] == 0 && local_city.coords[1] == 0)) reparse_coords = true;

          if (reparse_coords) {
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
          }
        }
      } else {
        try {
          //This is a Chandler-Modelski city, geolocate using Google Maps if possible first
          var processed_city_name = all_countries[i].split("-").join(", ");
          var reparse_coords = false;

          if (local_country.latitude == undefined || local_country.longitude == undefined) reparse_coords = true;
          if (local_country.latitude == null || local_country.longitude == null) reparse_coords = true;

          if (reparse_coords) {
            console.log(`- Attempting to reparse coords for ${processed_city_name} ..`);
            var local_coords = await getGoogleMapsCityCoords(processed_city_name);
            if (!local_coords) local_coords = await getOSMCityCoords(processed_city_name);

            console.log(` - local_coords:`, local_coords);
            if (local_coords && (local_coords[0] != 0 || local_coords[1] != 0))
              local_country.coords = local_coords;
          }
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

  global.flattenMetrosInUUD = function (arg0_uud_obj, arg1_options) {
    //Convert from parameters
    var uud_obj = arg0_uud_obj;
    var options = (arg1_options) ? arg1_options : {};

    //Iterate over all years in config.uud.processing
    for (var i = config.uud.processing.uud_domain[0]; i <= config.uud.processing.uud_domain[1]; i++)
      uud_obj = flattenMetrosInUUDForYear(uud_obj, i, options);

    //Return statement
    return uud_obj;
  };

  global.flattenMetrosInUUDForYear = function (arg0_uud_obj, arg1_year, arg2_options) {
    //Convert from parameters
    var uud_obj = arg0_uud_obj;
    var year = parseInt(arg1_year);
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var all_countries = Object.keys(uud_obj);

    //Iterate over all_countries
    for (var i = 0; i < all_countries.length; i++) {
      var local_country = uud_obj[all_countries[i]];

      if (local_country.type != "chandler_modelski") {
        //Iterate over all_cities
        var all_cities = Object.keys(local_country);

        for (var x = 0; x < all_cities.length; x++) {
          var local_city = local_country[all_cities[x]];

          if (local_city.is_agglomeration_of) {
            //Guard clause if no population
            if (!local_city.population) continue;
            if (Object.keys(local_city.population).length == 0) continue;

            //1. Fetch local_agglomeration_obj; subtract suburbs from .is_agglomeration_of figures for overlapping years where possible
            var local_agglomeration_obj = getPopulstatCity(`${local_city.is_agglomeration_of}, ${all_countries[i]}`, {
              populstat_obj: uud_obj,
              same_country: true
            });

            if (local_agglomeration_obj) {
              if (local_agglomeration_obj.name != local_city.name) {
                var local_value = local_city.population[year];

                if (local_value && local_agglomeration_obj.population[year])
                  modifyValue(local_agglomeration_obj.population, year, local_value*-1);
              }

              //Mark as .is_agglomeration
              local_city.is_agglomeration = true;
            }
          }
        }
      }
    }

    //2. Remove any negative numbers from agglomerations if specified and replace them with the nearest positive number
    if (!options.do_not_remove_negative_numbers)
      //Iterate over all_countries
      for (var i = 0; i < all_countries.length; i++) {
        var local_country = uud_obj[all_countries[i]];

        if (local_country.type != "chandler_modelski") {
          //Iterate over all_cities
          var all_cities = Object.keys(local_country);

          for (var x = 0; x < all_cities.length; x++) {
            var local_city = local_country[all_cities[x]];

            if (local_city.is_agglomeration)
              if (local_city.population[year] != undefined && local_city.population[year] < 0)
                local_city.population[year] = getNearestPositiveNumberInObject(local_city.population, year);
          }
        }
      }

    //Return statement
    return uud_obj;
  };

  global.initialiseUUD = function (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var all_chandler_modelski_cities = Object.keys(main.population.chandler_modelski);
    var uud_obj = JSON.parse(JSON.stringify(main.population.populstat));

    var all_countries = Object.keys(uud_obj);

    //1. Iterate over all_countries; make sure .population figures for Populstat is multiplied by 1000
    for (var i = 0; i < all_countries.length; i++) {
      var local_country = uud_obj[all_countries[i]];

      //Iterate over all_local_cities
      var all_local_cities = Object.keys(local_country);

      for (var x = 0; x < all_local_cities.length; x++) {
        var local_city = local_country[all_local_cities[x]];

        if (local_city.population)
          local_city.population = operateObject(local_city.population, `n = n*1000`);
      }
    }

    //2. Iterate over all_chandler_modelski_cities; link each one to a UUD city if possible
    for (var i = 0; i < all_chandler_modelski_cities.length; i++) {
      var local_city = main.population.chandler_modelski[all_chandler_modelski_cities[i]];
      var local_split_city_name = all_chandler_modelski_cities[i].split("-");

      var local_country_name = local_split_city_name[local_split_city_name.length - 1];
        local_split_city_name.pop();
        local_split_city_name = local_split_city_name.join("-");
      
      var local_city_names = [`${local_split_city_name}, ${local_country_name}`, local_split_city_name];

      if (local_city.other_names) {
        var local_other_names = getList(local_city.other_names);

        for (var x = 0; x < local_other_names.length; x++) {
          local_city_names.push(`${local_other_names[x]}, ${local_country_name}`);
          local_city_names.push(local_other_names[x]);
        }
      }

      //3. Iterate over local_city_names; find local_uud_city
      var local_uud_city;

      for (var x = 0; x < local_city_names.length; x++) try {
        local_uud_city = getPopulstatCity(local_city_names[x], { populstat_obj: uud_obj });

        //Only find cities that are within 1 degree of .coords
        if (local_uud_city) {
          //Check if .latitude and .longitude are within 1 degree of .coords
          var latlng = local_uud_city.coords;
          var ot_latlng = [local_city.latitude, local_city.longitude];

          if (Math.abs(latlng[0] - ot_latlng[0]) <= 1 && Math.abs(latlng[1] - ot_latlng[1]) <= 1) {
            if (options.debug) {
              local_uud_city.break_condition = [local_city_names[x], true];
              local_uud_city.latlng = latlng;
              local_uud_city.ot_latlng = ot_latlng;
            }
            break;
          }
        }

        //Reset local_uud_city for next iteration
        local_uud_city = undefined;
      } catch (e) {
        //console.log(local_city_names);
        console.error(e);
      }

      //Otherwise; check if there are any UUD cities whose .coords are within 0,1 degrees of ot_latlng; fetch closest match
      //Iterate over all_countries
      var closest_uud_city = [undefined, 1];

      if (!local_uud_city) {
        for (var x = 0; x < all_countries.length; x++) {
          var local_country = uud_obj[all_countries[x]];

          //Iterate over all_cities in country
          var all_cities = Object.keys(local_country);

          for (var y = 0; y < all_cities.length; y++) {
            var local_ot_city = local_country[all_cities[y]];

            if (local_ot_city.type) continue; //Skip if .type is already set; this is likely a Chandler-Modelski city

            var latlng = local_ot_city.coords;
            var ot_latlng = [local_city.latitude, local_city.longitude];

            if (latlng)
              if (Math.abs(latlng[0] - ot_latlng[0]) <= 0.1 && Math.abs(latlng[1] - ot_latlng[1]) <= 0.1) {
                var sum_distance = Math.abs(latlng[0] - ot_latlng[0]) + Math.abs(latlng[1] - ot_latlng[1]);

                if (sum_distance < closest_uud_city[1] && sum_distance < 0.2)
                  closest_uud_city = [local_country[all_cities[y]], sum_distance];
              }
          }
        }

        if (closest_uud_city[0])
          local_uud_city = closest_uud_city[0]; //[WIP] - This needs to be reworked to either a dumbMergeCities() or smartMergeCities() because this is not a shallow copy
      }

      //4. Assign populstat/chandler_modelski city types
      if (local_uud_city) {
        local_uud_city.type = "populstat";
        local_uud_city.chandler_modelski_coords = [local_city.latitude, local_city.longitude];
        local_uud_city.chandler_modelski_key = all_chandler_modelski_cities[i];
        local_uud_city.chandler_modelski_population = local_city.population;
      } else {
        //Set local_city as a new UUD city
        local_city.type = "chandler_modelski";
        uud_obj[all_chandler_modelski_cities[i]] = local_city;
      }
    }

    //5. Set .type for all remaining UUD cities
    var all_countries = Object.keys(uud_obj);

    //Iterate over all_countries
    for (var i = 0; i < all_countries.length; i++) {
      var local_country = uud_obj[all_countries[i]];

      if (local_country.type) continue; //Skip if .type is already set; this is likely a Chandler-Modelski city

      //Iterate over all_cities
      var all_cities = Object.keys(local_country);

      for (var x = 0; x < all_cities.length; x++) {
        var local_uud_city = local_country[all_cities[x]];
        
        if (!local_uud_city.type) 
          local_uud_city.type = "populstat";
      }
    }

    //6. Handle .type = "populstat" first
    //Iterate over all_countries
    for (var i = 0; i < all_countries.length; i++) {
      var local_country = uud_obj[all_countries[i]];

      if (local_country.type) continue; //Internal guard clause; this is likely a Chandler-Modelski city

      //Iterate over all_cities
      var all_cities = Object.keys(local_country);

      for (var x = 0; x < all_cities.length; x++) {
        var local_uud_city = local_country[all_cities[x]];

        if (!local_uud_city.population) local_uud_city.population = {};

        //2. Merge .chandler_modelski_population into .population using geometric mean where domains overlap
        if (local_uud_city.chandler_modelski_population) {
          var all_chandler_modelski_population_keys = Object.keys(local_uud_city.chandler_modelski_population);

          //Iterate over all_chandler_modelski_population_keys
          for (var y = 0; y < all_chandler_modelski_population_keys.length; y++) {
            var local_chandler_modelski_value = local_uud_city.chandler_modelski_population[all_chandler_modelski_population_keys[y]];
            var local_population_value = local_uud_city.population[all_chandler_modelski_population_keys[y]];

            if (local_population_value != undefined && local_population_value > 0) {
              local_uud_city.population[all_chandler_modelski_population_keys[y]] = weightedGeometricMean([local_population_value, local_chandler_modelski_value]);
            } else {
              local_uud_city.population[all_chandler_modelski_population_keys[y]] = local_chandler_modelski_value;
            }
          }
        }
      }
    }

    //Return statement
    return uud_obj;
  };

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
    try { uud_obj = flattenMetrosInUUD(uud_obj, {
      do_not_remove_negative_numbers: true
    }); } catch (e) { console.error(e); }
    
    //Return statement
    return uud_obj;
  };

  global.processUUDForYear = function (arg0_uud_obj, arg1_year) {
    //Convert from parameters
    var uud_obj = arg0_uud_obj;
    var year = parseInt(arg1_year);

    //Interpolate and flatten UUD data for given year
    try { uud_obj = interpolateUUDForYear(uud_obj, year); } catch (e) { console.error(e); }
    try { uud_obj = flattenMetrosInUUDForYear(uud_obj, year, {
      do_not_remove_negative_numbers: true
    }); } catch (e) { console.error(e); }

    //Return statement
    return uud_obj;
  };

  /**
   * removeUUDGrowthRateOutliers() - Removes growth rate outliers from UUD - anything with a yearly growth rate of more than 25% or less than -25%
   * @param {Object} arg0_uud_obj 
   * 
   * @returns {Object}
   */
  global.removeUUDGrowthRateOutliers = function (arg0_uud_obj) { //[WIP] - Finish function body
    //Convert from parameters
    var uud_obj = arg0_uud_obj;

    //Declare local instance variables

    
    //Return statement
    return uud_obj;
  };

  //saveUUDData() - Both initialises, then saves UUD data.
  global.saveUUDData = async function () {
    //Declare local instance variables
    console.time(`- Initialising UUD ..`);
    var uud_obj = initialiseUUD();
    console.timeEnd(`- Initialising UUD ..`);

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

    console.time(`- Fixing missing coords in UUD ..`);
    new_uud_obj = await fixCoordsInUUD(new_uud_obj);
    console.timeEnd(`- Fixing missing coords in UUD ..`);

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
}
