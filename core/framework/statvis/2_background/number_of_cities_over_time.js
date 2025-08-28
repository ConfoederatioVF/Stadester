//Initialise functions
{
	global.getNumberOfCitiesOverTime = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let hyde_un_urban_pop_obj = FileManager.loadCSVAsJSON(common_defines.output_file_paths.hyde_urbanisation_csv);
		let hyde_world_urban_obj = hyde_un_urban_pop_obj["World"];
		let hyde_years = config.uud.processing.hyde_years.concat([2024, 2025]).sort((a, b) => a - b);
		let return_array = [];
		let return_obj = {
			hyde_rural_population: {},
			hyde_urban_population: {},
			stadester_cities: {},
			stadester_ghsl_cities: {},
			stadester_rural_population: {},
			stadester_urban_population: {}
		};
		let world_pop_obj = getWorldPopulationObject();
		
		//Iterate over all_hyde_keys
		for (let i = 0; i < hyde_world_urban_obj.Year.length; i++) {
			return_obj.hyde_rural_population[hyde_world_urban_obj.Year[i]] = hyde_world_urban_obj["Rural population (HYDE estimates and UN projections)"][i];
			return_obj.hyde_urban_population[hyde_world_urban_obj.Year[i]] = hyde_world_urban_obj["Urban population (HYDE estimates and UN projections)"][i];
		}
		
		//Iterate over all stadester_rasters for all hyde_years
		for (let i = 0; i < hyde_years.length; i++) {
			let local_file_path = `${common_defines.output_file_paths.stadester_ghsl_rasters_folder}${common_defines.output_file_paths.stadester_ghsl_rasters_prefix}${hyde_years[i]}.png`;
			let local_stadester_base_file_path = `${common_defines.output_file_paths.stadester_base_rasters_folder}${common_defines.output_file_paths.stadester_base_rasters_prefix}${hyde_years[i]}.png`;
			
			if (fs.existsSync(local_file_path)) {
				console.log(`Processing ${hyde_years[i]} for return_obj.stadester_urban_population ..`);
				return_obj.stadester_urban_population[hyde_years[i]] = getImageSum(local_file_path);
				
				operateNumberRasterImage({
					file_path: local_file_path,
					function: function (arg0_index, arg1_number) {
						//Convert from parameters
						let local_number = arg1_number;
						
						if (local_number > 0) modifyValue(return_obj.stadester_ghsl_cities, hyde_years[i], 1);
					}
				});
			}
			if (fs.existsSync(local_stadester_base_file_path)) {
				operateNumberRasterImage({
					file_path: local_stadester_base_file_path,
					function: function (arg0_index, arg1_number) {
						//Convert from parameters
						let local_number = arg1_number;
						
						if (local_number > 0) modifyValue(return_obj.stadester_cities, hyde_years[i], 1);
					}
				});
			}
		}
		
		//Iterate over all hyde_years
		for (let i = 0; i < hyde_years.length; i++)
			return_obj.stadester_rural_population[hyde_years[i]] = world_pop_obj[hyde_years[i]] - returnSafeNumber(return_obj.stadester_urban_population[hyde_years[i]]);
		
		//Iterate over all hyde_years; populate return_array
		for (let i = 0; i < hyde_years.length; i++) {
			let all_return_keys = Object.keys(return_obj);
			let local_obj = { year: hyde_years[i] };
			
			//Iterate over all_return_keys
			for (let x = 0; x < all_return_keys.length; x++)
				local_obj[all_return_keys[x]] = return_obj[all_return_keys[x]][hyde_years[i]];
			return_array.push(local_obj);
		}
		
		//Save files as CSV
		FileManager.saveFileAsCSV(common_defines.output_file_paths.urban_rural_population_csv, return_array);
		
		//Return statement
		return return_obj;
	};
}