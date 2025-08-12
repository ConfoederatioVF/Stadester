//Initialise functions
{
	global.areNamesSimilar = function (arg0_name, arg1_ot_name) {
		//Convert from parameters
		var name = arg0_name;
		var ot_name = arg1_ot_name;
		
		//Declare local instance variables
		name = name.toLowerCase().trim();
		ot_name = ot_name.toLowerCase().trim();
		
		//Return statement
		if (ot_name.includes(name) || name.includes(ot_name) || name == ot_name)
			return true;
	};
	
	global.getCoordsDistance = function (arg0_coords, arg1_coords) {
		//Convert from parameters
		var coords = arg0_coords;
		var ot_coords = arg1_coords;
		
		//Declare local instance variables
		var d_lat = ot_coords[0] - coords[0];
		var d_lng = ot_coords[1] - coords[1];
		
		//Return statement
		return Math.sqrt(d_lat*d_lat + d_lng*d_lng);
	};
	
	global.initialiseUUD = function () {
		//Declare local instance variables
		var options = {
			populstat: {
				data: getPopulstatObject()
			},
			chandler_modelski: {
				data: getChandlerModelskiObject(), legacy_chandler_modelski_merging: true
			},
			devries: {
				data: getDeVriesCitiesObject(), precision: 0.05, semantic_precision: 1
			},
			buringh: {
				data: getBuringhObject(), precision: 0.05, semantic_precision: 1
			}
		};
		var return_obj = {};
		
		//1. Unify all databases; iterate over all_options_keys
		var all_options_keys = Object.keys(options);
		
		for (let i = 0; i < all_options_keys.length; i++) {
			let local_db = options[all_options_keys[i]];
			
			//First come, first-serve
			let all_local_cities = Object.keys(local_db.data);
			
			if (i == 0)
				for (let x = 0; x < all_local_cities.length; x++) {
					let local_city = local_db.data[all_local_cities[x]];
					
					return_obj[all_local_cities[x]] = local_city;
				}
			
			//0. Legacy Chandler-Modelski handling
			if (local_db.legacy_chandler_modelski_merging) {
				for (let x = 0; x < all_local_cities.length; x++) {
					let local_city = local_db.data[all_local_cities[x]];
					let local_split_city_name = all_local_cities[x].split("-");
					
					let local_country_name = local_split_city_name[local_split_city_name.length - 1];
					local_split_city_name.pop();
					local_split_city_name = local_split_city_name.join("-");
					
					let local_city_names = [`${local_split_city_name}, ${local_country_name}`, local_split_city_name];
					
					//Iterate over local_city.other_names
					if (local_city.other_names) {
						let local_other_names = getList(local_city.other_names);
						
						for (let y = 0; y < local_other_names.length; y++) {
							local_city_names.push(`${local_other_names[y]}, ${local_country_name}`);
							local_city_names.push(local_other_names[y]);
						}
					}
					
					//Iterate over local_city_names; find local_uud_city
					let local_uud_city;
					
					for (let y = 0; y < local_city_names.length; y++) try {
						local_uud_city = getFlattenedPopulstatCity(local_city_names[y], { populstat_obj: return_obj });
						
						//Only find cities that are within 1 degree o f.coords
						if (local_uud_city) {
							//Check if .latitude and .longitude are within 1 degree of .coords
							let latlng = local_uud_city.coords;
							let ot_latlng = local_city.coords;
							
							if (Math.abs(latlng[0] - ot_latlng[0]) <= 1 && Math.abs(latlng[1] - ot_latlng[1]) <= 1) {
								if (options.debug) {
									local_uud_city.break_condition = [local_city_names[y], true];
									local_uud_city.latlng = latlng;
									local_uud_city.ot_latlng = ot_latlng;
								}
								break;
							}
						}
						
						//Reset local_uud_city for next iteration
						local_uud_city = undefined;
					} catch (e) {
						console.error(e);
					}
					
					//Otherwise; check if there are any UUD cities whose .coords are within 0,1 degrees of ot_latlng; fetch closest match
					let all_return_cities = Object.keys(return_obj);
					let closest_uud_city = [undefined, 1];
					
					if (!local_uud_city) {
						for (let y = 0; y < all_return_cities.length; y++) {
							let local_ot_city = return_obj[all_return_cities[y]];
							if (local_ot_city.type) continue; //Skip if .type is already set; this is likely a Chandler-Modelski city
							
							let latlng = local_ot_city.coords;
							let ot_latlng = local_city.coords;
							
							if (latlng)
								if (Math.abs(latlng[0] - ot_latlng[0]) <= 0.1 && Math.abs(latlng[1] - ot_latlng[1]) <= 0.1) {
									var sum_distance = Math.abs(latlng[0] - ot_latlng[0]) + Math.abs(latlng[1] - ot_latlng[1]);
									
									if (sum_distance < closest_uud_city[1] && sum_distance < 0.2)
										closest_uud_city = [local_ot_city, sum_distance];
								}
						}
						
						if (closest_uud_city[0])
							local_uud_city = closest_uud_city[0];
					}
					
					//Assign populstat/chandler_modelski city types
					if (local_uud_city) {
						console.log(`Merging:`, all_local_cities[x], local_uud_city.key);
						local_uud_city.type = "populstat";
						
						local_uud_city.population = mergeCityPopulations(local_uud_city.population, local_city.population)
						local_uud_city.chandler_modelski_coords = [local_city.latitude, local_city.longitude];
						local_uud_city.chandler_modelski_key = all_local_cities[x];
						return_obj[local_uud_city.key] = local_uud_city;
						
						//Delete keys if different
						if (all_local_cities[x] != local_uud_city.key) delete return_obj[all_local_cities[x]];
					} else {
						//Set local_city as a new UUD city
						local_city.type = "chandler_modelski";
						return_obj[all_local_cities[x]] = local_city;
					}
				}
			} else {
				//Regular Euclidean merging based on precision rules
				//1. Iterate over all_local_cities and check against all_return_keys coords
				let all_return_keys = Object.keys(return_obj);
				
				for (let x = 0; x < all_local_cities.length; x++) {
					var local_city = local_db.data[all_local_cities[x]];
					var was_merged = [false, undefined];
					
					//.precision check
					if (local_db.precision)
						//Check if local_city should be merged using precision threshold
						for (var y = 0; y < all_return_keys.length; y++) {
							var local_uud_city = return_obj[all_return_keys[y]];
							
							if (local_uud_city)
								if (local_uud_city.coords && local_city.coords) try {
									var local_distance = getCoordsDistance(local_uud_city.coords, local_city.coords);
									
									if (local_distance <= local_db.precision) {
										console.log(`- (!CM): Proximity merge (${local_uud_city.name} - ${local_city.name}):`, local_distance)
										was_merged = [true, local_uud_city];
										break;
									}
								} catch (e) { console.error(e); }
						}
					
					//.semantic_precision check
					if (!was_merged[0])
						if (local_db.semantic_precision) {
							//Check if local_city should be merged using semantic_precision threshold
							let city_names = [`${local_city.name}`, `${local_city.key}`];
							let closest_uud_city_match = [Infinity, undefined];
							
							//Iterate over all .names, .other_names if possible
							if (local_city.other_names)
								for (let y = 0; y < local_city.other_names.length; y++)
									if (local_city.country)
										city_names.push(`${local_city.other_names[y]}, ${local_city.country}`);
							
							//Iterate over all city_names, looking for a semantic match
							for (let y = 0; y < city_names.length; y++) try {
								let local_uud_city = getFlattenedPopulstatCity(city_names[y], {
									populstat_obj: return_obj,
									same_country: true
								});
								
								if (local_uud_city)
									if (local_uud_city.coords && local_city.coords) try {
										let local_distance = getCoordsDistance(local_uud_city.coords, local_city.coords);
										
										if (local_distance <= closest_uud_city_match[0])
											closest_uud_city_match = [local_distance, local_uud_city];
									} catch (e) { console.error(e); }
							} catch (e) {
								console.error(e);
							}
							
							//Set was_merged if possible
							if (closest_uud_city_match[0] <= local_db.semantic_precision) {
								console.log(`- (!CM): Merged ${local_city.name}, ${closest_uud_city_match[1].name}, distance: ${closest_uud_city_match[0]}`)
								was_merged = [true, closest_uud_city_match[1]];
							}
						}
					
					//Regular merge logic; merge into actual_city - direct key check prior to merging
					if (return_obj[all_local_cities[x]])
						was_merged = [true, return_obj[all_local_cities[x]]];
					
					//Merge cities found to be identical
					let is_separate_city = false;
					
					if (was_merged[0]) {
						let actual_city = return_obj[was_merged[1].key];
						
						if (actual_city) {
							if (local_city.population)
								actual_city.population = mergeCityPopulations(actual_city.population, local_city.population);
							actual_city.type = all_options_keys[i];
							
							return_obj[actual_city.key] = actual_city;
							
							if (all_local_cities[x] != actual_city.key) delete return_obj[all_local_cities[x]];
						} else {
							is_separate_city = true;
						}
					} else {
						is_separate_city = true;
					}
					
					//console.log(was_merged, local_city.name);
					if (is_separate_city) {
						console.log(`- (!CM): Adding separate city: (${all_options_keys[i]})`, local_city.name);
						local_city.type = all_options_keys[i];
						
						return_obj[all_local_cities[x]] = local_city;
					}
				}
			}
		}
		
		//2. Flatten .population array entries; take weightedGeometricMean
		var all_return_keys = Object.keys(return_obj);
		
		//Iterate over all_return_keys
		for (let i = 0; i < all_return_keys.length; i++) {
			let local_city = return_obj[all_return_keys[i]];
			
			//Check to make sure local_city has valid coords and population
			if (local_city.coords && Array.isArray(local_city.coords))
				if (!isNaN(parseFloat(local_city.coords[0])) && !isNaN(parseFloat(local_city.coords[1]))) {
					local_city.coords = [parseFloat(local_city.coords[0]), parseFloat(local_city.coords[1])];
					
					if (local_city.population) {
						let all_population_keys = Object.keys(local_city.population);
						
						for (let x = 0; x < all_population_keys.length; x++) {
							let local_value = local_city.population[all_population_keys[x]];
							
							if (Array.isArray(local_value))
								if (local_value.length > 1) {
									local_city.population[all_population_keys[x]] = weightedGeometricMean(local_value);
								} else {
									local_city.population[all_population_keys[x]] = local_value[0];
								}
						}
					}
				} else {
					//Delete malformed cities
					delete return_obj[all_return_keys[i]];
				}
		}
		
		//Save uud_obj
		console.time(`- Saving raw UUD data...`);
		FileManager.saveFileAsJSON(config.defines.common.input_file_paths.uud_cities, return_obj);
		console.timeEnd(`- Saving raw UUD data...`);
		
		//Return statement
		//return return_obj;
	};
	
	global.mergeCityPopulations = function (arg0_population_obj, arg1_population_obj) {
		//Convert from parameters
		var population_obj = JSON.parse(JSON.stringify(arg0_population_obj));
		var ot_population_obj = JSON.parse(JSON.stringify(arg1_population_obj));
		
		//Declare local instance variables
		var all_ot_population_keys = Object.keys(ot_population_obj);
		var all_population_keys = Object.keys(population_obj);
		
		//Make everything in all_population_keys an array
		for (let i = 0; i < all_population_keys.length; i++)
			if (!Array.isArray(population_obj[all_population_keys[i]]))
				population_obj[all_population_keys[i]] = [population_obj[all_population_keys[i]]];
		
		//Iterate over all_ot_population_keys and attempt their merger into population_obj
		for (let i = 0; i < all_ot_population_keys.length; i++) {
			let local_value = ot_population_obj[all_ot_population_keys[i]];
			
			if (Array.isArray(local_value))
				local_value = local_value.flat(Infinity);
			
			if (Array.isArray(population_obj[all_ot_population_keys[i]])) {
				if (!Array.isArray(local_value)) {
					population_obj[all_ot_population_keys[i]].push(local_value);
				} else {
					population_obj[all_ot_population_keys[i]] = population_obj[all_ot_population_keys[i]].concat(local_value);
				}
			} else {
				if (!Array.isArray(local_value)) {
					population_obj[all_ot_population_keys[i]] = [local_value];
				} else {
					population_obj[all_ot_population_keys[i]] = local_value;
				}
			}
		}
		
		//Return statement
		return population_obj;
	};
}