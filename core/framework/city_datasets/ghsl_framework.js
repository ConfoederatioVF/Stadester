//Initalise functions
{
	global.generateGHSLUrbanAreaRasters = async function () {
		//Declare local instance variables
		var ghsl_config_obj = config.ghsl.processing;

		//Iterate over all ghsl_config_obj.years
		for (var i = 0; i < ghsl_config_obj.years.length; i++) {
			var log_processing_string = `- Processing GHSL urban area rasters for ${ghsl_config_obj.years[i]} ..`;

			console.time(log_processing_string);
			await generateGHSLUrbanAreaRaster(ghsl_config_obj.years[i]);
			console.timeEnd(log_processing_string);
		}
	};

	global.generateGHSLUrbanAreaRaster = async function (arg0_year) {
		//Convert from parameters
		var year = returnSafeNumber(arg0_year);

		//Declare local instance variables
		var common_defines = config.defines.common;
		var input_file_path = `${common_defines.input_file_paths.ghsl_folder}${common_defines.input_file_paths.ghsl_urban_areas_prefix}${year}.geojson`;
		var output_file_path = `${common_defines.output_file_paths.ghsl_urban_areas_folder}${common_defines.output_file_paths.ghsl_urban_areas_prefix}${year}.png`

		//Return statement
		return GHSLGeoJSONToRaster(input_file_path, output_file_path);
	};
	
	/**
	 * Generates a GHSL population raster for a specific year.
	 * @param arg0_year
	 * @param {Object} [arg1_options]
	 *  @param {Object} [arg1_options.ghsl_obj=getGHSLObject()]
	 */
	global.generateGHSLPopulationRaster = function (arg0_year, arg1_options) {
		//Convert from parameters
		var year = returnSafeNumber(arg0_year);
		var options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.ghsl_obj) options.ghsl_obj = getGHSLObject();
		
		//Declare local instance variables
		var common_defines = config.defines.common;
		var ghsl_years = config.ghsl.processing.years;
		var output_file_path = `${common_defines.output_file_paths.ghsl_urban_folder}${common_defines.output_file_paths.ghsl_urban_prefix}${year}.png`;
		
		var area_year = ghsl_years[0];
		
		//Iterate over all ghsl_years to find the base year
		for (let i = 0; i < ghsl_years.length; i++)
			if (ghsl_years[i] <= year) {
				area_year = ghsl_years[i];
			} else { break; }
		
		var ghsl_colourmap_file_path = `${common_defines.input_file_paths.ghsl_urban_areas_folder}${common_defines.input_file_paths.ghsl_urban_areas_prefix}${area_year}${common_defines.input_file_paths.ghsl_urban_areas_suffix}`;
		var ghsl_colourmap_raster = loadImage(ghsl_colourmap_file_path);
		var ghsl_dictionary = {};
		var ghsl_pop_file_path = `${common_defines.input_file_paths.ghsl_population_folder}/${common_defines.input_file_paths.ghsl_population_prefix}${year}${common_defines.input_file_paths.ghsl_population_suffix}`;
		var ghsl_pop_raster = loadNumberRasterImage(ghsl_pop_file_path);
		var raster_scalars = {};
		var raster_sums = {};
		
		//Populate ghsl_dictionary - maps RGBA colours to city objects
		var all_ghsl_keys = Object.keys(options.ghsl_obj);
		
		for (let i = 0; i < all_ghsl_keys.length; i++) {
			let local_city = options.ghsl_obj[all_ghsl_keys[i]];
			let local_colour = encodeNumberAsRGBA(local_city.id);
			
			ghsl_dictionary[local_colour.join(",")] = local_city;
		}
		
		//Operate over the current ghsl_pop_raster, and fetch raster_scalars for each city
		operateNumberRasterImage({
			file_path: ghsl_pop_file_path,
			function: function (arg0_index, arg1_number) {
				//Convert from parameters
				var index = arg0_index;
				var number = arg1_number;
				
				//Declare local instance variables
				var local_city = ghsl_dictionary[[
					ghsl_colourmap_raster.data[index],
					ghsl_colourmap_raster.data[index + 1],
					ghsl_colourmap_raster.data[index + 2],
					ghsl_colourmap_raster.data[index + 3]
				].join(",")];
				
				if (local_city)
					modifyValue(raster_sums, local_city.key, number);
			}
		});
		
		//Iterate over all_raster_sums; Populate raster_scalars object
		var all_raster_sums = Object.keys(raster_sums);
		
		for (let i = 0; i < all_raster_sums.length; i++) {
			let local_city = options.ghsl_obj[all_raster_sums[i]];
			let local_value = raster_sums[all_raster_sums[i]];
			
			//Internal guard clause if local_city does not exist for the present year
			if (!local_city) continue;
			
			//Check local_city.population at the time
			let local_population = local_city.population[year];
			let local_scalar = 1;
			
			if (local_population != undefined)
				local_scalar = local_population/local_value;
			raster_scalars[encodeNumberAsRGBA(local_city.id).join(",")] = local_scalar;
		}
		
		//Save scaled raster from ghsl_pop_raster, mask only defined urban areas
		saveNumberRasterImage({
			file_path: output_file_path,
			height: 2160,
			width: 4320,
			
			function: function (arg0_index) {
				//Convert from parameters
				var index = arg0_index;
				
				//Declare local instance variables
				var byte_index = arg0_index*4; //Index must be multiplied by 4 since we are using loadImage(), and not loadNumberRasterImage()
				var local_colour = [
					ghsl_colourmap_raster.data[byte_index],
					ghsl_colourmap_raster.data[byte_index + 1],
					ghsl_colourmap_raster.data[byte_index + 2],
					ghsl_colourmap_raster.data[byte_index + 3]
				].join(",");
				var local_scalar = raster_scalars[local_colour];
				var local_value = ghsl_pop_raster.data[index];
				
				if (local_scalar != undefined) {
					//Return statement
					return local_value*local_scalar;
				} else {
					//Return statement
					if (local_colour == "0,0,0,0")
						return 0;
				}
			}
		});
		console.log(`- Generated GHSL raster for ${year}, saved in ${output_file_path}.`);
	};
	
	global.generateGHSLPopulationRasters = function () {
		//Declare local instance variables
		var common_defines = config.defines.common;
		var ghsl_obj = getGHSLObject();
		var ghsl_years = config.ghsl.processing.years;
		
		var ghsl_domain = [ghsl_years[0], ghsl_years[ghsl_years.length - 1]];
		
		//Iterate over all years in ghsl_domain
		for (let i = ghsl_domain[0]; i <= ghsl_domain[1]; i++)
			generateGHSLPopulationRaster(i, { ghsl_obj: ghsl_obj });
	};
	
	global.getGHSLObject = function () {
		//Declare local instance variables
		var common_defines = config.defines.common;
		var ghsl_csv = FileManager.loadCSVAsJSON(common_defines.input_file_paths.ghsl_csv);
		var ghsl_years = config.ghsl.processing.years;
		var return_obj = {};
		
		//Iterate over all_ghsl_keys in ghsl_csv
		var all_ghsl_keys = Object.keys(ghsl_csv);
		var ghsl_dictionary = {
			area: `MT_UCA_KM2_`,
			density: `MT_POP_DEN_`,
			population: `MT_POP_TOT_`
		};
		
		var all_ghsl_dictionary_keys = Object.keys(ghsl_dictionary);
		
		for (let i = 0; i < all_ghsl_keys.length; i++) try {
			let local_city = ghsl_csv[all_ghsl_keys[i]];
			let local_key = `${local_city.GC_UCN_LIS_2025[0]}-${local_city.GC_CNT_GAD_2025[0]}`;
			
			return_obj[local_key] = {
				id: parseInt(all_ghsl_keys[i]),
				key: local_key,
				
				name: local_city.GC_UCN_LIS_2025[0]
			};
			let actual_city = return_obj[local_key];
			
			//Iterate over ghsl_dictionary and assign keys based on them
			for (let x = 0; x < all_ghsl_dictionary_keys.length; x++) {
				actual_city[all_ghsl_dictionary_keys[x]] = {};
				let local_obj = actual_city[all_ghsl_dictionary_keys[x]];
				let local_prefix = ghsl_dictionary[all_ghsl_dictionary_keys[x]];
				let local_years = [];
				
				//Iterate over all ghsl_years
				for (let y = 0; y < ghsl_years.length; y++) {
					let local_value = local_city[`${local_prefix}${ghsl_years[y]}`];
					
					if (local_value && local_value != "") {
						local_obj[ghsl_years[y]] = parseEuropeanNumber(local_value[0]);
						local_years.push(ghsl_years[y]);
					}
				}
				
				//Perform cubic spline interpolation over all values
				let all_local_years = [];
				let local_domain = [local_years[0], local_years[local_years.length - 1]];
				
				//Fill all_local_years
				for (let y = local_domain[0]; y < local_domain[1]; y++)
					all_local_years.push(y);
				
				//Cubic spline interpolate local_obj if possible
				if (local_obj && Object.keys(local_obj).length > 2)
					local_obj = cubicSplineInterpolationObject(local_obj, { years: all_local_years });
			}
		} catch (e) {
			console.error(ghsl_csv[all_ghsl_keys[i]], e);
		}
		
		//Return statement
		return return_obj;
	};
	
	/**
	 * Scales all GHSL population rasters to global population, in addition to linearly interpolating GHSL at a 1-year step between its default 5-year interval rasters.
	 */
	global.scaleGHSLPopulationRastersToGlobalPopulation = function () {
		//Declare local instance variables
		var common_defines = config.defines.common;
		var ghsl_years = config.ghsl.processing.years;
		var world_population_obj = getWorldPopulationObject();
		
		var ghsl_domain = [ghsl_years[0], ghsl_years[ghsl_years.length - 1]];
		var ghsl_rasters = {};
		
		//Iterate over all ghsl_years and load ghsl_rasters
		for (let i = 0; i < ghsl_years.length; i++) {
			let local_ghsl_pop_file_path =`${common_defines.input_file_paths.ghsl_population_folder}/${common_defines.input_file_paths.ghsl_population_prefix}${ghsl_years[i]}${common_defines.input_file_paths.ghsl_population_suffix}`;
			
			ghsl_rasters[ghsl_years[i]] = loadNumberRasterImage(local_ghsl_pop_file_path);
		}
		
		//Iterate over all years in ghsl_domain and scale rasters
		for (let i = ghsl_domain[0]; i <= ghsl_domain[1]; i++) {
			let local_ghsl_raster;
			let local_output_path = `${common_defines.input_file_paths.ghsl_population_folder}/${common_defines.input_file_paths.ghsl_population_prefix}${i}${common_defines.input_file_paths.ghsl_population_suffix}`;
			
			//Iterate over ghsl_years; find closest local_ghsl_raster
			for (let x = 0; x < ghsl_years.length; x++)
				if (ghsl_years[x] <= i) {
					local_ghsl_raster = ghsl_rasters[ghsl_years[x]];
				} else { break; }
			
			//Get local_scalar; scale end raster image to
			let current_population = getImageSum(local_ghsl_raster);
			let local_scalar = world_population_obj[i]/current_population;
			
			saveNumberRasterImage({
				file_path: local_output_path,
				height: 2160,
				width: 4320,
				
				function: function (arg0_index) {
					//Convert from parameters
					var local_index = arg0_index;
					
					//Return statement
					return Math.round(local_ghsl_raster.data[local_index]*local_scalar);
				}
			});
			console.log(`- Saved ${local_output_path}, scalar = ${local_scalar}, adjusting old population ${parseNumber(current_population)} to ${parseNumber(world_population_obj[i])}.`);
		}
	};
}