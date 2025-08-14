//Intialise functions
{
	//VALIDATION
	//1. Sample Size and Urban Population
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
		
		global.getStadesterBaseDataRecords = function () {
			//Declare local instance variables
			var stadester_obj = getStadesterBufferingObject();
			
			//Declare local instance variables
			var all_stadester_keys = Object.keys(stadester_obj);
			var data_records = 0;
			
			for (let i = 0; i < all_stadester_keys.length; i++) {
				let local_city = stadester_obj[all_stadester_keys[i]];
				
				if (local_city.population)
					data_records += Object.keys(local_city.population).length;
			}
			
			//Return statement
			return data_records;
		};
		
		global.getStadesterCityCount = function () {
			getPopulatedPixelsCount(config.defines.common.output_file_paths.stadester_rasters_folder);
		};
		
		global.getStadesterDataRecords = function () {
			//Declare local instance variables
			var ghsl_data_records = 0;
			var ghsl_obj = getGHSLObject();
			var stadester_data_records = getStadesterBaseDataRecords();
			
			//Iterate over all_ghsl_keys
			var all_ghsl_keys = Object.keys(ghsl_obj);
			
			for (let i = 0; i < all_ghsl_keys.length; i++) {
				let local_city = ghsl_obj[all_ghsl_keys[i]];
				
				if (local_city.population)
					ghsl_data_records += Object.keys(local_city.population).length;
			}
			
			//Return statement
			return ghsl_data_records + stadester_data_records;
		};
	}
	
	//1.1. Number of cities with radial buffers; generate non-metro corrected base-case
	{
		global.generateMetroCorrectedBase = function () {
			//Generate metro corrected Stadestér database
			parseUUDToStadester();
			flattenStadesterMetros();
			fixStadesterErrors();
			
			processCitiesAreas();
			cacheRadialBuffers();
			generateStadesterRasters();
			processStadester();
		};
		
		global.generateNonMetroCorrectedBase = function () {
			//Generate non-metro correctied Stadestér database
			parseUUDToStadester();
			flattenStadesterMetros(true);
			fixStadesterErrors();
			
			processCitiesAreas();
			cacheRadialBuffers();
			generateStadesterRasters();
			processStadester();
		};
		
		global.getNumberOfCitiesWithRadialBuffers = function () {
			//Declare local instance variables
			var stadester_obj = getStadesterBufferingObject();
			
			//Declare local instance variables
			var all_stadester_keys = Object.keys(stadester_obj);
			var radial_buffers_records = 0;
			
			for (let i = 0; i < all_stadester_keys.length; i++) {
				let local_city = stadester_obj[all_stadester_keys[i]];
				
				if (local_city.radial_buffers)
					radial_buffers_records++;
			}
			
			//Return statement
			return radial_buffers_records;
		};
	}
	
	//2. Validation plots compared to GHSL (centre of gravity)
	{
		global.getCentreOfGravity = function (arg0_coords) {
			//Convert from parameters
			var coords = arg0_coords;
			
			//Declare local instance variables
			var sum_weights = 0;
			var sum_x = 0;
			var sum_y = 0;
			
			//Iterate over all coords
			for (let [local_x, local_y, local_weight] of coords) {
				sum_x += local_x*local_weight;
				sum_y += local_y*local_weight;
				sum_weights += local_weight;
			}
			
			//Return statement
			if (sum_weights == 0) console.error(`Total weight is zero, cannot compute centre of gravity.`);
			return [sum_x/sum_weights, sum_y/sum_weights];
		};
		
		global.getCentresOfGravityOverTime = function () {
			//Declare local instance variables
		};
	}
	
	//3. Eoscala regional graphs: 120 cities by population/area/density per region
	
	//4. Urbanisation rates per region compared to substrata population
	
	//5. Population tables for Angel's Global 30 (Metro and Non-Metro)
	
	//VISUALISATION
	//1. Number of population data points + number of cities in dataset over time
	
	//2. Scatterplot per Eoscala region
}