//Initialise functions
{
	global.generateStadesterUrbanRasters = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let stadester_base_folder = common_defines.output_file_paths.stadester_base_rasters_folder;
		let stadester_base_prefix = common_defines.output_file_paths.stadester_base_rasters_prefix;
		let stadester_ghsl_folder = common_defines.output_file_paths.stadester_ghsl_rasters_folder;
		let stadester_ghsl_prefix = common_defines.output_file_paths.stadester_ghsl_rasters_prefix;
		let stadester_urban_folder = common_defines.output_file_paths.stadester_urban_rasters_folder;
		let stadester_urban_prefix = common_defines.output_file_paths.stadester_urban_rasters_prefix;
		let stadester_years = config.uud.processing.stadester_years;
		
		//Iterate over all stadester_years and check for the intersection of Stadestér Base and GHSL; normalise them if possible
		for (let i = 0; i < stadester_years.length; i++) {
			let local_stadester_base_file_path = `${stadester_base_folder}/${stadester_base_prefix}${stadester_years[i]}.png`;
			let local_stadester_base_raster;
			let local_stadester_ghsl_file_path = `${stadester_ghsl_folder}/${stadester_ghsl_prefix}${stadester_years[i]}.png`;
			let local_stadester_ghsl_raster;
			let local_output_file_path = `${stadester_urban_folder}/${stadester_urban_prefix}${stadester_years[i]}.png`;
			
			//Normalisation is done by checking if GHSL has a pixel in the location. If not, use the Stadestér Base pixel
			if (fs.existsSync(local_stadester_base_file_path))
				local_stadester_base_raster = loadNumberRasterImage(local_stadester_base_file_path);
			if (fs.existsSync(local_stadester_ghsl_file_path))
				local_stadester_ghsl_raster = loadNumberRasterImage(local_stadester_ghsl_file_path);
			
			//Save raster image
			saveNumberRasterImage({
				file_path: local_output_file_path,
				height: 2160,
				width: 4320,
				
				function: function (arg0_index) {
					//Convert from parameters
					let index = arg0_index;
					
					//Declare local instance variables
					let stadester_base_value = 0;
						if (local_stadester_base_raster) stadester_base_value = local_stadester_base_raster.data[index];
					let stadester_ghsl_value = 0;
						if (local_stadester_ghsl_raster) stadester_ghsl_value = local_stadester_ghsl_raster.data[index];
						
					//Order of precedence for writing values (Stadestér-GHSL, Stadestér Base)
					if (stadester_ghsl_value) return stadester_ghsl_value;
					if (stadester_base_value) return stadester_base_value;
				}
			});
			console.log(`- Finished writing ${local_output_file_path} for Stadestér Urban.`);
		}
	};
}