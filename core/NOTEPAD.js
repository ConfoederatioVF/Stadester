/*
//NOTEPAD.js file for future planning

console main.population.chandler_modelski[

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
*/
