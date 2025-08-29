//Initialise functions
{
	global.generateAngel30MetroVsNonMetroTable = function (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options; encode Angel Global 30 keys for stadester_ghsl.json, stadester_ghsl_non_metro_corrected.json
		options.benchmark_years = (options.benchmark_years) ? options.benchmark_years : [
			0, 500, 1000, 1500, 1600, 1700, 1800, 1850, 1900, 1950, 1975, 2000, 2025
		];
		options.global_30 = (options.global_30) ? options.global_30 : [
			//1-5
			["stadester-Accra-Ghana", "ghsl-Accra; Tema-Ghana"],
			["stadester-El-Djazaïr-Algeria", "ghsl-Algiers; Kouba-Algeria"],
			["stadester-Krung Thep-Thailand", "ghsl-Bangkok; Nonthaburi; Pak Kret; Rangsit; Samut Sakhon; Om Noi; Samut Prakan-Thailand"],
			["stadester-Beijing-China", "ghsl-Beijing; Shunyi; Mentougou; Dongcheng; Chaoyang; Haidian; Xicheng; Fengtai; Shijingshan; Daxing-China"],
			["stadester-Buenos Aires-Argentina", "ghsl-Buenos Aires; Lan�s; Avellaneda; Vicente L�pez; Gregorio de Laferrere; Merlo; Jos� C. Paz; Quilmes; Banfield; Lan�s Oeste; Lan�s Este; Gonz�lez Cat�n; Isidro Casanova; Virrey del Pino; Moreno; Berazategui; San Miguel; Rafael Castillo; Monte Grande; Villa Madero; Santa Mar�a; Mor�n; Florencio Varela; Lomas de Zamora; Temperley; Presidente Derqui; Bernal; Trujui; Castelar; San Justo; Ituzaing�; Libertad; Ramos Mej�a; Caseros; San Jos�-Argentina"],
			
			//5-10
			["stadester-Qâhirah, Al- (agglomeration)-Egypt", "ghsl-Cairo; Giza; Shubra al Khayma; Helwan; New Cairo; Fifteenth Of May; Al-Obour-Egypt"],
			["stadester-Chicago-United States", "ghsl-Chicago; Evanston; Elmhurst-United States"],
			["stadester-Ciudad de Guatemala-Guatemala", "ghsl-Guatemala City; Villa Nueva; Mixco; San Jos� Pinula-Guatemala"],
			["stadester-Istanbul-Turkey", "ghsl-Istanbul-Turkey"],
			["stadester-Jiddah-Saudi Arabia", "ghsl-Jeddah-Saudi Arabia"],
			
			//10-15
			["stadester-Johannesburg-South Africa", "ghsl-Johannesburg; Soweto; Randburg; Roodepoort; Krugersdorp; Sandton-South Africa"],
			["stadester-Calcutta-India", "ghsl-Kolkata; Howrah; Maheshtala; Maheshtala; Rajpur Sonarpur; Bally; Serampore; Baranagar; Uluberia; Hugli-Chunchura; Chandannagar; Kalyani; Budge Budge; Baruipur; Pujali; New Town; Barrackpore; New Barrackpore; Barasat-India"],
			["stadester-al-Kuwayt-Kuwait", "ghsl-Kuwait City; Jileeb Al-Shiyukh; Jabriya; Rumaithiya; Ishbilya; Salam; North West Sulaibikhat; Siddeeq; Doha; Rihab; Dasma; Rawda-Kuwait"],
			["stadester-Lagos-Nigeria", "ghsl-Lagos; Ikeja-Nigeria"],
			["stadester-London-United Kingdom", "ghsl-London; Westminster; City of London-United Kingdom"],
			
			//15-20
			["stadester-Los Angeles-California", "ghsl-Los Angeles; Long Beach; Anaheim; Santa Ana; Irvine; Glendale; San Bernardino; Fontana; Huntington Beach; Ontario; Garden Grove; Rancho Cucamonga; Pomona; Torrance; Pasadena; Fullerton; Orange; Inglewood; Downey; El Monte; Costa Mesa; West Covina; Norwalk; Burbank; South Gate; Carson; Santa Monica-United States"],
			["stadester-Manila-Philippines", "ghsl-Quezon City; Manila; Caloocan; Antipolo; Taguig; Pasig; Valenzuela; Para�aque; Dasmari�as; San Jose del Monte; Las Pi�as; Bacoor; Makati; Muntinlupa; Marikina; Calamba; Mandaluyong; Pasay; Bi�an; Imus; Malabon; Santa Rosa; San Pedro; General Trias; Cabuyao; Malolos; Navotas; Meycauayan; Baliwag; Trece Martires; San Juan; Carmona; Cavite City-Philippines"],
			["stadester-Ciudad de México-Mexico", "ghsl-Mexico City; Ecatepec; Nezahualc�yotl; Naucalpan de Ju�rez; Tlalnepantla; Chimalhuac�n; Atizap�n de Zaragoza; Ciudad L�pez Mateos; Cuautitlan Izcalli; Ojo de Agua; Xico; Ixtapaluca; Nicol�s Romero; Coacalco; Buenavista; Chalco de D�az Covarrubias; Huixquilucan de Degollado; Santa Fe; Interlomas-M�xico"],
			["stadester-Moskva-Russia", "ghsl-Moscow; Balashikha; Mytishchi; Khimki; Korolyov; Lyubertsy; Krasnogorsk; Shchyolkovo; Dolgoprudny; Pushkino-Russia"],
			["stadester-Mumbaî-India", "ghsl-Mumbai; Thane; Navi Mumbai; Bhiwandi-India"],
			
			//20-25
			["stadester-Nairobi-Kenya", "ghsl-Nairobi-Kenya"],
			["stadester-Paris-France", "ghsl-Paris; Argenteuil; Saint-Denis; Boulogne-Billancourt; Montreuil-France"],
			["stadester-Santiago-Chile", "ghsl-Santiago-Chile"],
			["stadester-São Paulo-Brazil", "ghsl-S�o Paulo; Guarulhos; Sao Bernardo do Campo; Santo Andre; Osasco; Mogi das Cruzes; Mau�; Diadema; Carapicu�ba; Itaquaquecetuba; Barueri; Suzano; Cotia; Tabo�o da Serra; Embu das Artes; Itapevi; Ferraz de Vasconcelos; S�o Caetano do Sul; Itapecerica da Serra; Jandira; Ribeir�o Pires; Po�-Brazil"],
			["stadester-Shanghai-China", "ghsl-Shanghai; Pudong; Taicang; Baoshan District; Putuo District; Changning District; Jing'an District; Xuhui District; Hongkou District; Huangpu District; Yangpu District; Qingpu; Songjiang; Minhang; Jiading; Fengxian District-China"],
			
			//25-30
			["stadester-Sydney (agglomeration)-Australia", "ghsl-Sydney-Australia"],
			["stadester-Tehrân-Iran", "ghsl-Tehran; Eslamshahr; Qods-Iran"],
			["stadester-Tel Aviv-Yafo-Israel", "ghsl-Tel Aviv; Rishon LeZion; Petah Tikva; Holon; Bat Yam; Raanana; Kfar Saba-Israel"],
			["stadester-Tôkyô-Japan", "ghsl-Tokyo; Yokohama; Kawasaki; Saitama; Chiba; Setagaya; Ota; Nerima; Adachi; Edogawa; Funabashi; Kawaguchi; Itabashi; Hachioji; Suginami; Koto; Ichikawa; Matsudo; Katsushika; Fujisawa; Machida; Shinagawa; Kashiwa; Yokosuka; Kawagoe; Kita; Shinjuku; Koshigaya; Tokorozawa; Nakano; Toshima; Meguro; Sumida; Ichihara; Fuchu; Hiratsuka; Minato; Soka; Chigasaki; Yamato; Kasukabe; Chofu; Shibuya; Bunkyo; Ageo; Atsugi; Arakawa; Taito; Nishitokyo; Yachiyo; Kodaira; Mitaka; Odawara; Nagareyama; Tachikawa; Narashino; Kamakura; Sakura; Hino; Hadano; Urayasu; Niiza; Chuo; Noda; Sayama; Kuki; Higashimurayama; Iruma; Tama; Asaka; Musashino; Koga; Misato; Toda; Abiko; Ebina; Zama; Kokubunji; Koganei; Konosu; Higashikurume; Fujimino; Akishima; Kamagaya; Fujimi; Toride; Sakado; Isehara; Yotsukaido; Inagi; Yashio; Higashiyamato; Ayase; Wako; Akiruno; Gyoda; Hanno; Komae; Kiyose; Okegawa; Kunitachi; Shiki; Warabi; Yoshikawa; Musashimurayama; Tsurugashima; Moriya; Kitamoto; Shiroi; Sodegaura; Hasuda; Fussa; Zushi; Hidaka; Hamura; Shiraoka; Satte; Chiyoda; Minamiashigara-Japan"],
			["stadester-Warszawa-Poland", "ghsl-Warsaw-Poland"]
		];
		options.global_30_names = (options.global_30_names) ? options.global_30_names : [
			"Accra", "Algiers", "Bangkok", "Beijing", "Buenos Aires",
			"Cairo", "Chicago", "Guatemala", "Istanbul", "Jeddah",
			"Johannesburg", "Kolkata", "Kuwait", "Lagos", "London",
			"Los Angeles", "Manila", "Mexico", "Moscow", "Mumbai",
			"Nairobi", "Paris", "Santiago", "Sao Paulo", "Shanghai",
			"Sydney", "Tehran", "Tel Aviv", "Tokyo", "Warsaw"
		];
		
		//Declare local instance variables
		let common_defines = config.defines.common;
		let stadester_ghsl_obj = FileManager.loadFileAsJSON(common_defines.output_file_paths.stadester_ghsl);
		let stadester_ghsl_non_metro_obj = FileManager.loadFileAsJSON(common_defines.output_file_paths.stadester_ghsl_non_metro);
		let return_array = [];
		let return_obj = {};
		
		//Iterate over all elements in options.global_30
		for (let i = 0; i < options.global_30.length; i++) {
			let local_non_metro_population_obj = {};
			let local_population_obj = {};
			
			//Iterate over all valid city keys and merge their population objects
			for (let x = 0; x < options.global_30[i].length; x++) {
				let local_metro_city = stadester_ghsl_obj[options.global_30[i][x]];
				let local_non_metro_city = stadester_ghsl_non_metro_obj[options.global_30[i][x]];
				
				if (local_metro_city && local_metro_city.population) {
					let all_population_keys = Object.keys(local_metro_city.population)
						.map(Number).sort((a, b) => a - b);
					
					for (let y = 0; y < all_population_keys.length; y++) {
						let local_value = local_metro_city.population[all_population_keys[y]];
						
						if (!local_population_obj[all_population_keys[y]]) local_population_obj[all_population_keys[y]] = [];
						local_population_obj[all_population_keys[y]].push(local_value);
					}
				}
				if (local_non_metro_city && local_non_metro_city.population) {
					let all_population_keys = Object.keys(local_non_metro_city.population)
						.map(Number).sort((a, b) => a - b);
					
					for (let y = 0; y < all_population_keys.length; y++) {
						let local_value = local_non_metro_city.population[all_population_keys[y]];
						
						if (!local_non_metro_population_obj[all_population_keys[y]]) local_non_metro_population_obj[all_population_keys[y]] = [];
						local_non_metro_population_obj[all_population_keys[y]].push(local_value);
					}
				}
			}
			
			//Weighted geometric mean local_non_metro_population_obj; local_population_obj
			//Iterate over all_local_non_metro_population_keys
			let all_local_non_metro_population_keys = Object.keys(local_non_metro_population_obj);
			
			for (let i = 0; i < all_local_non_metro_population_keys.length; i++) {
				let local_value = local_non_metro_population_obj[all_local_non_metro_population_keys[i]];
				
				if (local_value.length === 1) {
					local_non_metro_population_obj[all_local_non_metro_population_keys[i]] = local_value;
				} else {
					local_non_metro_population_obj[all_local_non_metro_population_keys[i]] = weightedGeometricMean(local_value);
				}
			}
			
			//Iterate over all_local_population_keys
			let all_local_population_keys = Object.keys(local_population_obj);
			
			for (let i = 0; i < all_local_population_keys.length; i++) {
				let local_value = local_population_obj[all_local_population_keys[i]];
				
				if (local_value.length === 1) {
					local_population_obj[all_local_population_keys[i]] = local_value[0];
				} else {
					local_population_obj[all_local_population_keys[i]] = weightedGeometricMean(local_value);
				}
			}
			
			return_obj[options.global_30_names[i]] = {
				name: options.global_30_names[i],
				non_metro_population: local_non_metro_population_obj,
				population: local_population_obj
			}
		}
		
		//Push all population entries to return_array over options.benchmark_years
		for (let i = 0; i < options.benchmark_years.length; i++) {
			let all_return_keys = Object.keys(return_obj);
			let local_obj = {};
			
			for (let x = 0; x < all_return_keys.length; x++) {
				let local_city = return_obj[all_return_keys[x]];
				
				local_obj[`${local_city.name}, MA Pop.`] = returnSafeNumber(Math.round(local_city.population[options.benchmark_years[i]]));
				local_obj[`${local_city.name}, N-MA Pop.`] = returnSafeNumber(Math.round(local_city.non_metro_population[options.benchmark_years[i]]));
			}
			
			return_array.push({ "Year": options.benchmark_years[i], ...local_obj });
		}
		
		//Save CSV to output table
		FileManager.saveFileAsCSV(common_defines.output_file_paths.angel_30_table, return_array);
		
		//Return statement
		return return_array;
	};
}