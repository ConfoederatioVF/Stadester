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
					
					for (let i = 0; i < all_rni_keys.length; i++) {
						var local_rni = rni_obj[all_rni_keys[i]];
						
						city_obj.area[all_rni_keys[i]] = current_area + returnSafeNumber(current_area*local_rni*area_growth_ratio);
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
	global.calculateRemainderCityArea = function (arg0_city_obj, arg1_global_pop_density_obj) {
		var city_obj = arg0_city_obj;
		var global_pop_density_obj = (arg1_global_pop_density_obj) ? arg1_global_pop_density_obj : getGlobalPopulationDensityObject();
		
		//Declare local instance variables
		var all_global_density_keys = Object.keys(global_pop_density_obj);
		var density_processing_obj = config.population_density.processing;
		var density_domain = [density_processing_obj.baseline_year, all_global_density_keys[all_global_density_keys.length - 1]];
		
		var area_growth_ratio = density_processing_obj.area_to_pop_growth_rate_ratio;
		
		//Internal guard clause if city_obj already has .area defines
		if (city_obj.area && Object.keys(city_obj.area).length >= 1) return city_obj;
		
		//Calculate baseline city area
		if (!city_obj.area) city_obj.area = {};
		if (city_obj.population) {
			var all_population_keys = Object.keys(city_obj.population);
			var has_population_after_1800 = [false, -10000];
			
			//Iterate over all_population_keys
			for (let i = 0; i < all_population_keys.length; i++)
				if (city_obj.population[all_population_keys[i]] > 0 && parseInt(all_population_keys[i]) >= 1800) {
					has_population_after_1800 = [true, all_population_keys[i]];
					break;
				}
			
			if (has_population_after_1800[0]) {
				var current_area = returnSafeNumber(city_obj.population[has_population_after_1800[1]]/global_pop_density_obj[has_population_after_1800[1]]/100);
				
				city_obj.area[has_population_after_1800[1]] = current_area;
				
				//Calculate RNI for population first; populate rni_obj
				if (all_population_keys.length >= 2) {
					var rni_obj = {};
					
					//Iterate over all_population_keys
					for (let i = 1; i < all_population_keys.length; i++)
						if (parseInt(all_population_keys[i]) > has_population_after_1800[1]) {
							var local_rni  = 0;
							var local_value = city_obj.population[all_population_keys[i]];
							
							if (local_value) {
								var previous_value = city_obj.population[all_population_keys[i - 1]];
								
								local_rni = (local_value - previous_value)/previous_value;
							} else if (local_value == 0) {
								local_rni = 0;
							}
							
							rni_obj[all_population_keys[i - 1]] = returnSafeNumber(local_rni, 0);
						}
					
					city_obj.rni = rni_obj;
					
					//Iterate over all_rni_keys; establish area based on area_growth_rate
					var all_rni_keys = Object.keys(rni_obj);
					
					for (let i = 0; i < all_rni_keys.length; i++) {
						var local_rni = rni_obj[all_rni_keys[i]];
						
						city_obj.area[all_rni_keys[i]] = current_area + returnSafeNumber(current_area*local_rni*area_growth_ratio);
						current_area = city_obj.area[all_rni_keys[i]];
					}
				}
			}
		}
		
		//Return statement
		return city_obj;
	};
	
	global.calculateRemainderCityAreas = function (arg0_stadester_obj) {
		//Convert from parameters
		var stadester_obj = (arg0_stadester_obj) ? arg0_stadester_obj : getProcessedStadesterObject();
		
		//Declare local instance variables
		var all_cities = Object.keys(stadester_obj);
		var global_pop_density_obj = getGlobalPopulationDensityObject();
		
		//Iterate over all_countries
		for (var i = 0; i < all_cities.length; i++) {
			var local_city = stadester_obj[all_cities[i]];
			
			stadester_obj[all_cities[i]] = calculateRemainderCityArea(local_city, global_pop_density_obj);
		}
		
		//Return statement
		return stadester_obj;
	};
	
	global.fixCityAreas = function (arg0_stadester_obj) {
		//Convert from parameters
		var stadester_obj = (arg0_stadester_obj) ? arg0_stadester_obj : getProcessedStadesterObject();
		
		//Declare local instance variables
		var all_cities = Object.keys(stadester_obj);
		
		//Iterate over all_countries
		for (let i = 0; i < all_cities.length; i++) {
			let local_city = stadester_obj[all_cities[i]];
			
			if (local_city.area) local_city.area = interpolateNegativesInObject(local_city.area);
		}
		
		//Return statement
		return stadester_obj;
	};
	
	//1.2. Calculate (.density) from (.population/.area)
	
	global.calculateCityDensity = function (arg0_city_obj) {
		//Convert from parameters
		var city_obj = arg0_city_obj;
		
		//Internal guard clause if .area/.population are empty
		if (!(city_obj.area && Object.keys(city_obj.area).length > 0)) return city_obj;
		if (!(city_obj.population && Object.keys(city_obj.population).length > 0)) return city_obj;
		
		//Declare local instance variables
		var all_area_keys = Object.keys(city_obj.area);
		var density_obj = {};
		
		//Iterate over all_area_keys
		for (let i = 0; i < all_area_keys.length; i++) {
			var local_area = city_obj.area[all_area_keys[i]];
			var local_population = city_obj.population[all_area_keys[i]];
			
			//Set density_obj
			density_obj[all_area_keys[i]] = local_population/local_area;
		}
		
		city_obj.density = density_obj;
		
		//Return statement
		return city_obj;
	};
	
	global.calculateCityDensities = function (arg0_stadester_obj) {
		//Convert from parameters
		var stadester_obj = (arg0_stadester_obj) ? arg0_stadester_obj : getProcessedStadesterObject();
		
		//Declare local instance variables
		var all_cities = Object.keys(stadester_obj);
		
		//Iterate over all_cities
		for (let i = 0; i < all_cities.length; i++) {
			let local_city = stadester_obj[all_cities[i]];
			
			stadester_obj[all_cities[i]] = calculateCityDensity(local_city);
		}
		
		//Return statement
		return stadester_obj;
	};
	
	//2. Establish rank-ordinals and use them to calculate Clark parameters
		//A = imputed persons_per_ha from rank ordinal of actual density; (.centre_density)
		//b = walkability ratio, Angel 2012, interpolated (.walkability_ratio) DONE
		//y = actual density as calculated from established .population/.area objects (.density) DONE
	
	/**
	 * Assigns `.angel_region`, `.clark_region` to all cities in Stadestér
	 * @param {Object} arg0_stadester_obj
	 */
	global.assignRegionsToCities = function (arg0_stadester_obj) {
		//Convert from parameters
		var stadester_obj = (arg0_stadester_obj) ? arg0_stadester_obj : getProcessedStadesterObject();
		
		//Declare local instance variables
		var all_cities = Object.keys(stadester_obj);
		var common_defines = config.defines.common;
		var density_processing_obj = config.population_density.processing;
		
		var angel_raster = loadImage(common_defines.input_file_paths.angel_subdivisions);
		var clark_raster = loadImage(common_defines.input_file_paths.clark_subdivisions);
		
		var angel_regions_obj = density_processing_obj.angel_regions;
		var clark_regions_obj = density_processing_obj.clark_b_regions;
			var all_clark_regions_keys = Object.keys(clark_regions_obj);
				clark_regions_obj = clark_regions_obj[all_clark_regions_keys[all_clark_regions_keys.length - 1]];
		
		//Iterate over all_cities
		for (let i = 0; i < all_cities.length; i++) {
			let local_city = stadester_obj[all_cities[i]];
			let local_city_coords = getCityPixel(local_city, { height: angel_raster.height, width: angel_raster.width });
			
			//From local_city_coords, assign the .angel_region/.clark_region
			var local_index = (angel_raster.width*local_city_coords[1] + local_city_coords[0]) << 2; //4 bytes per pixel (RGBA)
			
			var angel_r = angel_raster.data[local_index],
				angel_g = angel_raster.data[local_index + 1],
				angel_b = angel_raster.data[local_index + 2];
			var clark_r = clark_raster.data[local_index],
				clark_g = clark_raster.data[local_index + 1],
				clark_b = clark_raster.data[local_index + 2];
			
			//Set .angel_region/.clark_region
			//Iterate over all_angel_regions; set .angel_region
			var all_angel_regions = Object.keys(angel_regions_obj);
			
			for (let x = 0; x < all_angel_regions.length; x++) {
				let local_angel_region = angel_regions_obj[all_angel_regions[x]];
				
				if (local_angel_region.colour.join(",") == [angel_r, angel_g, angel_b].join(","))
					local_city.angel_region = all_angel_regions[x];
			}
			
			//Iterate over all_clark_regions; set .clark_region
			var all_clark_regions = Object.keys(clark_regions_obj);
			
			for (let x = 0; x < all_clark_regions.length; x++) {
				let local_clark_region = clark_regions_obj[all_clark_regions[x]];
				
				if (local_clark_region.colour.join(",") == [clark_r, clark_g, clark_b].join(","))
					local_city.clark_region = all_clark_regions[x];
			}
		}
		
		//Return statement
		return stadester_obj;
	};
	
	/**
	 * Returns a <city-key>: <rank-ordinal> Object dictionary given a particular year.
	 * @param {number} arg0_year
	 * @param {Object} arg1_stadester_obj
	 *
	 * @returns {{"<city_key>": number}}
	 */
	global.calculateDensityOrdinalsForYear = function (arg0_year, arg1_stadester_obj) {
		//Convert from parameters
		var year = parseInt(arg0_year);
		var stadester_obj = (arg1_stadester_obj) ? arg1_stadester_obj : getProcessedStadesterObject();
		
		//Declare local instance variables
		var all_cities = Object.keys(stadester_obj);
		var density_obj = {};
		
		//Iterate over all_cities
		for (let i = 0; i < all_cities.length; i++) {
			let local_city = stadester_obj[all_cities[i]];
			let local_density = -1;
			
			if (local_city.density) {
				let all_density_keys = Object.keys(local_city.density);
				
				for (let x = 0; x < all_density_keys.length; x++)
					if (parseInt(all_density_keys[x]) <= year)
						local_density = local_city.density[all_density_keys[x]];
				
				//Set local_density
				if (local_density != -1)
					density_obj[local_city.key] = local_density;
			}
		}
		
		density_obj = sortObject(density_obj);
		
		//Iterate over all_density_keys
		var all_density_keys = Object.keys(density_obj);
		
		for (let i = 0; i < all_density_keys.length; i++)
			density_obj[all_density_keys[i]] = (i + 1);
		
		//Return statement; Sort object in ascending order
		return density_obj;
	};
	
	global.getWalkabilityRatioObject = function () {
		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;
		
		var angel_regions = density_processing_obj.angel_regions;
		
		//Iterate over all_angel_regions
		var all_angel_regions = Object.keys(angel_regions);
		
		for (let i = 0; i < all_angel_regions.length; i++) {
			let region_mean_walkability = {};
			let region_obj = angel_regions[all_angel_regions[i]];
			let region_walkability_sum = {};
			
			//Iterate over all_cities
			let all_cities = Object.keys(region_obj.cities);
			
			for (let x = 0; x < all_cities.length; x++) {
				let local_city = region_obj.cities[all_cities[x]];
				let local_city_keys = Object.keys(local_city);
				let local_domain = [parseInt(local_city_keys[0]), parseInt(local_city_keys[local_city_keys.length - 1])];
				let local_years = [];
				
				//Iterate over the local_domain; pad out numbers to the end year (2000)
				for (var y = local_domain[0]; y <= local_domain[1]; y++)
					local_years.push(y);
				
				local_city = cubicSplineInterpolationObject(local_city, { years: local_years });
				for (var y = local_domain[1]; y <= density_processing_obj.end_year; y++)
					local_city[y] = local_city[local_domain[1]];
				
				region_obj.cities[all_cities[x]] = local_city;
			}
			
			//Compute mean for all_cities
			for (let x = density_processing_obj.baseline_year; x <= density_processing_obj.end_year; x++)
				for (let y = 0; y < all_cities.length; y++) {
					let local_city = region_obj.cities[all_cities[y]];
					
					if (!region_walkability_sum) region_walkability_sum[all_cities[y]] = {};
					modifyValue(region_walkability_sum, x, local_city[x]);
				}
			
			//Iterate over all_region_walkability_sum_keys
			for (let x = density_processing_obj.baseline_year; x <= density_processing_obj.end_year; x++)
				region_mean_walkability[x] = 1 - (region_walkability_sum[x]/all_cities.length - 1); //Invert walkability ratio
			
			region_obj.walkability_ratio = region_mean_walkability;
		}
		
		//Return statement
		return angel_regions;
	};
	
	//2.1. Calculate .centre_density (A) from rank ordinal of actual density
	global.calculateCitiesCentreDensities = function (arg0_stadester_obj) {
		//Convert from parameters
		var stadester_obj = (arg0_stadester_obj) ? arg0_stadester_obj : getProcessedStadesterObject();
		
		//Declare local instance variables
		var all_cities = Object.keys(stadester_obj);
		var density_obj = {}; //Contains per-year <city_key>: <rank_ordinal> dictionaries from 1800-2000
		var global_density_obj = getGlobalPopulationDensityObject();
		
		//Populate density_obj
		var density_processing_obj = config.population_density.processing;
		
		for (let i = density_processing_obj.baseline_year; i <= density_processing_obj.end_year; i++)
			density_obj[i] = calculateDensityOrdinalsForYear(i, stadester_obj);
		
		var all_density_keys = Object.keys(density_obj);
		
		//Iterate over all_cities, and adjust for rolling Angel density (global_density_obj)
		for (let i = 0; i < all_cities.length; i++) {
			var has_density_ranks = false;
			let local_centre_density_obj = {};
			let local_city = stadester_obj[all_cities[i]];
			
			//Check to see if local_city has_density_ranks
			for (let x = 0; x < all_density_keys.length; x++) {
				let local_density_dictionary = density_obj[all_density_keys[x]];
				
				if (local_density_dictionary[local_city.key]) {
					has_density_ranks = true;
					break;
				}
			}
			
			if (has_density_ranks) {
				//Iterate over all_density_keys and calculate centre_density for that key
				for (let x = 0; x < all_density_keys.length; x++) {
					let local_density_dictionary = density_obj[all_density_keys[x]];
					
					if (local_density_dictionary[local_city.key]) {
						let local_density_rank = local_density_dictionary[local_city.key];
						
						let centre_density = 130*Math.log(
							Object.keys(local_density_dictionary).length/120/local_density_rank
						) + 506 + global_density_obj[all_density_keys[x]];
						
						local_centre_density_obj[all_density_keys[x]] = centre_density;
					}
				}
			}
			
			console.log(`- ${local_city.key} (${i}/${all_cities.length}):`);
			console.log(` - centre_density:`, local_centre_density_obj);
			local_city.centre_density = local_centre_density_obj;
		}
		
		//Return statement
		return stadester_obj;
	};
	
	global.processCitiesAreas = function () {
		//Declare local instance variables
		//1. Fundamental variables; .area/.density calculation
		global.stadester_obj = estimateBaselineCityAreas();
		global.stadester_obj = calculateRemainderCityAreas(stadester_obj);
		global.stadester_obj = fixCityAreas(stadester_obj);
		
		global.stadester_obj = calculateCityDensities(stadester_obj);
		
		//2. Clark coefficient calculations
		global.stadester_obj = assignRegionsToCities(stadester_obj); //Used for calculating Clark variant equations/walkability ratios
		global.stadester_obj = calculateCitiesCentreDensities(stadester_obj);
		
		//Save processed stadester_obj
		FileManager.saveFileAsJSON('./input/uud/stadester_areas.json', stadester_obj);
	};
}