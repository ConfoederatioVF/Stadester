//Intialise functions
{
	global.getPopulatedPixelsCount = function (arg0_folder) {
		//Convert from parameters
		var folder = arg0_folder;
		
		//Declare local instance variables
		var all_png_files = fs.readdirSync(folder)
			.filter((file) => path.extname(file).toLowerCase() == ".png");
		var return_obj = {};
		
		//Iterate over all_png_files and get their count
		for (let i = 0; i < all_png_files.length; i++) {
			let local_file_path = path.join(folder, all_png_files[i]);
			let local_obj = {};
			
			operateNumberRasterImage({
				file_path: local_file_path,
				function: function (arg0_index, arg1_number) {
					var local_index = arg0_index;
					var local_number = arg1_number;
					
					if (local_number > 0) {
						modifyValue(local_obj, "sample_size", 1);
						modifyValue(local_obj, "population", local_number);
					}
				}
			});
			
			console.log(`${all_png_files[i]}:`, local_obj);
			return_obj[all_png_files[i]] = local_obj;
		}
		
		//Return statement
		return return_obj;
	};
	
	global.getStadesterBaseCityCount = function () {
		getPopulatedPixelsCount(config.defines.common.output_file_paths.stadester_base_rasters_folder);
	};
	
	global.getStadesterCityCount = function () {
		getPopulatedPixelsCount(config.defines.common.output_file_paths.stadester_rasters_folder);
	};
}