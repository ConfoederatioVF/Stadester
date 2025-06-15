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

	global.estimateCitiesAreas = function (arg0_uud_obj) {
		//Convert from parameters
		var uud_obj = (arg0_uud_obj) ? arg0_uud_obj : JSON.parse(fs.readFileSync(config.defines.common.input_file_paths.processed_uud_cities));

		//Declare local instance variables
		var all_countries = Object.keys(uud_obj);

		//Iterate over all_countries
		for (var i = 0; i < all_countries.length; i++) {
			var local_country = uud_obj[all_countries[i]];

			if (local_country.type != "chandler_modelski") {
				//Iterate over all_cities
				var all_cities = Object.keys(local_country);

				for (var x = 0; x < all_cities.length; x++)
					local_country[all_cities[x]] = estimateCityAreas(local_country[all_cities[x]]);
			} else {
				uud_obj[all_countries[i]] = estimateCityAreas(local_country);
			}
		}

		//Return statement
		return uud_obj;
	};

	global.estimateCityAreas = function (arg0_city_obj) {
		//Convert from parameters
		var city_obj = arg0_city_obj;

		//Guard clause if city_obj.population does not exist
		if (!city_obj.population) return city_obj;

		//Declare local instance variables
		var all_population_keys = Object.keys(city_obj.population);
		var density_processing_obj = config.population_density.processing;
		var uud_processing_obj = config.uud.processing;
		var has_year_after_baseline = false;

		//Iterate over all_population_keys
		for (var i = 0; i < all_population_keys.length; i++)
			if (
				parseInt(all_population_keys[i]) >= density_processing_obj.baseline_year &&
				parseInt(all_population_keys[i]) <= density_processing_obj.cutoff_year
			) {
				has_year_after_baseline = true;
				break;
			}

		//Iterate from density_processing_obj.baseline_year to density_processing_obj.cutoff_year for the set of HYDE years and assess growth
		if (has_year_after_baseline) {
			//Initialise area if undefined
			if (!city_obj.area) city_obj = estimateBaselineCityArea(city_obj);

			//Iterate over all HYDE years
			for (var i = 0; i < uud_processing_obj.hyde_years.length; i++)
				if (
					uud_processing_obj.hyde_years[i] >= density_processing_obj.baseline_year &&
					uud_processing_obj.hyde_years[i] <= density_processing_obj.cutoff_year
				) {
					var city_domain = getObjectDomain(city_obj.population);
					var local_year = uud_processing_obj.hyde_years[i];

					//Guard clause if this is the baseline year
					if (local_year == density_processing_obj.baseline_year) continue;

					if (city_obj.population[local_year] == undefined)
						if (local_year >= city_domain[0] && local_year <= city_domain[1] && all_population_keys.length >= 2)
							city_obj.population = cubicSplineInterpolationObject(city_obj.population, { years: [local_year] });

					var local_population_index = all_population_keys.indexOf(local_year.toString());
						if (local_population_index == -1) {
							console.warn(`- ${city_obj.name} faces invalid figures for ${local_year}. Skipping in area calculations.`);
							continue;
						}
					var local_population_growth = 1;
					var local_value = city_obj.population[local_year];

					if (local_population_index - 1 > 0) {
						var previous_key = all_population_keys[local_population_index - 1];
						var previous_value = city_obj.population[previous_key];
						var years_since_previous_value = parseInt(local_year) - parseInt(previous_key);

						local_population_growth = (local_value - previous_value)/years_since_previous_value;
						city_obj.area[local_year] = city_obj.area[previous_key] + local_population_growth*density_processing_obj.area_to_pop_growth_rate_ratio;
					}
				}
		}

		//Return statement
		return city_obj;
	};
}