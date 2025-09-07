//Initialise functions
{
	/**
	 * Geomeans the superset of all world population estimates and cubic spline interpolates them over all HYDE years.
	 *
	 * @returns {Object}
	 */
	global.getWorldPopulationObject = function () {
		//Declare local instance variables
		let growth_rate_obj = {};
		let hyde_years = config.uud.processing.hyde_years.concat([2024, 2025]).sort((a, b) => a - b);
		let original_world_pop_obj = config.velkscala.world_population_estimates;
		let return_obj = {};
		let world_pop_obj = JSON.parse(JSON.stringify(config.velkscala.world_population_estimates));
		
		//1. Strong Geometric Mean (SGM) for world population
		{
			//Iterate over all_estimates and cubic spline interpolate them first if applicable
			var all_estimates = Object.keys(world_pop_obj);
			
			for (let i = 0; i < all_estimates.length; i++) {
				let local_estimate = world_pop_obj[all_estimates[i]];
				
				let all_local_years = Object.keys(local_estimate);
				
				if (all_local_years.length >= 2)
					world_pop_obj[all_estimates[i]] = cubicSplineInterpolationObject(local_estimate, { years: hyde_years });
			}
			
			//Iterate over all_estimates and geomean them in return_obj
			var all_estimates = Object.keys(world_pop_obj);
			
			for (let i = 0; i < all_estimates.length; i++) {
				var local_estimate = world_pop_obj[all_estimates[i]];
				
				var all_local_years = Object.keys(local_estimate);
				
				for (let x = 0; x < all_local_years.length; x++) {
					var local_value = local_estimate[all_local_years[x]];
					
					if (!return_obj[all_local_years[x]]) return_obj[all_local_years[x]] = [];
					return_obj[all_local_years[x]].push(local_value);
				}
			}
			
			//Iterate over all_years in return_obj and set them to their weighted geometric mean
			var all_years = Object.keys(return_obj);
			let years_to_interpolate = [];
			
			for (let i = 0; i < all_years.length; i++)
				return_obj[all_years[i]] = weightedGeometricMean(return_obj[all_years[i]]);
			
			//Iterate over all_years in return_obj and filter outliers
			for (let i = 0; i < all_years.length; i++) {
				let local_next_value = returnSafeNumber(return_obj[all_years[i + 1]]);
				let local_previous_value = returnSafeNumber(return_obj[all_years[i - 1]]);
				let local_value = return_obj[all_years[i]];
				
				//If local_value is less than either the previous value and next value, and is before 1975, and is a whole number (meaning it is a single estimate), delete it
				if (local_value < local_previous_value && local_value < local_next_value)
					if (parseInt(all_years[i]) < 1975)
						if (local_value % 1 === 0)
							delete return_obj[all_years[i]];
			}
			
			//Iterate over all hyde_years; populate years_to_interpolate
			for (let i = 0; i < hyde_years.length; i++)
				if (!return_obj[hyde_years[i]])
					years_to_interpolate.push(hyde_years[i]);
			
			//Interpolate return_obj over all HYDE years
			return_obj = cubicSplineInterpolationObject(return_obj, { years: years_to_interpolate });
			return_obj = multiplyObject(return_obj, 1000000); //Figures are given in millions, so multiply them by a million
		}
		
		//2. Calculate annualised growth rates for all HYDE years over all estimates
		{
			//Iterate over all_estimates
			let all_estimates = Object.keys(world_pop_obj);
			let average_rni_obj = {};
			
			//Iterate over all_estimates and fetch their RNI
			for (let i = 0; i < all_estimates.length; i++) {
				let filtered_estimate_obj = {};
				let filtered_rni_obj = {};
				let local_estimate = original_world_pop_obj[all_estimates[i]];
				
				//Iterate over all HYDE years and populate filtered_estimate_obj
				for (let x = 0; x < hyde_years.length; x++)
					if (local_estimate[hyde_years[x]])
						filtered_estimate_obj[hyde_years[x]] = local_estimate[hyde_years[x]];
				
				//Iterate over all_filtered_keys in local_estimate
				let all_filtered_keys = Object.keys(filtered_estimate_obj).sort((a, b) => a - b);
				
				if (all_filtered_keys.length >= 2)
					for (let x = 0; x < all_filtered_keys.length - 1; x++) {
						let local_next_value = filtered_estimate_obj[all_filtered_keys[x + 1]];
						let local_value = filtered_estimate_obj[all_filtered_keys[x]];
						
						//Populate filtered_rni_obj
						filtered_rni_obj[all_filtered_keys[x]] = (local_next_value - local_value)/
							(local_value*(all_filtered_keys[x + 1] - all_filtered_keys[x]));
					}
				growth_rate_obj[all_estimates[i]] = filtered_rni_obj;
			}
			
			//Iterate over all_estimates and populate average_rni_obj
			for (let i = 0; i < all_estimates.length; i++) {
				let local_growth_rate_obj = growth_rate_obj[all_estimates[i]];
				
				let all_local_years = Object.keys(local_growth_rate_obj);
				
				for (let x = 0; x < all_local_years.length; x++) {
					let local_value = local_growth_rate_obj[all_local_years[x]];
					
					if (!average_rni_obj[all_local_years[x]]) average_rni_obj[all_local_years[x]] = [];
						average_rni_obj[all_local_years[x]].push(local_value);
				}
			}
			
			//Iterate over all_rni_keys and resolve average_rni_obj
			let all_rni_keys = Object.keys(average_rni_obj);
			
			for (let i = 0; i < all_rni_keys.length; i++) {
				let local_value = average_rni_obj[all_rni_keys[i]];
				
				if (local_value.length >= 2) {
					average_rni_obj[all_rni_keys[i]] = weightedGeometricMean(local_value);
				} else {
					average_rni_obj[all_rni_keys[i]] = local_value[0];
				}
			}
			
			growth_rate_obj = average_rni_obj;
		}
		
		console.log(growth_rate_obj);
		
		//Return statement
		return sortObjectKeys(return_obj, { type: "ascending" });
	}
}