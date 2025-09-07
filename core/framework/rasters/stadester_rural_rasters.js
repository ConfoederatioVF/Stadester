//Initialise functions
{
	global.generateStadesterRuralRasters = function () {
		//Declare local instance variables
		let all_substrata_rasters = {};
		let common_defines = config.defines.common;
		let first_ghsl_year = config.ghsl.processing.years[0];
		let stadester_years = config.uud.processing.stadester_years;
		
		//1. Populate all_substrata_rasters according to ruleset
		//Iterate over all stadester_years
		for (let i = 0; i < stadester_years.length; i++) {
			let local_substrata_file_path = (stadester_years[i] < first_ghsl_year) ?
				`${common_defines.input_file_paths.substrata_folder}${common_defines.input_file_paths.substrata_prefix}${getHYDEYearName(stadester_years[i])}${common_defines.input_file_paths.substrata_suffix}` : `${common_defines.input_file_paths.ghsl_population_folder}${common_defines.input_file_paths.ghsl_population_prefix}${stadester_years[i]}${common_defines.input_file_paths.ghsl_population_suffix}`;
			
			if (fs.existsSync(local_substrata_file_path)) {
				all_substrata_rasters[stadester_years[i]] = local_substrata_file_path;
			} else {
				console.warn(`${local_substrata_file_path} doesn't exist for ${stadester_years[i]}!`);
			}
		}
		
		//2. Remove urban populations from substrata
		//Iterate over all stadester_years
		for (let i = 0; i < stadester_years.length; i++)
			if (all_substrata_rasters[stadester_years[i]]) {
				let local_substrata_file_path = all_substrata_rasters[stadester_years[i]];
				let local_rural_file_path = `${common_defines.output_file_paths.stadester_rural_rasters_folder}${common_defines.output_file_paths.stadester_rural_rasters_prefix}${stadester_years[i]}.png`;
				let local_urban_file_path = `${common_defines.output_file_paths.stadester_urban_rasters_folder}${common_defines.output_file_paths.stadester_urban_rasters_prefix}${stadester_years[i]}.png`;
				
				//Copy local_substrata_file_path to local_rural_file_path
				fs.copyFileSync(local_substrata_file_path, local_rural_file_path);
				if (!fs.existsSync(local_urban_file_path)) continue; //Internal guard clause; ensure that an equivalent urban raster exists before proceeding to subtraction phase
				
				//Subtract any cells from rural raster that contains a local_urban_raster entry
				let local_urban_population = getImageSum(local_urban_file_path);
				let local_world_population = getImageSum(local_rural_file_path);
				
				let local_rural_population = local_world_population - local_urban_population;
				let local_rural_raster = loadNumberRasterImage(local_rural_file_path);
				let local_urban_raster = loadNumberRasterImage(local_urban_file_path);
				
				saveNumberRasterImage({
					file_path: local_rural_file_path,
					height: 2160,
					width: 4320,
					
					function: function (arg0_index) {
						//Convert from parameters
						let index = arg0_index;
						
						//Declare local instance variables
						let rural_value = local_rural_raster.data[index];
						let urban_value = local_urban_raster.data[index];
						
						//Subtract urban population with a cap of zero
						return Math.max(rural_value - urban_value, 0);
					}
				});
				
				//3. Calculate rural_scalar; scale resultant raster image
				local_rural_raster = loadNumberRasterImage(local_rural_file_path);
				let rural_scalar = local_rural_population/getImageSum(local_rural_file_path);
				
				saveNumberRasterImage({
					file_path: local_rural_file_path,
					height: 2160,
					width: 4320,
					
					function: function (arg0_index) {
						//Convert from parameters
						let index = arg0_index;
						
						//Return statement
						if (local_rural_raster.data[index] === 0) return 0;
						return local_rural_raster.data[index]*rural_scalar;
					}
				});
				
				console.log(`- Finished writing ${local_rural_file_path} for Stadestér Rural.`);
			}
	};
	
	global.processStadesterRuralRasters = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let stadester_years = config.uud.processing.stadester_years;
		
		//Iterate over all stadester_years for rural rasters
		for (let i = 0; i < stadester_years.length; i++) {
			let local_global_file_path = `${common_defines.output_file_paths.stadester_population_rasters_folder}${common_defines.output_file_paths.stadester_population_rasters_prefix}${stadester_years[i]}.png`;
			let local_global_raster;
				if (fs.existsSync(local_global_file_path))
					local_global_raster = loadNumberRasterImage(local_global_file_path);
			let local_rural_file_path = `${common_defines.output_file_paths.stadester_rural_rasters_folder}${common_defines.output_file_paths.stadester_rural_rasters_prefix}${stadester_years[i]}.png`;
			let local_urban_file_path = `${common_defines.output_file_paths.stadester_urban_rasters_folder}${common_defines.output_file_paths.stadester_urban_rasters_prefix}${stadester_years[i]}.png`;
			let local_urban_raster;
				if (fs.existsSync(local_urban_file_path))
					local_urban_raster = loadNumberRasterImage(local_urban_file_path);
				
			//Save local_rural_file_path as being the same as the global raster, but with urban pixels subtracted
			saveNumberRasterImage({
				file_path: local_rural_file_path,
				height: 2160,
				width: 4320,
				
				function: function (arg0_index) {
					//Convert from parameters
					let index = arg0_index;
					
					//Declare local instance variables
					let local_global_population = 0;
						if (local_global_raster) local_global_population = local_global_raster.data[index];
					let local_urban_population = 0;
						if (local_urban_raster) local_urban_population = local_urban_raster.data[index];
					
					//Return statement
					return Math.max(local_global_population - local_urban_population, 0);
				}
			});
			console.log(`- Finished post-processing for ${local_rural_file_path}.`);
		}
	};
}