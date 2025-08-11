//Initialise functions
{
	//0. Declare internal helper functions
	function equirectangularDistance (arg0_coords, arg1_coords) {
		//Convert from parameters
		var coords = arg0_coords;
		var ot_coords = arg1_coords;
		
		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;
		var local_x = (ot_coords[1] - coords[1])
			*density_processing_obj.deg_to_radians
			*Math.cos(((coords[0] + ot_coords[1])/2)*density_processing_obj.deg_to_radians);
		var local_y = (ot_coords[1] - coords[0])*density_processing_obj.deg_to_radians;
		
		//Return statement
		return density_processing_obj.earth_radius*Math.sqrt(local_x*local_x + local_y*local_y);
	}
	
	function getPixelAreaAtLatitude (arg0_latitude) {
		//Convert from parameters
		var latitude = parseFloat(arg0_latitude);
		
		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;
		var latitude_radians = latitude*density_processing_obj.deg_to_radians;
		
		var dx = density_processing_obj.pixel_deg*density_processing_obj.deg_to_radians*density_processing_obj.earth_radius*Math.cos(latitude_radians);
		var dy = density_processing_obj.pixel_deg*density_processing_obj.deg_to_radians*density_processing_obj.earth_radius;
		
		//Return statement
		return Math.abs(dx*dy);
	}
	
	function getPixelFractionInRing (arg0_city_coords, arg1_pixel_coords, arg2_inner_radius, arg3_outer_radius) {
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
	}
	
	//1. Apply Clark/Modified Clark typologies to calculate imputed populations within gridcell radii
	function getPopulationByPixelRing (arg0_city_obj, arg1_raster_pixels, arg2_max_ring, arg3_year, arg4_options) { //[WIP] - Finish Clark variant selection
		//Convert from parameters
		var city_obj = arg0_city_obj;
		var raster_pixels = arg1_raster_pixels;
		var max_ring = arg2_max_ring;
		var year = parseInt(arg3_year);
		var options = (arg4_options) ? arg4_options : {};
		
		//Declare local instance variables
		var density_processing_obj = config.population_density.processing;
		var pixel_width_km = equirectangularDistance(city_obj.coords, [city_obj.coords[0], city_obj.coords[1] + density_processing_obj.pixel_deg]);
		var results = Array(max_ring).fill(0);
		
		//Iterate over all local_pixels in raster_pixels
		for (let local_pixel of raster_pixels) {
			//Distance from city centre to pixel centre
			let local_distance = equirectangularDistance(city_obj.coords, local_pixel);
			let local_ring = Math.floor(local_distance/pixel_width_km) + 1;
			
			if (local_ring < 1 || local_ring > max_ring) continue; //Internal guard clause for ring bounds
			
			//Annulus bounds for this ring
			let inner_radius = (local_ring - 1)*pixel_width_km;
			let outer_radius = local_ring*pixel_width_km;
			
			//Make sure a sizeable fraction of the ring is inside
			let fraction = getPixelFractionInRing(city_obj.coords, local_pixel, inner_radius, outer_radius);
			if (fraction == 0) continue; //Internal guard clause if there is no applicable area
			
			//Pixel area
			let pixel_area = getPixelAreaAtLatitude(local_pixel.coords[0]);
			
			//Select the correct Clark variant function
			
			//Add to the appropriate ring
			results[local_ring - 1] += fraction*pixel_area*pixel_density;
		}
		
		//Return statement
		return results;
	}
	
	function getRasterPixels (arg0_city_obj, arg1_max_distance_km) {
		//Convert from parameters
		var city_obj = arg0_city_obj;
		var max_distance_km = parseInt(arg1_max_distance_km);
		
		//Declare local instance variables
		var degree_per_km = 1/111.32; //Approximation of degrees per km
		var delta_deg = max_distance_km*degree_per_km;
		var density_processing_obj = config.population_density.processing;
		var pixels = [];
		
		//Iterate over all pixels in bounds
		for (let lat = city_obj.lat - delta_deg; lat <= city_obj.lat + delta_deg; lat += density_processing_obj.pixel_deg)
			for (let lng = city_obj.lng - delta_deg; lng <= city_obj.lng + delta_deg; lng += density_processing_obj.pixel_deg)
				pixels.push([lat, lng]);
		
		//Return statement
		return pixels;
	}
	
	//2. Use imputed populations within gridcell radii to buffer population by scaling rings to target over substrata
	
	//3. End process function
}