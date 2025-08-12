//Initialise functions
{
	global.getDeVriesCitiesObject = function () {
		//Declare local instance variables
		var common_defines = config.defines.common;
		var devries_cities = FileManager.loadCSVAsJSON(common_defines.input_file_paths.devries_cities, { mode: "vertical" });
		var devries_coords = loadCSVAsArray(common_defines.input_file_paths.devries_coords);
		var return_obj = {};
		
		//1. Iterate over all_cities_keys to fix issues and add them to the return_obj
		var all_cities_keys = Object.keys(devries_cities);
		
		for (let i = 0; i < all_cities_keys.length; i++) {
			let local_city = devries_cities[all_cities_keys[i]];
			
			return_obj[all_cities_keys[i]] = {};
			let actual_city = return_obj[all_cities_keys[i]];
			
			//.key
			actual_city.key = all_cities_keys[i];
			
			//.population
			actual_city.population = {};
			
			for (let x = 0; x < local_city.year.length; x++)
				if (local_city.population[x] && local_city.population[x] != "NA") {
					let local_population = parseInt(local_city.population[x]*1000);
					
					if (local_population > 0)
						actual_city.population[local_city.year[x]] = local_population;
				}
			
			//.region
			if (local_city.region) actual_city.country = local_city.region[0];
		}
		
		//2. Iterate over all_coords_keys to merge .coords with regions
		for (let i = 1; i < devries_coords.length; i++) {
			let local_value = devries_coords[i];
			
			let local_lat = parseFloat(local_value[1]);
			let local_lng = parseFloat(local_value[0]);
			let local_key = local_value[2];
			
			return_obj[local_key].coords = [local_lat, local_lng];
		}
		
		//3. Iterate over all_return_keys and change keys; process city names
		var actual_return_obj = {};
		var all_return_keys = Object.keys(return_obj);
		
		for (let i = 0; i < all_return_keys.length; i++) {
			let local_city = return_obj[all_return_keys[i]];
			let local_city_name = regulariseCityName(local_city.key);
			let local_key = (local_city.country) ? `${local_city_name}-${local_city.country}` : local_city_name;
			
			local_city.name = local_city_name;
			local_city.key = local_key;
			actual_return_obj[local_key] = local_city;
		}
		
		
		//Set main.population.devries
		main.population.devries = actual_return_obj;
		
		//Return statement
		return actual_return_obj;
	};
	
	global.regulariseCityName = function (name) {
		// Replace underscores and hyphens with spaces
		let city = name.replace(/[_-]/g, ' ');
		// Remove extra spaces
		city = city.replace(/\s+/g, ' ').trim();
		// Title case, including inside parentheses and after slashes
		city = city.replace(/([a-zA-Z]+)/g,
			w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
		);
		
		return city;
	}
}