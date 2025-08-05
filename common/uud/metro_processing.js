//Initialise functions
{
	global.distributeNegativeValuesAcrossMetros = function (arg0_stadester_obj) {
		var stadester_obj = arg0_stadester_obj;
		var all_cities = Object.keys(stadester_obj);
		
		for (let i = 0; i < all_cities.length; i++) {
			var city = stadester_obj[all_cities[i]];
			var pop = city.population || {};
			var negative_years = Object.keys(pop).filter(
				(year) => pop[year] < 0
			);
			
			if (negative_years.length === 0) continue;
			
			for (let y = 0; y < negative_years.length; y++) {
				var year = negative_years[y];
				var negative_value = Math.abs(pop[year]);
				
				// Find suburbs (other cities with .metro_key === city.key)
				var suburbs = all_cities
				.map((k) => stadester_obj[k])
				.filter(
					(c) =>
						c.metro_key === city.key &&
						c.population &&
						typeof c.population[year] === "number" &&
						c.population[year] > 0
				);
				
				var total_suburb_pop = suburbs.reduce(
					(sum, suburb) => sum + suburb.population[year],
					0
				);
				
				if (total_suburb_pop === 0) continue; // Can't distribute
				
				// Proportionally distribute negative value, capping at zero
				let distributed = 0;
				for (let s = 0; s < suburbs.length; s++) {
					let suburb = suburbs[s];
					let share = suburb.population[year] / total_suburb_pop;
					let to_subtract = share * negative_value;
					// Cap at zero
					if (suburb.population[year] - to_subtract < 0) {
						to_subtract = suburb.population[year];
					}
					suburb.population[year] -= to_subtract;
					distributed += to_subtract;
				}
				
				// Set the metro's population for that year to the remaining negative (as negative)
				let remaining_negative = negative_value - distributed;
				pop[year] = remaining_negative > 0 ? -remaining_negative : 0;
			}
		}
		
		return stadester_obj;
	};
	
	global.flattenStadesterMetros = function () {
		//Declare local instance variables
		var stadester_obj = getStadesterObject();
			stadester_obj = removeStadesterDuplicates(stadester_obj);
			global.stadester_obj = stadester_obj;
		
		//Iterate over all_cities in stadester_obj
		var all_cities = Object.keys(stadester_obj);
		
		for (let i = 0; i < all_cities.length; i++) {
			var local_city = stadester_obj[all_cities[i]];
			var metro_obj = getStadesterMetroObject(local_city);
				if (metro_obj) {
					metro_obj = stadester_obj[metro_obj.key];
					if (metro_obj.key == local_city.key) continue; //Internal guard clause for self-intersections
				}
			
			//Subtract overlapping .population values in local_city from metro_obj.population
			if (metro_obj) {
				var all_local_population_keys = Object.keys(local_city.population);
				
				for (let x = 0; x < all_local_population_keys.length; x++)
					if (
						!isNaN(metro_obj.population[all_local_population_keys[x]]) &&
						!isNaN(local_city.population[all_local_population_keys[x]])
					) {
						local_city.metro_key = metro_obj.key;
						metro_obj.population[all_local_population_keys[x]] -= local_city.population[all_local_population_keys[x]];
					}
			}
		}
		
		//Distribute excess negative values across metros
		stadester_obj = distributeNegativeValuesAcrossMetros(stadester_obj);
		
		//Save file as flattened_stadester_cities.json
		console.log(`Saved raw metro-adjusted Stadestér dump.`);
		FileManager.saveFileAsJSON(config.defines.common.input_file_paths.flattened_stadester_cities, stadester_obj);
		
		//Return statement
		return stadester_obj;
	};
	
	global.getStadesterMetroObject = function (arg0_city_obj) {
		//Convert from parameters
		var city_obj = arg0_city_obj;
		
		//Internal guard clause if the city is not an agglomeration of anything
		if (!city_obj.is_agglomeration_of) return;
		
		//Declare local instance variables
		var stadester_obj = getStadesterObject();
		
		var all_cities = Object.keys(stadester_obj);
		var candidate_cities = [];
		
		//Iterate over all_cities
		for (let i = 0; i < all_cities.length; i++) {
			//Convert from parameters
			var local_city = stadester_obj[all_cities[i]];
			
			if (local_city.country == city_obj.country)
				//Check to make sure this city is within 250km of our candidate city and has agglomeration in the name before pushing
				try {
					if (haversineDistance(local_city.coords, city_obj.coords) <= 250)
						if (local_city.population &&
							Object.keys(local_city.population).length > Object.keys(city_obj.population).length
						)
							candidate_cities.push(stadester_obj[all_cities[i]]);
				} catch (e) { console.error(`Error when iterating for city:`, all_cities[i], e); }
		}
		
		//Return statement
		return getStadesterBestCityMatch({ name: city_obj.is_agglomeration_of }, candidate_cities);
	};
	
	global.getStadesterObject = function () {
		//Return statement
		return (global.stadester_obj) ?
			global.stadester_obj : JSON.parse(fs.readFileSync(config.defines.common.input_file_paths.stadester_cities));
	}
	
	global.parseUUDToStadester = function () {
		//Declare local instance variables
		var return_obj = {};
		var uud_obj = JSON.parse(fs.readFileSync(config.defines.common.input_file_paths.processed_uud_cities));
		
		//Iterate over all_countries and flatten them
		var all_countries = Object.keys(uud_obj);
		
		for (let i = 0; i < all_countries.length; i++) {
			var local_country = uud_obj[all_countries[i]];
			
			if (local_country.type != "chandler_modelski") {
				var all_local_cities = Object.keys(local_country);
				var local_country_name = config.populstat.countries[all_countries[i]];
				
				for (let x = 0; x < all_local_cities.length; x++) {
					var local_city = local_country[all_local_cities[x]];
					
					//Set country name
					local_city.country = local_country_name;
					return_obj[`${all_local_cities[x]}-${local_country_name}`] = local_city;
				}
			} else {
				var local_city = local_country;
				
				//Set country name
				local_city.country = all_countries[i].split("-");
				local_city.country = local_city.country[local_city.country.length - 1];
				
				return_obj[`${all_countries[i]}`] = local_city;
			}
		}
		
		//Assign .key fields to all_cities; iterate over all_cities
		var all_cities = Object.keys(return_obj);
		
		for (let i = 0; i < all_cities.length; i++) {
			var local_city = return_obj[all_cities[i]];
			
			//Clean up coords, set .key
			if (local_city.coords != undefined)
				return_obj[all_cities[i]].coords = [
					parseFloat(local_city.coords[0]),
					parseFloat(local_city.coords[1])
				];
			return_obj[all_cities[i]].key = all_cities[i];
			
			//Check to make sure name doesn't have a colon in it
			if (local_city.name.includes(":"))
				delete return_obj[all_cities[i]];
		}
		
		//Save file as stadester_cities.json; global.stadester_obj
		console.log(`Saved raw flattened Stadestér dump.`);
		FileManager.saveFileAsJSON(config.defines.common.input_file_paths.stadester_cities, return_obj);
		global.stadester_obj = return_obj;
		
		//Return statement
		return return_obj;
	};
	
	//[WIP] - Refactor at a later date
	global.removeStadesterDuplicates = function (arg0_stadester_obj) {
		const stadester_obj = arg0_stadester_obj;
		const grouped = {};
		
		// Group by rounded coords
		for (const key in stadester_obj) {
			const city = stadester_obj[key];
			if (!Array.isArray(city.coords) || city.coords.length < 2) continue;
			// Use 4 decimal places for 0.0001 deg tolerance, 3 for 0.001, 1 for 0.1
			const lat = Number(city.coords[0]).toFixed(3);
			const lng = Number(city.coords[1]).toFixed(3);
			const groupKey = `${lat},${lng}`;
			if (!grouped[groupKey]) grouped[groupKey] = [];
			grouped[groupKey].push({ key, city });
		}
		
		const result = {};
		
		for (const groupKey in grouped) {
			const group = grouped[groupKey];
			// Find the "original" (longest population keys)
			group.sort(
				(a, b) =>
					Object.keys(b.city.population || {}).length -
					Object.keys(a.city.population || {}).length
			);
			const original = group[0].city;
			for (let i = 1; i < group.length; i++) {
				const duplicate = group[i].city;
				for (const popKey in duplicate.population) {
					if (original.population.hasOwnProperty(popKey)) {
						original.population[popKey] = Math.max(
							original.population[popKey],
							duplicate.population[popKey]
						);
					} else {
						original.population[popKey] = duplicate.population[popKey];
					}
				}
			}
			result[group[0].key] = original;
		}
		
		return result;
	};
}

