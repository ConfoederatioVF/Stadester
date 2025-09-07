//Initialise functions
{
	global.generateStadesterNorthernAmericaRasters = function () {
	
	};
	
	global.getNorthernAmericaPopulationObject = function () {
		//Declare local instance variables
		let hyde_years = config.uud.processing.hyde_years.concat([2024, 2025]);
		let northern_america_obj = config.velkscala.northern_america;
		
		let northern_america_domain = northern_america_obj.domain;
		
		//Iterate over all_mask_keys and interpolate over all HYDE years within objects with .population
		let all_mask_keys = Object.keys(northern_america_obj.areal_masks);
		
		for (let i = 0; i < all_mask_keys.length; i++) {
			let local_mask = northern_america_obj.areal_masks[all_mask_keys[i]];
			
			//Make sure colour is in [R, G, B] format
			if (typeof local_mask.colour == "string")
				local_mask.colour = hexToRGB(local_mask.colour);
			if (local_mask.population) {
				let all_local_years = Object.keys(local_mask.population)
					.map(Number).sort((a, b) => a - b);
				let local_mask_domain = [all_local_years[0], all_local_years[all_local_years.length - 1]];
				let years_to_interpolate = [];
				
				//Iterate over all hyde_years within domain
				for (let x = 0; x < hyde_years.length; x++)
					if (hyde_years[x] >= local_mask_domain[0] && hyde_years[x] <= local_mask_domain[1]) {
						let is_in_domain = false;
							if (hyde_years[x] >= northern_america_domain[0] && hyde_years[x] <= northern_america_domain[1])
								is_in_domain = true;
							if (local_mask.special_domain) is_in_domain = true;
							
							//If the current year is in domain and is not already an entry, try to interpolate for it
							if (is_in_domain && !local_mask.population[hyde_years[x]])
								years_to_interpolate.push(hyde_years[x]);
					}
				
				//Interpolate for years_to_interpolate; make sure that the object is scaled properly
				local_mask.population = cubicSplineInterpolationObject(local_mask.population, { years: years_to_interpolate });
				if (local_mask.scalar)
					local_mask.population = multiplyObject(local_mask.population, local_mask.scalar);
			}
			
			local_mask.key = all_mask_keys[i];
		}
		
		//Iterate over all_mask_keys and set their colourmap
		for (let i = 0; i < all_mask_keys.length; i++) {
			let local_mask = northern_america_obj.areal_masks[all_mask_keys[i]];
			
			let local_key = [local_mask.colour[0], local_mask.colour[1], local_mask.colour[2]].join(",");
			
			northern_america_obj.areal_masks[local_key] = local_mask;
			northern_america_obj.areal_masks[local_key].is_clone = true;
		}
		
		//Return statement
		return northern_america_obj;
	};
}