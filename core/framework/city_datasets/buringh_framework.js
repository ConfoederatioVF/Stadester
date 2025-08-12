//Initialise functions
{
	global.getBuringhObject = function () {
		//Declare local instance variables
		var common_defines = config.defines.common;
		
		//Declare local instance variables
		var buringh_array = loadCSVAsArray(common_defines.input_file_paths.buringh_cities, {
			delimiter: "@",
			utf: "utf16le"
		});
		var header = buringh_array[0];
		var return_obj = {};
		
		//Iterate over buringh_array entries
		for (let i = 0; i < buringh_array.length; i++) {
			let local_city = buringh_array[i];
			let local_obj = {};
			
			for (let x = 0; x < local_city.length; x++)
				local_obj[header[x]] = local_city[x];
			var local_country = local_obj['country'];
			var local_key = `${local_obj.city}-${local_obj.country}`;
			
			if (!return_obj[local_obj.city]) return_obj[local_key] = {
				name: local_obj.city,
				
				coords: [
					parseFloat(local_obj['latitude in degrees'].replace(",", ".")),
					parseFloat(local_obj['longitude in degrees'].replace(",", "."))
				],
				country: local_country,
				other_names: local_obj['synonyms and historical names'].split(","),
				key: local_key,
				population: {}
			};
			var actual_city = return_obj[local_key];
			var local_population = parseFloat(local_obj['inhabitants in 000-s']);
			
			if (local_population > 0)
				actual_city.population[local_obj.year] = local_population*1000;
		}
		
		//Remove excess .city entries
		delete return_obj.city;
		delete return_obj['city-country'];
		
		//Set main.population.buringh
		main.population.buringh = return_obj;
		
		//Return statement
		return return_obj;
	};
}