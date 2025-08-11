//Initialise functions
{
	//0. Declare internal helper functions
	global.equirectangularDistance = function (arg0_coords, arg1_coords) {
		//Convert from parameters
		var coords = arg0_coords;
		var ot_coords = arg1_coords;
		
		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;
		var local_x = (ot_coords[1] - coords[1])
			*density_processing_obj.deg_to_radians
			*Math.cos(((coords[0] + ot_coords[0])/2)*density_processing_obj.deg_to_radians);
		var local_y = (ot_coords[0] - coords[0])*density_processing_obj.deg_to_radians;
		
		//Return statement
		return density_processing_obj.earth_radius*Math.sqrt(local_x*local_x + local_y*local_y);
	};
	
	global.getPixelAreaAtLatitude = function (arg0_latitude) {
		//Convert from parameters
		var latitude = parseFloat(arg0_latitude);
		
		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;
		var latitude_radians = latitude*density_processing_obj.deg_to_radians;
		
		var dx = density_processing_obj.pixel_deg*density_processing_obj.deg_to_radians*density_processing_obj.earth_radius*Math.cos(latitude_radians);
		var dy = density_processing_obj.pixel_deg*density_processing_obj.deg_to_radians*density_processing_obj.earth_radius;
		
		//Return statement
		return Math.abs(dx*dy);
	};
	
	global.getPixelFractionInRing = function (arg0_city_coords, arg1_pixel_coords, arg2_inner_radius, arg3_outer_radius) {
		//Convert from parameters
		var city_coords = arg0_city_coords;
		var pixel_coords = arg1_pixel_coords;
		var inner_radius = arg2_inner_radius;
		var outer_radius = arg3_outer_radius;
		
		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;
		var half = density_processing_obj.pixel_deg/2;
		var inside = 0;
		var subsamples = 10;
		var total = 0;
		
		//Iterate over subsamples
		for (let i = 0; i < subsamples; i++)
			for (let x = 0; x < subsamples; x++) {
				let d_lat = (i + 0.5)/subsamples*density_processing_obj.pixel_deg - half;
				let d_lng = (x + 0.5)/subsamples*density_processing_obj.pixel_deg - half;
				let sub_lat = pixel_coords[0] + d_lat;
				let sub_lng = pixel_coords[1] + d_lng;
				
				let distance = equirectangularDistance(city_coords, [sub_lat, sub_lng]);
				
				if (distance >= inner_radius && distance < outer_radius) inside++;
				total++;
			}
		
		//Return statement
		return inside/total;
	};
	
	//1. Apply Clark/Modified Clark typologies to calculate imputed populations within gridcell radii
	
	/**
	 * Returns a zero-indexed {@link Array}<{@link number}> of population figures living in concentric pixel rings; scaled to the city's overall population for that year.
	 *
	 * @param {Object} arg0_city_obj
	 * @param {number} arg1_year
	 * @param {Object} [arg2_options]
	 *  @param {Object} [arg2_options.walkability_ratio_obj]
	 */
	global.getCityPopulationByPixelRing = function (arg0_city_obj, arg1_year, arg2_options) {
		//Convert from parameters
		var city_obj = arg0_city_obj;
		var year = parseInt(arg1_year);
		var options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		if (!options.walkability_ratio_obj) options.walkability_ratio_obj = getWalkabilityRatioObject();
		
		//Declare local instance variables
		var A = returnSafeNumber(city_obj.centre_density[year])*100; //p/ha
		var area = city_obj.area[year];
		var b = options.walkability_ratio_obj[city_obj.angel_region].walkability_ratio[year];
		var density_processing_obj = config.population_density.processing;
		var population = city_obj.population[year];
		
		if (population == undefined) return []; //Internal guard clause if .population is not defined
		
		var max_distance_km = Math.sqrt(area/Math.PI);
		var pixel_width_km = equirectangularDistance(city_obj.coords, [
			city_obj.coords[0], city_obj.coords[1] + density_processing_obj.pixel_deg
		]);
		var raster_pixels = getRasterPixels(city_obj, max_distance_km);
		
		var max_ring = Math.ceil(max_distance_km/pixel_width_km);
		
		//Get raw Clark-modelled population by ring
		var ring_populations = getPopulationByPixelRing(city_obj, raster_pixels, max_ring, year, { A: A, b: b });
		
		var raw_total_population = ring_populations.reduce((a, b) => a + b, 0);
		var scalar = (raw_total_population > 0) ? (population/raw_total_population) : 0;
		var scaled_ring_populations = ring_populations.map(function (local_population) {
			//Return statement
			return Math.round(local_population*scalar);
		});
		
		//Return statement
		return scaled_ring_populations;
	};
	
	/**
	 * Helper function for {@link getCityPopulationByPixelRing}().
	 *
	 * @param {Object} arg0_city_obj
	 * @param {Array<Array<number, number>>} arg1_raster_pixels
	 * @param {number} arg2_max_ring
	 * @param {number} arg3_year
	 * @param {Object} [arg4_options]
	 *  @param {number} [arg4_options.A] - imputed persons_per_ha from rank ordinal of actual density; (.centre_density)
	 *  @param {number} [arg4_options.b] - walkability ratio, Angel 2012, interpolated (.walkability_ratio)
	 *
	 * @returns {Array<number>}
	 */
	global.getPopulationByPixelRing = function (arg0_city_obj, arg1_raster_pixels, arg2_max_ring, arg3_year, arg4_options) {
		//Convert from parameters
		var city_obj = arg0_city_obj;
		var raster_pixels = arg1_raster_pixels;
		var max_ring = arg2_max_ring;
		var year = parseInt(arg3_year);
		var options = (arg4_options) ? arg4_options : {};
		
		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;
		
		var all_clark_keys = Object.keys(density_processing_obj.clark_equations);
		var clark_baseline_obj = density_processing_obj.clark_equations[all_clark_keys[0]];
		var clark_post_baseline_obj = density_processing_obj.clark_equations[all_clark_keys[all_clark_keys.length - 1]];
		var pixel_width_km = equirectangularDistance(city_obj.coords, [city_obj.coords[0], city_obj.coords[1] + density_processing_obj.pixel_deg]);
		var results = Array(max_ring).fill(0);
		
		//Iterate over all local_pixels in raster_pixels
		for (let local_pixel of raster_pixels) {
			//Distance from city centre to pixel centre
			let local_distance = equirectangularDistance(city_obj.coords, local_pixel);
			let local_ring = Math.floor(local_distance/pixel_width_km);
			
			if (local_ring < 0 || local_ring >= max_ring) continue; //Internal guard clause for ring bounds
			
			//Annulus bounds for this ring
			let inner_radius = local_ring*pixel_width_km;
			let outer_radius = (local_ring + 1)*pixel_width_km;
			
			//Make sure a sizeable fraction of the ring is inside
			let fraction = getPixelFractionInRing(city_obj.coords, local_pixel, inner_radius, outer_radius);
			if (fraction == 0) continue; //Internal guard clause if there is no applicable area
			
			//Pixel area
			let clark_function;
			let pixel_area = getPixelAreaAtLatitude(local_pixel[0]);
			let pixel_density;
			
			//Select the correct Clark variant function
			if (year >= parseInt(all_clark_keys[all_clark_keys.length - 1])) {
				try {
					if (clark_post_baseline_obj[city_obj.clark_region])
						pixel_density = clark_post_baseline_obj[city_obj.clark_region]({
							...options,
							x: local_distance
						});
				} catch (e) {
					console.log(all_clark_keys, clark_post_baseline_obj);
					console.error(e);
				}
			} else {
				pixel_density = clark_baseline_obj.default({
					...options,
					x: local_distance
				});
			}
			
			//Add to the appropriate ring
			results[local_ring] += fraction*pixel_area*pixel_density;
		}
		
		//Return statement
		return results;
	};
	
	global.getRasterPixels = function (arg0_city_obj, arg1_max_distance_km) {
		//Convert from parameters
		var city_obj = arg0_city_obj;
		var max_distance_km = parseFloat(arg1_max_distance_km);
		
		//Declare local instance variables
		var degree_per_km = 1/111.32; //Approximation of degrees per km
		var delta_deg = max_distance_km*degree_per_km;
		var density_processing_obj = config.population_density.processing;
		var pixels = [];
		
		//Iterate over all pixels in bounds
		for (let lat = city_obj.coords[0] - delta_deg; lat <= city_obj.coords[0] + delta_deg; lat += density_processing_obj.pixel_deg)
			for (let lng = city_obj.coords[1] - delta_deg; lng <= city_obj.coords[1] + delta_deg; lng += density_processing_obj.pixel_deg)
				pixels.push([lat, lng]);
		
		//Return statement
		return pixels;
	};
	
	//2. End process function
	global.processDensityRings = function (arg0_stadester_obj) { //[WIP] - Finish function body
	
	};
}