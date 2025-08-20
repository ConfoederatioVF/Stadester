//Initialise functions
{
	global.getRegionalCentreOfGravityForYear = function (arg0_region_key, arg1_year, arg2_options) {
		//Convert from parameters
		let region_key = arg0_region_key;
		let year = parseInt(arg1_year);
		let options = (arg2_options) ? arg2_options : {};
		
		//Declare local instance variables
		let common_defines = config.defines.common;
		let local_values = [];
		let regions_obj = config.defines.regions;
		let regions_raster = loadImage(common_defines.input_file_paths.regions_file_path);
		
		let selected_file_path;
		let stadester_base_raster_file_path = `${common_defines.output_file_paths.stadester_base_rasters_folder}${common_defines.output_file_paths.stadester_base_rasters_prefix}${year}.png`;
		let stadester_raster_file_path = `${common_defines.output_file_paths.stadester_rasters_folder}${common_defines.output_file_paths.stadester_rasters_prefix}${year}.png`;
		
		selected_file_path = (options.is_stadester_base) ?
			stadester_base_raster_file_path : stadester_raster_file_path;
		
		//Operate over the present raster
		console.log(`Processing ${region_key} for ${year} ..`);
		if (fs.existsSync(selected_file_path))
			operateNumberRasterImage({
				file_path: selected_file_path,
				function: function (arg0_index, arg1_number) {
					//Convert from parameters
					let local_index = arg0_index/4;
					let local_number = arg1_number;
					
					//Declare local instance variables
					let byte_index = local_index*4;
					let local_pixel = [local_index % 4320, Math.floor(local_index/4320)];
					
					if (local_number > 0) {
						let local_region = regions_obj[[
							regions_raster.data[byte_index],
							regions_raster.data[byte_index + 1],
							regions_raster.data[byte_index + 2]
						].join(",")];
						
						if (local_region)
							if (local_region.key === region_key)
								local_values.push([local_pixel[0], local_pixel[1], local_number]);
					}
				}
			});
		
		//Find centre-of-gravity if possible
		let centre_of_gravity;
		try {
			centre_of_gravity = getCentreOfGravity(local_values);
			
			console.log(`- Found centre-of-gravity at:`, centre_of_gravity);
		} catch (e) { console.error(e); }
		
		//Return statement
		return centre_of_gravity;
	};
	
	global.getRegionalCentreOfGravityOverTime = function (arg0_region_key, arg1_options) {
		//Convert from parameters
		let region_key = arg0_region_key;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let hyde_years = config.uud.processing.hyde_years.concat([2024, 2025]);
		let return_obj = {};
		let uud_domain = config.uud.processing.uud_domain;
		
		//Iterate over all hyde_years and populate return_obj
		for (let i = 0; i < hyde_years.length; i++)
			if (hyde_years[i] >= uud_domain[0] && hyde_years[i] <= uud_domain[1])
				return_obj[hyde_years[i]] = getRegionalCentreOfGravityForYear(region_key, hyde_years[i], options);
		
		//Return statement
		return return_obj;
	};
	
	global.getRegionalCentresOfGravityOverTime = function (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let common_defines = config.defines.common;
		let region_defines = config.defines.regions;
		let return_obj = {};
		
		//Iterate over all_regions_defines
		let all_region_keys = Object.keys(region_defines);
		
		for (let i = 0; i < all_region_keys.length; i++) {
			let local_region = region_defines[all_region_keys[i]];
			
			if (!local_region.is_clone) {
				console.log(`Starting processing for:`, local_region.key);
				return_obj[local_region.key] = getRegionalCentreOfGravityOverTime(local_region.key, options);
			}
		}
		
		//Save file to ./output folder
		if (options.is_stadester_base) {
			FileManager.saveFileAsJSON(common_defines.output_file_paths.regional_cogs_base, return_obj);
		} else {
			FileManager.saveFileAsJSON(common_defines.output_file_paths.regional_cogs_ghsl, return_obj);
		}
		
		//Return statement
		return return_obj;
	};
}