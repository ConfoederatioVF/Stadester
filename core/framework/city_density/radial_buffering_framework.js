//Initialise functions
{
	global.cacheRadialBuffers = function () { //[WIP] - Finish function body
		//Declare local instance variables
		var input_file_path = config.defines.common.input_file_paths.stadester_areas;
		var stadester_obj = JSON.parse(fs.readFileSync(input_file_path, "utf8"));
		
		//Iterate over all_cities and check if .area would be large enough at latitude to cover multiple gridcells. If not, skip it
		var all_cities = Object.keys(stadester_obj);
		
		
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