//Initialise functions
{
	/**
	 * Geomeans the superset of all world population estimates and cubic spline interpolates them over all HYDE years.
	 *
	 * @returns {Object}
	 */
	global.getWorldPopulationObject = function () {
		//Declare local instance variables
		var hyde_years = config.uud.processing.hyde_years;
		var return_obj = {};
		var world_pop_obj = config.velkscala.world_population_estimates;
		
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
		
		for (let i = 0; i < all_years.length; i++)
			return_obj[all_years[i]] = weightedGeometricMean(return_obj[all_years[i]]);
		
		//Interpolate return_obj over all HYDE years
		return_obj = cubicSplineInterpolationObject(return_obj, { years: hyde_years });
		return_obj = multiplyObject(return_obj, 1000000); //Figures are given in millions, so multiply them by a million
		
		//Return statement
		return sortObjectKeys(return_obj, { type: "ascending" });
	}
}