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
	function getPopulationByPixelRing (arg0_city_obj, arg1_raster_pixels, arg2_max_ring) {
		//Convert from parameters
		var city_obj = arg0_city_obj;
		var raster_pixels = arg1_raster_pixels;
		var max_ring = arg2_max_ring;
		
		//Declare local instance variables
	}
	
	function getRasterPixels (arg0_city_obj, arg1_max_distance_km) {
	
	}
	
	//2. Use imputed populations within gridcell radii to buffer population by scaling rings to target over substrata
	
	//3. End process function
}