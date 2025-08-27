//Initialise functions
{
	global.getNumberOfCitiesByDataset = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let ghsl_obj = FileManager.loadFileAsJSON(common_defines.output_file_paths.ghsl_output);
		let stadester_obj = FileManager.loadFileAsJSON(common_defines.input_file_paths.stadester_output);
		let stadester_ghsl_obj = FileManager.loadFileAsJSON(common_defines.output_file_paths.stadester_ghsl);
		
		//Return statement
		return {
			buringh: Object.keys(getBuringhObject()).length,
			chandler_modelski: Object.keys(getChandlerModelskiObject()).length,
			devries: Object.keys(getDeVriesCitiesObject()).length,
			ghsl: Object.keys(ghsl_obj).length,
			populstat: getPopulstatTotalTowns(),
			stadester: Object.keys(stadester_obj).length,
			stadester_ghsl: Object.keys(stadester_ghsl_obj).length,
			stadester_total_incl_periurban: 41214
		};
	};
}