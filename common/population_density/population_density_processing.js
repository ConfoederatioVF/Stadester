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
			east_asia: {
				colour: [214, 144, 83],
				cities: {
					bangkok: {
						"1800": 1.5,
						"1900": 1.6,
						"1922": 1.7,
						"1953": 1.5,
						"1988": 2.0
					},
					beijing: {
						"1800": 1.5,
						"1900": 1.4,
						"1929": 1.6,
						"1959": 1.7,
						"1988": 1.8
					},
					kolkata: {
						"1800": 1.4,
						"1883": 1.7,
						"1931": 1.8,
						"1961": 1.6,
						"1990": 1.7
					},
					manila: {
						"1800": 1.4,
						"1898": 1.5,
						"1945": 1.7,
						"1971": 1.6,
						"1990": 1.7
					},
					mumbai: {
						"1800": 1.5,
						"1902": 1.6,
						"1931": 1.5,
						"1968": 1.5,
						"1991": 1.8
					},
					shanghai: {
						"1800": 1.4,
						"1902": 1.5,
						"1944": 1.4,
						"1973": 1.8,
						"1991": 1.7
					}
				}
			},
			eu_and_japan: {
				colour: [47, 97, 170],
				cities: {
					london: {
						"1800": 1.6,
						"1880": 1.9,
						"1929": 1.6,
						"1955": 1.7,
						"1989": 1.7
					},
					moscow: {
						"1800": 1.7,
						"1893": 1.6,
						"1939": 1.6,
						"1957": 1.6,
						"1991": 2.1
					},
					paris: {
						"1800": 1.5,
						"1900": 1.6,
						"1928": 1.6,
						"1956": 1.8,
						"1987": 1.6
					},
					tokyo: {
						"1800": 1.4,
						"1892": 1.4,
						"1929": 1.5,
						"1954": 1.6,
						"1990": 1.4
					},
					warsaw: {
						"1800": 1.6,
						"1888": 1.6,
						"1936": 1.6,
						"1958": 1.5,
						"1992": 1.6
					}
				}
			},
			mena: {
				colour: [239, 188, 112],
				cities: {
					algiers: {
						"1800": 1.4,
						"1903": 1.6,
						"1929": 1.9,
						"1972": 1.7,
						"1987": 1.7
					},
					cairo: {
						"1800": 1.5,
						"1897": 1.6,
						"1927": 1.6,
						"1960": 1.6,
						"1992": 1.7
					},
					istanbul: {
						"1800": 1.6,
						"1899": 1.8,
						"1934": 1.8,
						"1960": 1.7,
						"1990": 2.0
					},
					jeddah: {
						"1800": 1.9,
						"1900": 1.7,
						"1925": 1.5,
						"1964": 1.6,
						"1990": 1.7
					},
					kuwait: {
						"1800": 1.6,
						"1900": 2.1,
						"1922": 1.8,
						"1963": 2.0,
						"1990": 2.1
					},
					tehran: {
						"1800": 1.5,
						"1849": 1.4,
						"1925": 1.5,
						"1956": 1.5,
						"1991": 1.9
					},
					tel_aviv: {
						"1800": 1.4,
						"1917": 1.4,
						"1929": 1.5,
						"1956": 1.6,
						"1987": 2.0
					}
				}
			},
			latin_america: {
				colour: [186, 80, 80],
				cities: {
					buenos_aires: {
						"1800": 1.3,
						"1887": 1.4,
						"1918": 1.4,
						"1964": 1.5,
						"1989": 1.6
					},
					guatemala: {
						"1800": 1.5,
						"1900": 1.4,
						"1936": 1.6,
						"1976": 1.7,
						"1990": 1.9
					},
					mexico: {
						"1800": 1.4,
						"1886": 1.4,
						"1929": 1.5,
						"1970": 1.7,
						"1990": 1.7
					},
					santiago: {
						"1800": 1.4,
						"1900": 1.5,
						"1930": 1.5,
						"1970": 1.7,
						"1990": 2.0
					},
					sao_paulo: {
						"1800": 1.5,
						"1905": 1.6,
						"1929": 1.7,
						"1974": 1.7,
						"1988": 1.7
					}
				}
			},
			lrdc: {
				colour: [20, 114, 30],
				cities: {
					chicago: {
						"1800": 1.5,
						"1893": 1.5,
						"1945": 1.6,
						"1967": 1.6,
						"1989": 1.7
					},
					los_angeles: {
						"1800": 1.7,
						"1907": 1.4,
						"1937": 1.7,
						"1970": 1.8,
						"1990": 2.0
					},
					sydney: {
						"1800": 1.5,
						"1895": 1.7,
						"1945": 1.8,
						"1975": 1.7,
						"1991": 1.8
					}
				}
			},
			sub_saharan_africa: {
				colour: [47, 114, 142],
				cities: {
					accra: {
						"1800": 1.6,
						"1903": 1.6,
						"1929": 1.8,
						"1956": 1.5,
						"1991": 1.7
					},
					johannesburg: {
						"1800": 1.5,
						"1900": 1.7,
						"1938": 1.6,
						"1957": 1.7,
						"1990": 2.3
					},
					lagos: {
						"1800": 1.4,
						"1900": 1.6,
						"1920": 1.6,
						"1962": 1.8,
						"1984": 1.8
					},
					nairobi: {
						"1800": 2.0,
						"1906": 1.6,
						"1926": 1.5,
						"1964": 1.5,
						"1988": 1.6
					}
				}
			}
		},
		clark_b_regions: {
			"1800": { //Baseline
				no_regions: true //Defaults to default: function() in map
			},
			"1945": { //Clark variants after 1945
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
	
		//Clark annular equations for integrating radii
		clark_annular_equations: { //[WIP] - Do integration on Clark functions first
			//[WIP] - Refactor to use options object
			"1800": {
				default: function (arg0_A, arg1_b, arg2_inner_radius_distance, arg3_outer_radius_distance) {
					//Convert from parameters
					var A = arg0_A*100;
					var b = arg1_b;
					var inner_radius_distance = arg2_inner_radius_distance;
					var outer_radius_distance = arg3_outer_radius_distance;
					
					//Declare local instance variables
					var two_pi = 2*Math.PI;
					
					//Internal helper function, integrated annulus
					function F (arg0_r) {
						//Convert from parameters
						var r = arg0_r;
						
						//Return statement
						return (-r*Math.exp(-b*r)/b) - (Math.exp(-b*r)/(b*b));
					}
					
					//Return statement
					return two_pi*A*(F(outer_radius_distance) - F(inner_radius_distance));
				}
			},
			"1945": {
				anglo_settler: function (arg0_inner_radius_distance, arg1_outer_radius_distance) {
					//Convert from parameters
					var inner_radius_distance = arg0_inner_radius_distance;
					var outer_radius_distance = arg1_outer_radius_distance;
					
					//Declare local instance variables
					var a = 0.67;
					var two_pi = 2*Math.PI;
					
					//Internal helper function, integrated annulus
					function F (arg0_r) {
						//Convert from parameters
						var r = arg0_r;
						
						//Return statement
						return (
							(Math.exp(-a*r)*
								(-(a*a*r*r + 2*a*r + 2))/
									Math.pow(a, 3)
							)
						);
					}
					
					//Return statement
					return two_pi*(F(outer_radius_distance) - F(inner_radius_distance));
				},
				eu_and_east_asia: function (arg0_A, arg1_b, arg2_inner_radius_distance, arg3_outer_radius_distance) {
					//Convert from parameters
					var A = arg0_A*100;
					var b = arg1_b;
					var inner_radius_distance = arg2_inner_radius_distance;
					var outer_radius_distance = arg3_outer_radius_distance;
					
					//Declare local instance variables
					var two_pi_a = 2*Math.PI*A;
					
					//Internal helper functions, integrated annulus
					function F1 (arg0_r) {
						//Convert from parameters
						var r = arg0_r;
						
						//Return statement
						return (
							Math.exp(-b*r)*
								(-(b*b*r*r + 2*b*r + 2))/
									Math.pow(b, 3)
						);
					}
					function F2 (arg0_r) {
						//Convert from parameters
						var r = arg0_r;
						
						//Return statement
						return (
							-r*Math.exp(-b*r)/b -
								Math.exp(-b*r)/(b*b)
						);
					}
					
					//Return statement
					return two_pi_a*(
						(F1(outer_radius_distance) - F1(inner_radius_distance)) + 0.5*(F2(outer_radius_distance) - F2(inner_radius_distance))
					);
				},
				global_south: function (arg0_A, arg1_b, arg2_inner_radius_distance, arg3_outer_radius_distance) {
					//Convert from parameters
					var A = arg0_A*100;
					var b = arg1_b;
					var inner_radius_distance = arg2_inner_radius_distance;
					var outer_radius_distance = arg3_outer_radius_distance;
					
					//Declare local instance variables
					var two_pi = 2*Math.PI;
					
					//Internal helper function, integrated annulus
					function F (arg0_r) {
						//Convert from parameters
						var r = arg0_r;
						
						//Return statement
						return (-r*Math.exp(-b*r)/b) - (Math.exp(-b*r)/(b*b));
					}
					
					//Return statement
					return two_pi*A*(F(outer_radius_distance) - F(inner_radius_distance));
				},
				socialist_world: function (arg0_inner_radius_distance, arg1_outer_radius_distance) {
					//Convert from parameters
					var inner_radius_distance = arg0_inner_radius_distance;
					var outer_radius_distance = arg1_outer_radius_distance;
					
					//Declare local instance variables
					var n = 100; //100 iterations for approximating the integral trapezoidally
					
					var h = (outer_radius_distance - inner_radius_distance)/n;
					var sum = 0.5*(
						inner_radius_distance/(1 + Math.exp(4*(inner_radius_distance - 1.8))) +
						outer_radius_distance/(1 + Math.exp(4*(outer_radius_distance - 1.8)))
					);
					var two_pi = 2*Math.PI;
					
					//Iterate over n and trapezoidally integrate
					for (let i = 1; i < n; i++) {
						let r = inner_radius_distance + i*h;
						
						sum += r/(1 + Math.exp(4*(r - 1.8)));
					}
					
					//Return statement
					return two_pi*sum*h;
				}
			}
		},
	
		//Legacy encoded Clark equations
		clark_equations: {
			"1800": {
				default: function (arg0_A, arg1_b, arg2_x) {
					//Convert from parameters
					var A = arg0_a*100;
					var b = arg1_b;
					var x = arg2_x;
					
					//Return statement
					return A*Math.exp(-b*x);
				}
			},
			"1945": {
				anglo_settler: function (arg0_A, arg1_b, arg2_x) {
					//Convert from parameters
					var A = arg0_a*100;
					var b = arg1_b;
					var x = arg2_x;
					
					//Return statement
					return x*Math.exp(-0.67*x);
				},
				eu_and_east_asia: function (arg0_A, arg1_b, arg2_x) {
					//Convert from parameters
					var A = arg0_a*100;
					var b = arg1_b;
					var x = arg2_x;
				
					//Return statement
					return A*(x + 0.5)*Math.exp(-b*x);
				},
				global_south: function (arg0_A, arg1_b, arg2_x) {
					//Convert from parameters
					var A = arg0_a*100;
					var b = arg1_b;
					var x = arg2_x;
					
					//Return statement
					return A*Math.exp(-b*x);
				},
				socialist_world: function (arg0_A, arg1_b, arg2_x) {
					//Convert from parameters
					var A = arg0_a*100;
					var b = arg1_b;
					var x = arg2_x;
					
					//Return statement
					return 1/(1 + Math.exp(4*(x - 1.8)));
				},
			}
		},
	baseline_year: 1800,
	cutoff_year: 1975, //GHSL kicks in here
	deg_to_radians: Math.PI/180,
	earth_radius: 6371,
	end_year: 2000, //Simulated end-year
	pixel_deg: 5/60, //5-arcmin in degrees

	area_to_pop_growth_rate_ratio: 1.27 //From Angel
};