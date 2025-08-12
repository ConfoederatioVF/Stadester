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
            } catch (e) {
              console.error(e);
            }
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
            if (local_coords && (local_coords[0] != 0 || local_coords[1] != 0)) {
              local_country.coords = local_coords;
              local_country.latitude = local_coords[0];
              local_country.longitude = local_coords[1];
              
              continue;
            }
          }
          
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
}