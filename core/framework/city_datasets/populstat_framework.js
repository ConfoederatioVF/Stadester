//Initialise functions
{
	global.getPopulstatObject = function () {
		//Declare local instance variables
		var populstat_obj = JSON.parse(JSON.stringify(main.population.populstat));
		var return_obj = {};
		
		//Iterate over all_countries
		var all_countries = Object.keys(populstat_obj);
		
		for (let i = 0; i < all_countries.length; i++) {
			let local_country = populstat_obj[all_countries[i]];
			
			let all_local_cities = Object.keys(local_country);
			let local_country_name = config.populstat.countries[all_countries[i]];
			
			for (let x = 0; x < all_local_cities.length; x++) {
				let local_city = local_country[all_local_cities[x]];
				let local_key = `${all_local_cities[x]}-${local_country_name}`;
				
				//Multiply all population entries by 1000
				if (local_city.population)
					local_city.population = operateObject(local_city.population, `n = n*1000`);
				
				//Set .country, .key
				local_city.country = local_country_name;
				local_city.key = local_key;
				return_obj[local_key] = local_city;
			}
		}
		
		//Return statement
		return return_obj;
	};
}