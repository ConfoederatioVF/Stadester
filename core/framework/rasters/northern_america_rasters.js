//Initialise functions
{
	global.generateStadesterNorthernAmericaRasters = function () { //[WIP] - Finish function body
		//Declare local instance variables
		let common_defines = config.defines.common;
		let hyde_years = config.uud.processing.hyde_years.concat([2024, 2025]).sort((a, b) => a - b);
		let land_area_raster = loadNumberRasterImage(common_defines.input_file_paths.hyde_land_area);
			let northern_america_obj = config.velkscala.northern_america;
		let raster_obj = {};
		
		let northern_america_domain = northern_america_obj.domain;
		
		//Iterate over all_png_files in common_defines.input_file_paths.velkscala_northern_america_folder; populate raster_obj
		let all_png_files = fs.readdirSync(common_defines.input_file_paths.velkscala_northern_america_folder)
			.filter((file) => path.extname(file).toLowerCase() === ".png");
		
		for (let i = 0; i < all_png_files.length; i++)
			all_png_files[i] = `${common_defines.input_file_paths.velkscala_northern_america_folder}/${all_png_files[i]}`;
		for (let i = 0; i < all_png_files.length; i++)
			raster_obj[all_png_files[i]] = loadImage(all_png_files[i]);
		
		//Iterate over all hyde_years; all_mask_keys in order
		let all_mask_keys = Object.keys(northern_america_obj.areal_masks);
		
		for (let i = 0; i < hyde_years.length; i++) {
			let local_file_path = `${common_defines.output_file_paths.stadester_population_rasters_folder}${common_defines.output_file_paths.stadester_population_rasters_prefix}${hyde_years[i]}.png`;
			let total_sum_for_year = 0;
			
			//Iterate over all_mask_keys; process local_mask for all_png_files in raster_obj
			for (let x = 0; x < all_mask_keys.length; x++) {
				let is_in_domain = false;
				let local_mask = northern_america_obj.areal_masks[all_mask_keys[x]];
				
				let all_local_years;
					if (typeof local_mask.population == "object") {
						all_local_years = Object.keys(local_mask.population)
							.map(Number).sort((a, b) => a - b);
					} else {
						all_local_years = northern_america_domain;
					}
				let local_mask_domain = [all_local_years[0], all_local_years[all_local_years.length - 1]];
				
				//Check if local_mask has an applicable domain
				if (hyde_years[i] >= local_mask_domain[0] && hyde_years[i] <= local_mask_domain[1])
					if (hyde_years[i] >= northern_america_domain[0] && hyde_years[i] <= northern_america_domain[1]) {
						is_in_domain = true;
					} else if (local_mask.special_domain) {
						is_in_domain = true;
					}
				//Internal guard clause if local_mask .is_clone
				if (local_mask.is_clone) continue;
				
				//If the mask is in domain; iterate over all_png_files in raster_obj to apply it
				if (is_in_domain) {
					let local_area = [];
					
					//.density handling; calculate fetch sum area to set local_mask.population for that year
					if (local_mask.density) {
						//[WIP] - Finish local_mask.density handling
						
						for (let y = 0; y < all_png_files.length; y++) {
							let local_raster = raster_obj[all_png_files[y]];
							let local_raster_area = 0;
							
							operateNumberRasterImage({
								file_path: land_area_raster,
								function: function (arg0_index, arg1_number) {
									//Convert from parameters
									let local_index = arg0_index;
									let local_number = arg1_number;
									
									//Declare local instance variables
									let byte_index = local_index;
									
									//Check if local_raster.data matches the present object
									if (local_number > 0) {
										let local_area_mask = northern_america_obj.areal_masks[[
											local_raster.data[byte_index],
											local_raster.data[byte_index + 1],
											local_raster.data[byte_index + 2]
										].join(",")];
										
										if (local_area_mask)
											if (local_area_mask.key === local_mask.key)
												local_raster_area += local_number;
									}
								}
							});
							
							local_area.push(local_raster_area);
						}
						local_area = Math.max(...local_area);
						
						if (local_mask.population === undefined) local_mask.population = {};
						local_mask.population[hyde_years[i]] = local_area*local_mask.density;
					}
					//.population handling; scale to colour code
					if (local_mask.population)
						if (local_mask.population[hyde_years[i]]) {
							let local_population_raster = loadNumberRasterImage(local_file_path);
							let local_population = local_mask.population[hyde_years[i]];
							let local_scalar = 1;
							let local_sum = 0;
							
							//Iterate over all_png_files; compute local_scalar
							for (let y = 0; y < all_png_files.length; y++) {
								let local_raster = raster_obj[all_png_files[y]];
								let local_raster_population = 0;
								
								operateNumberRasterImage({
									file_path: local_population_raster,
									function: function (arg0_index, arg1_number) {
										//Convert from parameters
										let local_index = arg0_index;
										let local_number = arg1_number;
										
										//Declare local instance variables
										let byte_index = local_index;
										
										//Check if local_raster.data matches the present object
										if (local_number > 0) {
											let local_area_mask = northern_america_obj.areal_masks[[
												local_raster.data[byte_index],
												local_raster.data[byte_index + 1],
												local_raster.data[byte_index + 2]
											].join(",")];
											
											if (local_area_mask)
												if (local_area_mask.key === local_mask.key)
													local_raster_population += local_number;
										}
									}
								});
								
								if (local_raster_population > local_sum) local_sum = local_raster_population;
							}
							local_scalar = returnSafeNumber(local_population/local_sum);
							
							console.log(`- Scaling ${local_file_path} for ${local_mask.key} | Area: ${local_area}, Population: ${parseNumber(local_population)}, Scalar: ${local_scalar}`);
							
							//Scale local population raster to scalar
							saveNumberRasterImage({
								file_path: local_file_path,
								height: 2160,
								width: 4320,
								
								function: function (arg0_index) {
									let index = arg0_index;
									
									//Declare local instance variables
									let byte_index = arg0_index*4; //Index must be multiplied by 4 since we are using loadImage(), and not loadNumberRasterImage()
									let local_value = local_population_raster.data[index];
									
									//Internal guard clause if local_value is 0
									if (local_value === 0) return 0;
									
									//Iterate over all_png_files to see if their .data at byte_index contains our target key
									for (let y = 0; y < all_png_files.length; y++) {
										let local_raster = raster_obj[all_png_files[y]];
										let local_raster_colour = [
											local_raster.data[byte_index],
											local_raster.data[byte_index + 1],
											local_raster.data[byte_index + 2],
										].join(",");
										
										let local_area_mask = northern_america_obj.areal_masks[local_raster_colour];
										
										if (local_area_mask)
											if (local_area_mask.key === local_mask.key) {
												total_sum_for_year += local_value*local_scalar;
												return local_value*local_scalar;
											}
									}
									
									//Return statement; default value otherwise
									total_sum_for_year += local_value;
									return local_value;
								}
							});
							
							console.log(`- Finished processing ${local_file_path} for ${hyde_years[i]}. Total Northern America sum for category: ${parseNumber(total_sum_for_year)}`);
						}
				}
			}
		}
	};
	
	global.getNorthernAmericaPopulationObject = function () {
		//Declare local instance variables
		let hyde_years = config.uud.processing.hyde_years.concat([2024, 2025]).sort((a, b) => a - b);
		let northern_america_obj = config.velkscala.northern_america;
		
		let northern_america_domain = northern_america_obj.domain;
		
		//Iterate over all_mask_keys and interpolate over all HYDE years within objects with .population
		let all_mask_keys = Object.keys(northern_america_obj.areal_masks);
		
		for (let i = 0; i < all_mask_keys.length; i++) {
			let local_mask = northern_america_obj.areal_masks[all_mask_keys[i]];
			
			//Make sure colour is in [R, G, B] format
			if (typeof local_mask.colour == "string")
				local_mask.colour = hexToRGB(local_mask.colour);
			if (local_mask.population) {
				let all_local_years = Object.keys(local_mask.population)
					.map(Number).sort((a, b) => a - b);
				let local_mask_domain = [all_local_years[0], all_local_years[all_local_years.length - 1]];
				let years_to_interpolate = [];
				
				//Iterate over all hyde_years within domain
				for (let x = 0; x < hyde_years.length; x++)
					if (hyde_years[x] >= local_mask_domain[0] && hyde_years[x] <= local_mask_domain[1]) {
						let is_in_domain = false;
							if (hyde_years[x] >= northern_america_domain[0] && hyde_years[x] <= northern_america_domain[1])
								is_in_domain = true;
							if (local_mask.special_domain) is_in_domain = true;
							
							//If the current year is in domain and is not already an entry, try to interpolate for it
							if (is_in_domain && !local_mask.population[hyde_years[x]])
								years_to_interpolate.push(hyde_years[x]);
					}
				
				//Interpolate for years_to_interpolate; make sure that the object is scaled properly
				local_mask.population = cubicSplineInterpolationObject(local_mask.population, { years: years_to_interpolate });
				if (local_mask.scalar)
					local_mask.population = multiplyObject(local_mask.population, local_mask.scalar);
			}
			
			local_mask.key = all_mask_keys[i];
		}
		
		//Iterate over all_mask_keys and set their colourmap
		for (let i = 0; i < all_mask_keys.length; i++) {
			let local_mask = northern_america_obj.areal_masks[all_mask_keys[i]];
			
			let local_key = [local_mask.colour[0], local_mask.colour[1], local_mask.colour[2]].join(",");
			
			northern_america_obj.areal_masks[local_key] = local_mask;
			northern_america_obj.areal_masks[local_key].is_clone = true;
		}
		
		//Return statement
		return northern_america_obj;
	};
}