config.population_density.processing = {
	baseline_density_per_ha: [175, 190], //Figures taken from Bairoch
		angel_density_change_per_decade: {
			"1810": -0.0036,
			"1820": 0.0001,
			"1830": -0.0003,
			"1840": -0.0009,
			"1850": 0.0057,
			"1860": 0.0025,
			"1870": 0.0045,
			"1880": 0.0029,
			"1890": -0.0016,
			"1900": -0.0084,
			"1910": -0.0098,
			"1920": -0.0154,
			"1930": -0.0138,
			"1940": -0.0052,
			"1950": -0.0059,
			"1960": -0.0127,
			"1969": -0.0084,
			"1980": -0.0083,
			"1990": -0.0103,
			"2000": -0.0096
		},
		angel_regions: {
		
		},
		clark_b_regions: {
			"1800": {
				no_regions: true //Defaults to default: function() in map
			},
			"1945": {
				anglo_settler: {
					colour: [175, 63, 76]
				},
				eu_and_east_asia: {
					colour: [47, 97, 170]
				},
				global_south: {
					colour: [214, 144, 83]
				},
				socialist_world: {
					colour: [20, 114, 30]
				}
			}
		},
		clark_equations: {
			"1800": {
				default: function (arg0_A, arg1_b, arg2_x) {
					//Convert from parameters
					var A = arg0_a;
					var b = arg1_b;
					var x = arg2_x;
					
					//Return statement
					return A*Math.exp(-b*x);
				}
			},
			"1945": {
				anglo_settler: function (arg0_A, arg1_b, arg2_x) {
					//Convert from parameters
					var A = arg0_a;
					var b = arg1_b;
					var x = arg2_x;
					
					//Return statement
					return x*Math.exp(-0.67*x);
				},
				eu_and_east_asia: function (arg0_A, arg1_b, arg2_x) {
					//Convert from parameters
					var A = arg0_a;
					var b = arg1_b;
					var x = arg2_x;
				
					//Return statement
					return A*(x + 0.5)*Math.exp(-b*x);
				},
				global_south: function (arg0_A, arg1_b, arg2_x) {
					//Convert from parameters
					var A = arg0_a;
					var b = arg1_b;
					var x = arg2_x;
					
					//Return statement
					return A*Math.exp(-b*x);
				},
				socialist_world: function (arg0_A, arg1_b, arg2_x) {
					//Convert from parameters
					var A = arg0_a;
					var b = arg1_b;
					var x = arg2_x;
					
					//Return statement
					return 1/(1 + Math.exp(4*(x - 1.8)));
				},
			}
		},
	baseline_year: 1800,
	cutoff_year: 1975, //GHSL kicks in here

	area_to_pop_growth_rate_ratio: 1.27 //From Angel
};