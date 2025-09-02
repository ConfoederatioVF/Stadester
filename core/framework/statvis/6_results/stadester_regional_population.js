//Initialise functions
{
	global.getRasterPopulationObject = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let hyde_years = config.uud.processing.hyde_years.concat([2024, 2025]).sort((a, b) => a - b);
		let voronoi_regions_file_path = common_defines.input_file_paths.voronoi_regions_file_path;
		let voronoi_regions_raster = loadImage(voronoi_regions_file_path);
		let regions_obj = config.defines.regions;
		let return_obj = {};
		
		//Iterate over all_regions_keys; populate all_regions
		let all_regions_keys = Object.keys(regions_obj);
		
		for (let i = 0; i < all_regions_keys.length; i++) {
			let local_region = regions_obj[all_regions_keys[i]];
			
			if (!local_region.is_clone)
				return_obj[local_region.key] = {};
		}
		return_obj.world = {};
		
		//Iterate over all hyde_years
		for (let i = 0; i < hyde_years.length; i++) {
			let local_obj = {};
			let local_total_file_path = `${common_defines.output_file_paths.stadester_population_rasters_folder}${common_defines.output_file_paths.stadester_population_rasters_prefix}${hyde_years[i]}.png`;
			let local_rural_file_path = `${common_defines.output_file_paths.stadester_rural_rasters_folder}${common_defines.output_file_paths.stadester_rural_rasters_prefix}${hyde_years[i]}.png`;
			let local_urban_file_path = `${common_defines.output_file_paths.stadester_urban_rasters_folder}${common_defines.output_file_paths.stadester_urban_rasters_prefix}${hyde_years[i]}.png`;
			
			//Process all rasters to form local_obj
			let local_raster_dictionary = {
				total_population: local_total_file_path,
				rural_population: local_rural_file_path,
				urban_population: local_urban_file_path
			};
			
			//Iterate over all local_raster_keys
			let local_raster_keys = Object.keys(local_raster_dictionary);
			
			for (let x = 0; x < local_raster_keys.length; x++) {
				let local_raster_file_path = local_raster_dictionary[local_raster_keys[x]];
				
				if (fs.existsSync(local_raster_file_path))
					operateNumberRasterImage({
						file_path: local_raster_file_path,
						function: function (arg0_index, arg1_number) {
							//Convert from parameters
							let local_index = arg0_index;
							let local_number = arg1_number;
							
							//Declare local instance variables
							let byte_index = local_index;
							
							if (local_number > 0) {
								let local_region = regions_obj[[
									voronoi_regions_raster.data[byte_index],
									voronoi_regions_raster.data[byte_index + 1],
									voronoi_regions_raster.data[byte_index + 2]
								]];
								
								if (local_region)
									modifyValue(local_obj, `${local_region.key}-${local_raster_keys[x]}`, local_number);
							}
						}
					});
			}
			
			//Push local_obj to return_obj
			let all_local_obj_keys = Object.keys(local_obj);
			
			for (let x = 0; x < all_local_obj_keys.length; x++) {
				let local_value = local_obj[all_local_obj_keys[x]];
				let split_key = all_local_obj_keys[x].split("-");
				
				modifyValue(return_obj[split_key[0]], `${split_key[1]}-${hyde_years[i]}`, local_value);
				modifyValue(return_obj.world, `${split_key[1]}-${hyde_years[i]}`, local_value);
			}
			
			console.log(`- Finished processing data for ${hyde_years[i]}:`, local_obj);
		}
		
		FileManager.saveFileAsJSON(common_defines.output_file_paths.population_json, return_obj);
		
		//Return statement
		return return_obj;
	};
}