//Internal helper functions - [WIP] - To be refactored later
{
	global.getStadesterBestCityMatch = function (city_obj, candidate_cities) {
		// Levenshtein distance helper
		function levenshtein(a, b) {
			const matrix = Array.from({ length: a.length + 1 }, () =>
				Array(b.length + 1).fill(0)
			);
			for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
			for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
			for (let i = 1; i <= a.length; i++) {
				for (let j = 1; j <= b.length; j++) {
					if (a[i - 1] === b[j - 1]) {
						matrix[i][j] = matrix[i - 1][j - 1];
					} else {
						matrix[i][j] =
							1 +
							Math.min(
								matrix[i - 1][j], // deletion
								matrix[i][j - 1], // insertion
								matrix[i - 1][j - 1] // substitution
							);
					}
				}
			}
			return matrix[a.length][b.length];
		}
		
		// Scoring function
		function cityNameScore(input, candidate) {
			if (input === candidate) return 3;
			if (
				candidate.toLowerCase().includes(input.toLowerCase()) ||
				input.toLowerCase().includes(candidate.toLowerCase())
			)
				return 2;
			const lev = levenshtein(input.toLowerCase(), candidate.toLowerCase());
			return 1 / (1 + lev);
		}
		
		// Main logic
		let bestScore = -Infinity;
		let bestCity = null;
		
		for (let i = 0; i < candidate_cities.length; i++) {
			let local_city_names = [candidate_cities[i].name];
			if (candidate_cities[i].other_names)
				local_city_names = local_city_names.concat(
					candidate_cities[i].other_names
				);
			
			for (const candidateName of local_city_names) {
				const score = cityNameScore(city_obj.name, candidateName);
				if (score > bestScore) {
					bestScore = score;
					bestCity = candidate_cities[i];
				}
				if (score === 3) return bestCity; // Early exit for perfect match
			}
		}
		return bestCity;
	};
}