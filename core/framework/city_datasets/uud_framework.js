//Initialise functions
{
  global.flattenMetrosInUUD = function (arg0_uud_obj, arg1_options) { //[WIP] - Move this to a stage 2 function post-interpolation
    //Convert from parameters
    var uud_obj = arg0_uud_obj;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_countries = Object.keys(uud_obj);

    //Iterate over all countries
    for (var i = 0; i < all_countries.length; i++) {
      var local_country = uud_obj[all_countries[i]];

      if (local_country.type != "chandler_modelski") {
        //Iterate over all_cities
        var all_cities = Object.keys(local_country);

        for (var x = 0; x < all_cities.length; x++) {
          var local_city = local_country[all_cities[x]];

          if (local_city.is_agglomeration_of) {
            //Guard clause if no population
            if (!local_city.population) return;
            if (Object.keys(local_city.population).length == 0) return;

            //1. Fetch local_agglomeration_obj; subtract suburbs from .is_agglomeration_of figures for overlapping years where possible
            var local_agglomeration_obj = getPopulstatCity(`${local_city.is_agglomeration_of}, ${all_countries[i]}`, { same_country: true });

            if (local_agglomeration_obj) {
              if (local_agglomeration_obj.name != local_city.name) {
                //Iterate over all_local_population_keys
                var all_local_population_keys = Object.keys(local_city.population);

                for (var y = 0; y < all_local_population_keys.length; y++) {
                  var local_value = local_city.population[all_local_population_keys[y]];

                  if (local_agglomeration_obj.population[all_local_population_keys[y]])
                    modifyValue(local_agglomeration_obj.population, all_local_population_keys[y], local_value*-1);
                }
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

            if (local_city.is_agglomeration) {
              var all_local_city_population_keys = Object.keys(local_city.population);

              for (var y = 0; y < all_local_city_population_keys.length; y++) {
                var local_value = local_city.population[all_local_city_population_keys[y]];

                if (local_value < 0)
                  local_value = getNearestPositiveNumberInObject(local_city.population, all_local_city_population_keys[y]);
              }
            }
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
          local_uud_city = closest_uud_city[0];
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

    //Return statement
    return uud_obj;
  };

  global.interpolateUUD = function (arg0_uud_obj) {
    //Convert from parameters
    var uud_obj = arg0_uud_obj;
    
    //Declare local instance variables
    var all_countries = Object.keys(uud_obj);

    //Iterate over all_countries
    for (var i = 0; i < all_countries.length; i++) try {
      var interpolating_country_log_string = ` - Interpolating country: ${all_countries[i]}, (${i}/${all_countries.length})`;
      var local_country = uud_obj[all_countries[i]];

      console.time(interpolating_country_log_string);
      if (local_country.type != "chandler_modelski") {
        //Iterate over all_cities
        var all_cities = Object.keys(local_country);

        for (var x = 0; x < all_cities.length; x++) try {
          var local_city = local_country[all_cities[x]];

          var interpolating_city_log_string = `  - Interpolating: ${all_cities[x]}, (${x}/${all_cities.length}) for all years.`;
          console.time(interpolating_city_log_string);
          if (local_city.population && Object.keys(local_city.population).length >= 2)
            local_city.population = cubicSplineInterpolationObject(local_city.population, {
              all_years: true
            });
          console.timeEnd(interpolating_city_log_string);
        } catch (e) {
          console.error(e);
        }
      } else {
        //This is a Chandler-Modelski city, so interpolate based on the so-called 'country' level
        if (local_country.population && Object.keys(local_country.population).length >= 2) try {
          local_country.population = cubicSplineInterpolationObject(local_country.population, {
            all_years: true
          });
        } catch (e) {
          console.error(e);
        }
      }
      console.timeEnd(interpolating_country_log_string);
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

    //Declare local instance variables
    var all_countries = Object.keys(uud_obj);

    //1. Handle .type = "populstat" first
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

    //3. Interpolate and flatten UUD data
    try {
      uud_obj = interpolateUUD(uud_obj);
    } catch (e) { console.error(e); }
    try {
      uud_obj = flattenMetrosInUUD(uud_obj);
    } catch (e) { console.error(e); }
    
    //Return statement
    return uud_obj;
  };

  /**
   * removeUUDGrowthRateOutliers() - Removes growth rate outliers from UUD - anything with a yearly growth rate of more than 25% or less than -25%
   * @param {Object} arg0_uud_obj 
   * 
   * @returns {Object}
   */
  global.removeUUDGrowthRateOutliers = function (arg0_uud_obj) {
    //Convert from parameters
    var uud_obj = arg0_uud_obj;

    //Declare local instance variables

    
    //Return statement
    return uud_obj;
  };

  global.saveUUDData = function () {
    //Declare local instance variables
    console.time(`- Initialising UUD ..`);
    var uud_obj = initialiseUUD();
    console.timeEnd(`- Initialising UUD ..`);

    //Save uud_obj
    console.time(`- Saving raw UUD data...`);
    FileManager.saveFileAsJSON(config.defines.common.input_file_paths.uud_cities, uud_obj);
    console.timeEnd(`- Saving raw UUD data...`);

    //Process uud_obj
    console.time(`- Processing UUD data...`);
    new_uud_obj = processUUD(JSON.parse(JSON.stringify(uud_obj)));
    console.timeEnd(`- Processing UUD data...`);

    //Save new_uud_obj
    console.time(`- Saving processed UUD data...`);
    FileManager.saveFileAsJSON(config.defines.common.input_file_paths.processed_uud_cities, new_uud_obj);
    console.timeEnd(`- Saving processed UUD data...`);
  };
}
