config.velkscala.northern_america = {
	areal_masks: {
		//0. Agricultural Areas
		//0.1. McEvedy and Jones (Agricultural)
		//0.2. Nevle and Bird (https://www.researchgate.net/figure/Selected-features-of-the-Pre-Columbian-American-cultural-landscape-adapted-from-Denevan_fig1_234285204)
		
		//1. Localised Scaling
		//1.1. Driver and Massey (https://sci-hub.se/https://doi.org/10.2307/1005714)
		driver_and_massey_zero_to_two: {
			colour: "#004c6d",
			density: 1/100 //(km^2)
		},
		driver_and_massey_two_to_five: {
			colour: "#346888",
			density: (2+5)/200 //(km^2)
		},
		driver_and_massey_five_to_twelve: {
			colour: "#5886a5",
			density: (5+12)/200 //(km^2)
		},
		driver_and_massey_twelve_to_thirty: {
			colour: "#7aa6c2",
			density: (12+30)/200 //(km^2)
		},
		driver_and_massey_thirty_to_seventyfive: {
			colour: "#9dc6e0",
			density: (30+75)/200 //(km^2)
		},
		driver_and_massey_seventyfive_or_more: {
			colour: "#c1e7ff",
			density: 75/100 //(km^2)
		},
		
		//1.2. E. North American Population (Milner and Chaplin), (https://sci-hub.se/https://www.cambridge.org/core/journals/american-antiquity/article/abs/eastern-north-american-population-at-ca-ad-1500/DDC4DF121320C8CBA5BC9A4899C5DF1E
		
		//2. Regional Scaling
		hawaiian_islands: { //[WIP] - Fetch scholarly estimates for Hawaii
			colour: [170, 154, 88],
			population: { //(Dye) (https://evols.library.manoa.hawaii.edu/server/api/core/bitstreams/1afaf6ee-abef-4458-9f3e-b1a582675565/content)
				"1100": 100,
				"1219": 160,
				"1450": 135,
				"1500": 150,
				"1600": 96,
				"1700": 250,
				"1778": 360, //Dye, Swanson (https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3917957) midpoint
				"1805": 175,
				"1819": 144,
				"1850": 84.165,
				"1872": 56.897,
				"1896": 109.020
			},
			scalar: 1000,
			special_domain: true
		},
		nelson_northern_america: {
			colour: [175, 63, 34],
			population: {
				'0': 2175925.925925925,
				'100': 2185185.1851851847,
				'200': 2194444.444444444,
				'300': 2203703.7037037034,
				'400': 2212962.962962963,
				'500': 2388888.888888889,
				'600': 2314814.8148148153,
				'700': 2407407.407407408,
				'800': 2305555.555555557,
				'900': 2500000.000000001,
				'1000': 2500000.000000001,
				'1100': 2361111.111111113,
				'1200': 2453703.7037037048,
				'1300': 2569444.444444444,
				'1400': 2666666.666666666,
				'1500': 2916666.666666665,
				'-3000': 2222222.2222222225,
				'-2200': 2222222.222222222,
				'-2000': 2256944.444444445,
				'-1400': 2361111.111111111,
				'-1000': 2361111.111111113,
				'-700': 2222222.222222222,
				'-300': 2222222.222222222,
				'-100': 2166666.6666666665
			}
		},
		nelson_w_north_america: {
			colour: [60, 115, 173],
			population: {
				'0': 2870370.3703703685,
				'100': 2907407.407407406,
				'200': 2944444.444444443,
				'300': 2981481.481481481,
				'400': 3018518.518518518,
				'500': 2888888.8888888867,
				'600': 3055555.5555555555,
				'700': 3055555.5555555555,
				'800': 3055555.5555555555,
				'900': 2986111.11111111,
				'1000': 3124999.999999998,
				'1100': 3194444.444444443,
				'1200': 3287037.037037037,
				'1300': 3374999.999999997,
				'1400': 3645833.333333333,
				'1500': 3416666.6666666637,
				'-3000': 2500000.000000001,
				'-2200': 2500000,
				'-2000': 2506944.4444444454,
				'-1400': 2527777.7777777775,
				'-1000': 2670634.9206349193,
				'-700': 2777777.7777777775,
				'-300': 2777777.7777777775,
				'-100': 2833333.333333333
			},
		},
		nelson_e_north_america: {
			colour: [87, 122, 175],
			population: {
				'0': 3615740.7407407393,
				'100': 3620370.3703703694,
				'200': 3624999.999999999,
				'300': 3629629.629629629,
				'400': 3634259.2592592593,
				'500': 3611111.111111109,
				'600': 3638888.8888888895,
				'700': 3638888.8888888895,
				'800': 3830555.5555555574,
				'900': 3715277.777777779,
				'1000': 3958333.3333333335,
				'1100': 4201388.88888889,
				'1200': 4189814.8148148176,
				'1300': 4444444.444444445,
				'1400': 4513888.888888892,
				'1500': 4444444.444444445,
				'-3000': 2777777.777777775,
				'-2200': 3055555.555555555,
				'-2000': 3090277.7777777775,
				'-1400': 3194444.444444444,
				'-1000': 3353174.6031746026,
				'-700': 3472222.222222222,
				'-300': 3333333.333333333,
				'-100': 3611111.111111111
			}
		},
		
		//3. National Level Scaling
		canada: {
			colour: [175, 63, 76],
			population: { //(Millions)
				"-10000": 0.10, //McEvedy and Jones (1978) gives a base population of 0,1M
				"0": 0.12, //Figure taken from HYDE3.3
				"1000": 0.38,
				"1500": 0.76,
				"1600": 0.2
			},
			scalar: 1000000
		},
		the_continental_usa: {
			colour: [67, 134, 175],
			population: {
				"-10000": 0.233969, //Figures from 10000BC to 1000BC taken from HYDE3.3
				"-9000": 0.259965,
				"-8000": 0.288850,
				"-7000": 0.320945,
				"-6000": 0.356605,
				"-5000": 0.396228,
				"-4000": 0.440253,
				"-3000": 0.489171,
				"-2000": 0.543523,
				"-1000": 0.603915,
				"0": 0.76, //Adjusted McEvedy and Jones (1978)
				"500": 0.846755, //Figures from 10000BC to 1000BC taken from HYDE3.3
				"1000": 1.52,
				"1500": 3.04,
				"1600": 0.8
			},
			scalar: 1000000
		}
	},
	domain: [-10000, 1600], //Time domain for Project Centaur 0.5b (10000BC - 1600AD)
	estimates: {
	
	}
};