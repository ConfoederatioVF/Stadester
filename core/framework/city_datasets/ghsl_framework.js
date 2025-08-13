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
	
	/**
	 * Scales all GHSL population rasters to global population, in addition to linearly interpolating GHSL at a 1-year step between its default 5-year interval rasters.
	 */
	global.scaleGHSLPopulationRastersToGlobalPopulation = function () { //[WIP] - Finish function body
		//Declare local instance variables
		var ghsl_years = config.ghsl.processing.years;
		var world_population_obj = getWorldPopulationObject();
		
		var ghsl_domain = [ghsl_years[0], ghsl_years[ghsl_years.length - 1]];
		
		//Iterate over all years in ghsl_domain and scale rasters
	};
}