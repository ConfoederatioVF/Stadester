config.population_density.processing = {
	baseline_density_per_ha: [175, 190], //Figures taken from Bairoch
		angel_density_change_per_decade: {
			"1809": -0.0036,
			"1820": 0.0001,
			"1830": -0.0003,
			"1840": -0.0009,
			"1850": 0.0057,
			"1860": 0.0025,
			"1869": 0.0045,
			"1879": 0.0029,
			"1890": -0.0016,
			"1900": -0.0084,
			"1910": -0.0098,
			"1920": -0.0154,
			"1930": -0.0138,
			"1939": -0.0052,
			"1950": -0.0059,
			"1960": -0.0127,
			"1969": -0.0084,
			"1980": -0.0083,
			"1990": -0.0103,
			"2000": -0.0096
		},
	baseline_year: 1800,
	cutoff_year: 1975, //GHSL kicks in here

	area_to_pop_growth_rate_ratio: 1.27 //From Angel
};