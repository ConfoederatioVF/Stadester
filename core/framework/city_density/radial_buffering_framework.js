//Initialise functions
{
	global.cacheRadialBuffers = function () {
		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;
		var input_file_path = config.defines.common.input_file_paths.stadester_areas;
		var output_file_path = config.defines.common.input_file_paths.stadester_output;
		var stadester_obj = JSON.parse(fs.readFileSync(input_file_path, "utf8"));
		var walkability_ratio_obj = getWalkabilityRatioObject();
		
		//Iterate over all_cities and check if .area would be large enough at latitude to cover multiple gridcells. If not, skip it
		var all_cities = Object.keys(stadester_obj);
		
		for (let i = 0; i < all_cities.length; i++) {
			let local_city = stadester_obj[all_cities[i]];
			
			//Check to see if computing radial buffers are possible
			if (local_city.area && local_city.coords) {
				let all_area_keys = Object.keys(local_city.area).map(Number)
				.sort((a, b) => a - b);
				let time_domain = [all_area_keys[0], all_area_keys[all_area_keys.length - 1]];
				
				for (let x = time_domain[0]; x < time_domain[1]; x++)
					if (x >= density_processing_obj.baseline_year && x <= density_processing_obj.end_year)
						if (local_city.population[x]) {
							//Check if .area is large enough at latitude to be greater than 1 gridcell in size
							let pixel_size = Math.ceil(local_city.area[x]/getPixelAreaAtLatitude(local_city.coords[0]));
							
							if (pixel_size > 1) {
								try {
									if (!local_city.radial_buffers) local_city.radial_buffers = {};
									local_city.radial_buffers[x] = getCityPopulationByPixelRing(local_city, x, {
										walkability_ratio_obj: walkability_ratio_obj
									});
									
									//Make sure NaN's don't appear
									if (isNaN(local_city.radial_buffers[x][0])) {
										local_city.radial_buffers[x] = [returnSafeNumber(local_city.population[x])];
										continue;
									}
									
									console.log(`- Produced radial buffers for ${local_city.name} (${i}/${all_cities.length}) for ${x}:`, local_city.radial_buffers, ` | Pixel size: ${pixel_size}, Pixel size at latitude: ${getPixelAreaAtLatitude(local_city.coords[0])}, Actual area: ${local_city.area[x]}`);
								} catch (e) {
									console.error(`Error for ${local_city.name}:`, e);
								}
							} else {
								if (!local_city.radial_buffers) local_city.radial_buffers = {};
								local_city.radial_buffers[x] = [local_city.population[x]];
							}
						}
			}
		}
		
		console.log(`Saved radially-buffered Stadestér dump.`);
		FileManager.saveFileAsJSON(output_file_path, stadester_obj);
	};
	
	global.getCoordsPixel = function (arg0_coords) {
		//Convert from parameters
		var coords = arg0_coords;
		
		//Declare local instance variables
		var lat = coords[0];
		var lng = coords[1];
		
		lat = Math.max(-90, Math.min(90, lat));
		lng = ((lng + 180) % 360 + 360) % 360 - 180; // Wrap longitude to [-180, 180]
		
		const x = ((lng + 180) / 360) * 4320;
		const y = (1 - (lat + 90) / 180) * 2160;
		
		// Optionally round to nearest integer pixel
		return [Math.round(x), Math.round(y)];
	};
	
	//2. Use imputed populations within gridcell radii to buffer population by scaling rings to target over substrata
	
	//3. End process function
}