//Initialise functions
{
	global.estimateBaselineCityArea = function (arg0_city_obj) {
		//Convert from parameters
		var city_obj = arg0_city_obj;

		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;

		var baseline_density_per_ha = getAverage(density_processing_obj.baseline_density_per_ha);

		//Calculate baseline city area
		if (!city_obj.population[density_processing_obj.baseline_year])
			city_obj.population = cubicSplineInterpolationObject(city_obj.population, {
				years: [density_processing_obj.baseline_year]
			});
		var city_baseline_population = Math.abs(city_obj.population[density_processing_obj.baseline_year]); //Absolute value for handling corrective populations

		if (!city_obj.area) city_obj.area = {};
			city_obj.area[density_processing_obj.baseline_year] = returnSafeNumber((city_baseline_population/baseline_density_per_ha)/100); //Area in km^2

		//Return statement
		return city_obj;
	};

	global.estimateBaselineCityAreas = function (arg0_uud_obj) {
		//Convert from parameters
		var uud_obj = (arg0_uud_obj) ? arg0_uud_obj : JSON.parse(fs.readFileSync(config.defines.common.input_file_paths.processed_uud_cities));

		//Declare local instance variables
		var all_countries = Object.keys(uud_obj);
		var density_processing_obj = config.population_density.processing;

		//Iterate over all_countries
		for (var i = 0; i < all_countries.length; i++) {
			var local_country = uud_obj[all_countries[i]];

			if (local_country.type != "chandler_modelski") {
				//Iterate over all_cities
				var all_cities = Object.keys(local_country);

				for (var x = 0; x < all_cities.length; x++)
					local_country[all_cities[x]] = estimateBaselineCityArea(local_country[all_cities[x]]);
			} else {
				uud_obj[all_countries[i]] = estimateBaselineCityArea(local_country);
			}
		}

		//Return statement
		return uud_obj;
	};
}