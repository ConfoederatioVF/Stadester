//Initialise functions
{
	global.generateStadesterPopulationRasters = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let first_ghsl_year = config.ghsl.processing.years[0];
		let stadester_years = config.uud.processing.stadester_years;
		let world_pop_obj = getWorldPopulationObject();
		
		//1. Prior to first_ghsl_year, simply add up stadester_rural and stadester_urban pixels
		for (let i = 0; i < stadester_years.length; i++) {
			let local_population_file_path = `${common_defines.output_file_paths.stadester_population_rasters_folder}${common_defines.output_file_paths.stadester_population_rasters_prefix}${stadester_years[i]}.png`;
			
			if (stadester_years[i] < first_ghsl_year) {
				let local_rural_file_path = `${common_defines.output_file_paths.stadester_rural_rasters_folder}${common_defines.output_file_paths.stadester_rural_rasters_prefix}${stadester_years[i]}.png`;
				let local_rural_raster;
					if (fs.existsSync(local_rural_file_path)) local_rural_raster = loadNumberRasterImage(local_rural_file_path);
				let local_urban_file_path = `${common_defines.output_file_paths.stadester_urban_rasters_folder}${common_defines.output_file_paths.stadester_urban_rasters_prefix}${stadester_years[i]}.png`;
				let local_urban_raster;
					if (fs.existsSync(local_urban_file_path)) local_urban_raster = loadNumberRasterImage(local_urban_file_path);
					
				//Save number raster image
				saveNumberRasterImage({
					file_path: local_population_file_path,
					height: 2160,
					width: 4320,
					
					function: function (arg0_index) {
						//Convert from parameters
						var index = arg0_index;
						
						//Declare local instance variables
						let local_rural_population = 0;
							if (local_rural_raster) local_rural_population = local_rural_raster.data[index];
						let local_urban_population = 0;
							if (local_urban_raster) local_urban_population = local_urban_raster.data[index];
							
						//Return statement
						return local_rural_population + local_urban_population;
					}
				});
				
				//Scale image to global population if possible
				if (world_pop_obj[stadester_years[i]]) {
					let current_population = getImageSum(local_population_file_path);
					let target_population = world_pop_obj[stadester_years[i]];
					
					let local_scalar = target_population/current_population;
					let local_raster = loadNumberRasterImage(local_population_file_path);
					
					saveNumberRasterImage({
						file_path: local_population_file_path,
						height: 2160,
						width: 4320,
						
						function: function (arg0_index) {
							//Convert from parameters
							let index = arg0_index;
							
							//Return statement
							if (local_raster.data[index])
								return Math.ceil(local_raster.data[index]*local_scalar);
							return 0;
						}
					});
					console.log(` - Scalar: ${local_scalar}, Current Population: ${parseNumber(current_population)} | Target Population: ${parseNumber(target_population)}`);
				}
			}
			//2. After first_ghsl_year, copy rasters from GHS_POP
			else {
				let ghs_pop_file_path = `${common_defines.input_file_paths.ghsl_population_folder}${common_defines.input_file_paths.ghsl_population_prefix}${stadester_years[i]}${common_defines.input_file_paths.ghsl_population_suffix}`;
				
				fs.copyFileSync(ghs_pop_file_path, local_population_file_path);
			}
			
			console.log(`- Finished writing ${local_population_file_path} for Stadestér Population.`);
			console.log(` - Global population: ${parseNumber(getImageSum(local_population_file_path))}`);
		}
		
	};
	
	global.generateStadesterRasters = function () {
		//1. Generate rasters to begin with
		generateStadesterUrbanRasters();
		generateStadesterRuralRasters();
			generateStadesterNorthernAmericaRasters();
		generateStadesterPopulationRasters();
		
		//2. Post-processing
		processStadesterRuralRasters();
	};
}