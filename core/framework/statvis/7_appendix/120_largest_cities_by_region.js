//Initialise functions
{
	global.generate120LargestCitiesByRegionTable = function (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		options.benchmark_years = (options.benchmark_years) ?
			getList(options.benchmark_years) : [0, 1000, 1500, 1800, 1900, 1950, 1975, 2025];
		options.threshold = returnSafeNumber(options.threshold, 120);
		
		//Declare local instance variables
		let common_defines = config.defines.common;
		let region_defines = config.defines.regions;
		let stadester_ghsl_obj = FileManager.loadFileAsJSON(common_defines.output_file_paths.stadester_ghsl);
		
		//Iterate over all_region_keys and generate a CSV of the 120 largest cities per region
		let all_cities = Object.keys(stadester_ghsl_obj);
		let all_region_keys = Object.keys(region_defines);
		
		for (let i = 0; i < all_region_keys.length; i++) {
			let local_region = region_defines[all_region_keys[i]];
			
			if (!local_region.is_clone) {
				let local_csv_output_path = `${common_defines.output_file_paths.appendix_folder}${all_region_keys[i]}${common_defines.output_file_paths.largest_120_csv_suffix}`
				let max_pop_dictionary = {};
				let return_array = [];
				let return_obj = {};
				
				//Iterate over all_cities and find the 120 largest cities per region by maximum population
				for (let x = 0; x < all_cities.length; x++) {
					let local_city = stadester_ghsl_obj[all_cities[x]];
					
					if (local_city.region === local_region.key && local_city.population)
						max_pop_dictionary[all_cities[x]] = Math.max(...Object.values(local_city.population).map(Math.round));
				}
				max_pop_dictionary = sortObject(max_pop_dictionary);
				
				//Iterate over all_local_cities in max_pop_dictionary up to options.threshold
				let all_local_cities = Object.keys(max_pop_dictionary);
				
				for (let x = 0; x < options.threshold; x++) {
					let local_city = stadester_ghsl_obj[all_local_cities[x]];
					
					return_obj[all_local_cities[x]] = {
						rank: `#${x + 1}.`,
						name: local_city.name,
						other_names: (local_city.other_names) ? local_city.other_names.join(", ") : ""
					};
					let local_obj = return_obj[all_local_cities[x]];
					
					//Iterate over all options.benchmark_years
					for (let y = 0; y < options.benchmark_years.length; y++)
						local_obj[`population_${options.benchmark_years[y]}`] = returnSafeNumber(local_city.population[options.benchmark_years[y]]);
					
					if (local_city.area)
						local_obj.max_area = Math.max(...Object.values(local_city.area).map(Number));
					if (local_city.density)
						local_obj.max_density = Math.max(...Object.values(local_city.density).map(Number));
				}
				
				//Create return_array by iterating over all_return_keys; save return_array to a proper CSV
				let all_return_keys = Object.keys(return_obj);
				
				for (let x = 0; x < all_return_keys.length; x++) {
					let local_return_city = return_obj[all_return_keys[x]];
					
					return_array.push({ ...local_return_city });
				}
				
				console.log(`Saved 120 largest cities for ${local_region.name} as ${local_csv_output_path}.`);
				FileManager.saveFileAsCSV(local_csv_output_path, return_array);
			}
		}
	}
}