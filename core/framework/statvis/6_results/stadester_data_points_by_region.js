//Initialise functions
{
	global.stadesterGetDataPointsByRegionObject = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let hyde_years = config.uud.processing.hyde_years.concat([2024, 2025]);
		let region_defines = config.defines.regions;
		let return_array = [];
		let return_obj = {};
		let stadester_ghsl_obj = FileManager.loadFileAsJSON(common_defines.output_file_paths.stadester_ghsl);
		
		//Iterate over all_region_defines
		let all_region_keys = Object.keys(region_defines);
		
		for (let i = 0; i < all_region_keys.length; i++) {
			let local_region = region_defines[all_region_keys[i]];
			
			if (!local_region.is_clone)
				return_obj[local_region.key] = {
					area: {},
					density: {},
					population: {},
					total: {}
				};
		}
		
		//Iterate over all_cities in stadester_ghsl_obj and assign by .region
		let all_cities = Object.keys(stadester_ghsl_obj);
		
		for (let i = 0; i < all_cities.length; i++) {
			let local_city = stadester_ghsl_obj[all_cities[i]];
			
			if (local_city.region)
				if (local_city.population) {
					let all_population_keys = Object.keys(local_city.population);
					
					for (let x = 0; x < hyde_years.length; x++) {
						if (local_city.area && local_city.area[hyde_years[x]])
							modifyValue(return_obj[local_city.region].area, hyde_years[x], 1);
						if (local_city.density && local_city.density[hyde_years[x]])
							modifyValue(return_obj[local_city.region].density, hyde_years[x], 1);
						if (local_city.population[hyde_years[x]])
							modifyValue(return_obj[local_city.region].population, hyde_years[x], 1);
					}
				}
		}
		
		//Iterate over all_return_keys and compute return_obj[all_return_keys[i]].total
		let all_return_keys = Object.keys(return_obj);
		
		for (let i = 0; i < all_return_keys.length; i++) {
			let local_region = return_obj[all_return_keys[i]];
			
			//Iterate over all_local_region_keys
			let all_local_region_keys = Object.keys(local_region);
			
			for (let x = 0; x < all_local_region_keys.length; x++) {
				let local_obj = local_region[all_local_region_keys[x]];
				if (all_local_region_keys[x] === "total") continue; //Internal guard clause if this is equal to the total
				
				//Iterate over all_local_years and sum it up to .total
				let all_local_years = Object.keys(local_obj);
				
				for (let y = 0; y < all_local_years.length; y++)
					modifyValue(local_region.total, all_local_years[y], local_obj[all_local_years[y]]);
			}
		}
		
		//Iterate over all_return_keys; populate return_array
		for (let i = 0; i < all_return_keys.length; i++) {
			let local_region = return_obj[all_return_keys[i]];
			
			//Iterate over all hyde_years per region
			for (let x = 0; x < hyde_years.length; x++) {
				return_array.push({
					region: all_return_keys[i],
					year: hyde_years[x],
					name: region_defines[all_return_keys[i]].name,
					colour: RGBToHex(...region_defines[all_return_keys[i]].colour),
					
					area: returnSafeNumber(local_region.area[hyde_years[x]]),
					density: returnSafeNumber(local_region.density[hyde_years[x]]),
					population: returnSafeNumber(local_region.population[hyde_years[x]]),
					total: returnSafeNumber(local_region.total[hyde_years[x]])
				});
			}
		}
		
		//Save files as CSV, JSON
		FileManager.saveFileAsCSV(common_defines.output_file_paths.regional_datapoints_csv, return_array);
		FileManager.saveFileAsJSON(common_defines.output_file_paths.regional_datapoints, return_obj);
		
		//Return statement
		return return_obj;
	};
}