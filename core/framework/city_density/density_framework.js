//Initialise functions
{
	//0. Helper functions
	global.getGlobalPopulationDensityObject = function () {
		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;
		var previous_value = getAverage(density_processing_obj.baseline_density_per_ha);
		var return_obj = {
			[density_processing_obj.baseline_year]: previous_value
		};
		
		//Iterate over all_angel_density_keys
		var all_angel_density_keys = Object.keys(density_processing_obj.angel_density_change_per_decade);
		var all_angel_years = [];
		var last_angel_year = parseInt(all_angel_density_keys[all_angel_density_keys.length - 1]);
		
		for (let i = 0; i < all_angel_density_keys.length; i++) {
			var all_return_keys = Object.keys(return_obj);
			var local_decadal_growth_rate = density_processing_obj.angel_density_change_per_decade[all_angel_density_keys[i]];
			
			previous_value = previous_value*(1 + local_decadal_growth_rate);
			return_obj[all_angel_density_keys[i]] = previous_value;
		}
		
		for (let i = density_processing_obj.baseline_year; i < last_angel_year; i++)
			all_angel_years.push(i);
		
		//Return statement
		return cubicSplineInterpolationObject(return_obj, { years: all_angel_years });
	};
	
	//1. Estimate Baseline Cities
	global.estimateBaselineCityArea = function (arg0_city_obj) {
		//Convert from parameters
		var city_obj = arg0_city_obj;

		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;

		var area_growth_ratio = density_processing_obj.area_to_pop_growth_rate_ratio;
		var baseline_density_per_ha = getAverage(density_processing_obj.baseline_density_per_ha);

		//Calculate baseline city area
		if (!city_obj.population[density_processing_obj.baseline_year])
			city_obj.population = cubicSplineInterpolationObject(city_obj.population, {
				years: [density_processing_obj.baseline_year]
			});
		var city_baseline_population = Math.abs(city_obj.population[density_processing_obj.baseline_year]); //Absolute value for handling corrective populations

		if (!city_obj.area) city_obj.area = {};
			if (city_baseline_population) {
				var current_area = returnSafeNumber((city_baseline_population/baseline_density_per_ha)/100);
				
				city_obj.area[density_processing_obj.baseline_year] = current_area; //Area in km^2
				
				//Calculate RNI for population first; populate rni_obj
				var all_population_keys = Object.keys(city_obj.population);
				
				if (all_population_keys.length >= 2) {
					var rni_obj = {};
					
					//Iterate over all_population_keys
					for (let i = 1; i < all_population_keys.length; i++)
						if (parseInt(all_population_keys[i]) > density_processing_obj.baseline_year) {
							var local_value = city_obj.population[all_population_keys[i]];
							var local_rni = 0;
							
							if (local_value) {
								var previous_value = city_obj.population[all_population_keys[i - 1]];
								
								local_rni = (local_value - previous_value)/previous_value;
							} else if (local_value == 0) {
								local_rni = 0;
							}
							
							rni_obj[all_population_keys[i - 1]] = returnSafeNumber(local_rni, 0);
						}
					
					city_obj.rni = rni_obj;
					
					//Iterate over all_rni_keys; establish area based on area_growth_ratio
					var all_rni_keys = Object.keys(rni_obj);
					
					for (let i = 0; i < all_rni_keys.length - 1; i++) {
						var local_rni = rni_obj[all_rni_keys[i + 1]];
						
						city_obj.area[all_rni_keys[i]] = current_area + current_area*local_rni*area_growth_ratio;
						current_area = city_obj.area[all_rni_keys[i]];
					}
				}
			}

		//Return statement
		return city_obj;
	};

	global.estimateBaselineCityAreas = function (arg0_stadester_obj) {
		//Convert from parameters
		var stadester_obj = (arg0_stadester_obj) ? arg0_stadester_obj : getProcessedStadesterObject();

		//Declare local instance variables
		var all_cities = Object.keys(stadester_obj);

		//Iterate over all_countries
		for (var i = 0; i < all_cities.length; i++) {
			var local_city = stadester_obj[all_cities[i]];

			stadester_obj[all_cities[i]] = estimateBaselineCityArea(local_city);
		}

		//Return statement
		return stadester_obj;
	};
	
	//1.1. Once baseline city areas are calculated, calculate remaining city areas utilising Angel's moving density
	global.calculateRemainderCityArea = function (arg0_city_obj) {
	
	};
	
	global.calculateRemainderCityAreas = function (arg0_stadester_obj) {
	
	};
	
	//2. Establish rank-ordinals and use them to calculate Clark parameters
		//A = imputed persons_per_ha from rank ordinal of HYDE density; (.centre_density)
		//b = walkability ratio, Angel 2012, interpolated (.walkability_ratio)
		//y = actual density as calculated from established .population/.area objects (.density)
	
	//3. Apply Clark/Modified Clark typologies to calculate imputed populations within gridcell radii
	
	//4. Use imputed populations within gridcell radii to buffer population by scaling rings to target over substrata
	
	global.processCitiesAreas = function () {
		//Declare local instance variables
		global.stadester_obj = estimateBaselineCityAreas();
		
		//Save processed stadester_obj
		FileManager.saveFileAsJSON('./input/uud/stadester_areas.json', stadester_obj);
	};
}