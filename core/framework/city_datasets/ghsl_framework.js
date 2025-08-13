//Initalise functions
{
	global.generateGHSLUrbanAreaRasters = async function () {
		//Declare local instance variables
		var ghsl_config_obj = config.ghsl.processing;

		//Iterate over all ghsl_config_obj.years
		for (var i = 0; i < ghsl_config_obj.years.length; i++) {
			var log_processing_string = `- Processing GHSL urban area rasters for ${ghsl_config_obj.years[i]} ..`;

			console.time(log_processing_string);
			await generateGHSLUrbanAreaRaster(ghsl_config_obj.years[i]);
			console.timeEnd(log_processing_string);
		}
	};

	global.generateGHSLUrbanAreaRaster = async function (arg0_year) {
		//Convert from parameters
		var year = returnSafeNumber(arg0_year);

		//Declare local instance variables
		var common_defines = config.defines.common;
		var input_file_path = `${common_defines.input_file_paths.ghsl_folder}${common_defines.input_file_paths.ghsl_urban_areas_prefix}${year}.geojson`;
		var output_file_path = `${common_defines.output_file_paths.ghsl_urban_areas_folder}${common_defines.output_file_paths.ghsl_urban_areas_prefix}${year}.png`

		//Return statement
		return GHSLGeoJSONToRaster(input_file_path, output_file_path);
	};
	
	global.getGHSLObject = function () {
		//Declare local instance variables
		var common_defines = config.defines.common;
		var ghsl_csv = FileManager.loadCSVAsJSON(common_defines.input_file_paths.ghsl_csv);
		var ghsl_years = config.ghsl.processing.years;
		var return_obj = {};
		
		//Iterate over all_ghsl_keys in ghsl_csv
		var all_ghsl_keys = Object.keys(ghsl_csv);
		var ghsl_dictionary = {
			area: `MT_UCA_KM2_`,
			density: `MT_POP_DEN_`,
			population: `MT_POP_TOT_`
		};
		
		var all_ghsl_dictionary_keys = Object.keys(ghsl_dictionary);
		
		for (let i = 0; i < all_ghsl_keys.length; i++) try {
			let local_city = ghsl_csv[all_ghsl_keys[i]];
			let local_key = `${local_city.GC_UCN_LIS_2025[0]}-${local_city.GC_CNT_GAD_2025[0]}`;
			
			return_obj[local_key] = {
				id: parseInt(all_ghsl_keys[i]),
				key: local_key,
				
				name: local_city.GC_UCN_LIS_2025[0]
			};
			let actual_city = return_obj[local_key];
			
			//Iterate over ghsl_dictionary and assign keys based on them
			for (let x = 0; x < all_ghsl_dictionary_keys.length; x++) {
				actual_city[all_ghsl_dictionary_keys[x]] = {};
				let local_prefix = ghsl_dictionary[all_ghsl_dictionary_keys[x]];
				
				//Iterate over all ghsl_years
				for (let y = 0; y < ghsl_years.length; y++) {
					let local_value = local_city[`${local_prefix}${ghsl_years[y]}`];
					
					if (local_value && local_value != "")
						actual_city[all_ghsl_dictionary_keys[x]][ghsl_years[y]] = parseEuropeanNumber(local_value[0]);
				}
			}
		} catch (e) {
			console.error(ghsl_csv[all_ghsl_keys[i]], e);
		}
		
		//Return statement
		return return_obj;
	};
	
	/**
	 * Scales all GHSL population rasters to global population, in addition to linearly interpolating GHSL at a 1-year step between its default 5-year interval rasters.
	 */
	global.scaleGHSLPopulationRastersToGlobalPopulation = function () {
		//Declare local instance variables
		var common_defines = config.defines.common;
		var ghsl_years = config.ghsl.processing.years;
		var world_population_obj = getWorldPopulationObject();
		
		var ghsl_domain = [ghsl_years[0], ghsl_years[ghsl_years.length - 1]];
		var ghsl_rasters = {};
		
		//Iterate over all ghsl_years and load ghsl_rasters
		for (let i = 0; i < ghsl_years.length; i++) {
			let local_ghsl_pop_file_path =`${common_defines.input_file_paths.ghsl_population_folder}/${common_defines.input_file_paths.ghsl_population_prefix}${ghsl_years[i]}${common_defines.input_file_paths.ghsl_population_suffix}`;
			
			ghsl_rasters[ghsl_years[i]] = loadNumberRasterImage(local_ghsl_pop_file_path);
		}
		
		//Iterate over all years in ghsl_domain and scale rasters
		for (let i = ghsl_domain[0]; i <= ghsl_domain[1]; i++) {
			let local_ghsl_raster;
			let local_output_path = `${common_defines.input_file_paths.ghsl_population_folder}/${common_defines.input_file_paths.ghsl_population_prefix}${i}${common_defines.input_file_paths.ghsl_population_suffix}`;
			
			//Iterate over ghsl_years; find closest local_ghsl_raster
			for (let x = 0; x < ghsl_years.length; x++)
				if (ghsl_years[x] <= i) {
					local_ghsl_raster = ghsl_rasters[ghsl_years[x]];
				} else { break; }
			
			//Get local_scalar; scale end raster image to
			let current_population = getImageSum(local_ghsl_raster);
			let local_scalar = world_population_obj[i]/current_population;
			
			saveNumberRasterImage({
				file_path: local_output_path,
				height: 2160,
				width: 4320,
				
				function: function (arg0_index) {
					//Convert from parameters
					var local_index = arg0_index;
					
					//Return statement
					return Math.round(local_ghsl_raster.data[local_index]*local_scalar);
				}
			});
			console.log(`- Saved ${local_output_path}, scalar = ${local_scalar}, adjusting old population ${parseNumber(current_population)} to ${parseNumber(world_population_obj[i])}.`);
		}
	};
}