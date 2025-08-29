//Initialise functions
{
	global.generateOutputAreaDensityPopulationTable = function () {
		//Declare local instance variables
		let common_defines = config.defines.common;
		let return_obj = {};
		let stadester_ghsl_obj = FileManager.loadFileAsJSON(common_defines.output_file_paths.stadester_ghsl);
		let temp_obj = {
			area_top_obj: getTopCityKeysForField('area', { threshold: 120, outlier_rule: 'none' }),
			density_ghsl_top_obj: getTopCityKeysForField('density', { threshold: 120, outlier_rule: 'none', ghsl_only: true }),
			density_top_obj: getTopCityKeysForField('density', { threshold: 120, outlier_rule: 'none', stadester_only: true }),
			population_top_obj: getTopCityKeysForField('population', { threshold: 120, outlier_rule: 'none' })
		};
		
		//Iterate over all variables
		let preserve_keys = ["name", "region", "colour", "coords", "pixel_coords"];
		let variables = ["area", "density", "density_ghsl", "population"];
		
		for (let i = 0; i < variables.length; i++) {
			let local_obj = temp_obj[`${variables[i]}_top_obj`];
			let all_local_keys = Object.keys(local_obj);
			
			//Iterate over all_local_keys; populate temp_obj[variables[i]]
			temp_obj[variables[i]] = {};
			
			for (let x = 0; x < all_local_keys.length; x++) {
				let local_city = stadester_ghsl_obj[all_local_keys[x]];
				let local_return_obj = {};
				let local_value = local_obj[all_local_keys[x]];
				
				for (let y = 0; y < preserve_keys.length; y++)
					if (local_city[preserve_keys[y]] !== undefined)
						local_return_obj[preserve_keys[y]] = local_city[preserve_keys[y]];
				local_return_obj[variables[i]] = local_value;
				
				temp_obj[variables[i]][all_local_keys[x]] = local_return_obj;
			}
			
			return_obj[variables[i]] = temp_obj[variables[i]];
		}
		
		//Save file
		FileManager.saveFileAsJSON(common_defines.output_file_paths.top_120_table, return_obj);
		
		//Return statement
		return return_obj;
	};
	
	/**
	 * getTopCityKeysForField() - Fetches the top city keys for a given field
	 * (i.e. 'area'/'density'/'population').
	 *
	 * @param {string} arg0_field
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.ghsl_only=false]
	 *  @param {boolean} [arg1_options.stadester_only=false]
	 *
	 *  @param {number} [arg1_options.outlier_threshold=1.5|3.5|2.5]
	 *  @param {"iqr"|"rcs"|"log"|"none"} [arg1_options.outlier_rule="rcs"]
	 *  @param {number} [arg1_options.threshold]
	 *
	 * @returns {{"<city_key>": number}}
	 */
	global.getTopCityKeysForField = function (arg0_field, arg1_options) {
		//Convert from parameters
		let field = arg0_field;
		let options = arg1_options || {};
		
		//Backward-compatibility shim for the old boolean flag
		if (options.iqr_removal === false) options.outlier_rule = "none";
		if (!options.outlier_rule) options.outlier_rule = "rcs";
		
		//Declare local instance variables
		let common_defines = config.defines.common;
		let ranked_obj = {};
		let return_obj = {};
		let stadester_ghsl_obj = FileManager.loadFileAsJSON(
			common_defines.output_file_paths.stadester_ghsl
		);
		
		//Iterate over all_cities in stadester_ghsl_obj; fetch max value by field
		let all_cities = Object.keys(stadester_ghsl_obj);
		for (let i = 0; i < all_cities.length; i++) {
			let local_city = stadester_ghsl_obj[all_cities[i]];
			let max_field_value = 0;
			
			//Internal GHSL only guard clause
			if (options.ghsl_only && !all_cities[i].startsWith("ghsl-")) continue;
			if (options.stadester_only && !all_cities[i].startsWith("stadester-")) continue;
			
			if (field !== "density") {
				if (local_city[field]) {
					let all_local_keys = Object.keys(local_city[field]);
					
					for (let x = 0; x < all_local_keys.length; x++)
						max_field_value = Math.max(
							max_field_value,
							local_city[field][all_local_keys[x]]
						);
				}
			} else {
				if (local_city.centre_density) {
					let all_local_keys = Object.keys(local_city.centre_density);
					
					for (let x = 0; x < all_local_keys.length; x++)
						max_field_value = Math.max(
							max_field_value,
							local_city.centre_density[all_local_keys[x]]
						);
				} else if (local_city.density) {
					let all_local_keys = Object.keys(local_city.density);
					
					for (let x = 0; x < all_local_keys.length; x++)
						max_field_value = Math.max(
							max_field_value,
							local_city.density[all_local_keys[x]]
						);
				}
			}
			
			ranked_obj[all_cities[i]] = max_field_value;
		}
		ranked_obj = sortObject(ranked_obj);
		
		//Outlier removal -----------------------------------------------------------
		if (options.outlier_rule !== "none") {
			let values = Object.values(ranked_obj).filter(v => v > 0).sort((a, b) => a - b);
			if (values.length) {
				let lower, upper;
				
				if (options.outlier_rule === "iqr") {
					let outlier_threshold = returnSafeNumber(options.outlier_threshold, 1.5);
					
					let q1 = values[Math.floor(values.length * 0.25)];
					let q3 = values[Math.floor(values.length * 0.75)];
					let iqr = q3 - q1;
					lower = q1 - outlier_threshold * iqr;
					upper = q3 + outlier_threshold * iqr;
				} else if (options.outlier_rule === "rcs") {
					let outlier_threshold = returnSafeNumber(options.outlier_threshold, 3.5);
					
					//Rousseeuw-Croux S-estimator: S = c × med_i{med_j|x_j - x_i|}
					let median = values[Math.floor(values.length / 2)];
					let medians_of_diffs = [];
					
					for (let i = 0; i < values.length; i++) {
						let diffs = values.map(xj => Math.abs(xj - values[i]));
						diffs.sort((a, b) => a - b);
						medians_of_diffs.push(diffs[Math.floor(diffs.length / 2)]);
					}
					
					medians_of_diffs.sort((a, b) => a - b);
					let S = medians_of_diffs[Math.floor(medians_of_diffs.length / 2)] * 1.1926;
					let zCut = outlier_threshold;
					lower = median - zCut * S;
					upper = median + zCut * S;
				} else if (options.outlier_rule === "log") {
					let outlier_threshold = returnSafeNumber(options.outlier_threshold, 2.5);
					
					//Log normalization approach: ln(x) - E[ln(x)] / sd[ln(x)] > threshold
					let log_values = values.map(v => Math.log(v));
					let log_mean = log_values.reduce((sum, v) => sum + v, 0) / log_values.length;
					let log_variance = log_values.reduce((sum, v) => sum + Math.pow(v - log_mean, 2), 0) / log_values.length;
					let log_std = Math.sqrt(log_variance);
					
					//Convert threshold back to original scale
					let log_lower = log_mean - outlier_threshold * log_std;
					let log_upper = log_mean + outlier_threshold * log_std;
					lower = Math.exp(log_lower);
					upper = Math.exp(log_upper);
				}
				
				let filtered = {};
				for (let key in ranked_obj) {
					let v = ranked_obj[key];
					if (v >= lower && v <= upper) filtered[key] = v;
				}
				ranked_obj = filtered;
			}
		}
		
		//Trim to threshold
		if (options.threshold) {
			let all_ranked_keys = Object.keys(ranked_obj);
			for (let i = 0; i < options.threshold; i++)
				if (ranked_obj[all_ranked_keys[i]])
					return_obj[all_ranked_keys[i]] = ranked_obj[all_ranked_keys[i]];
		}
		
		//Return statement
		return return_obj;
	};
}