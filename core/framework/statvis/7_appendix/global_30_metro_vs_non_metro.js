//Initialise functions
{
	global.generateAngel30MetroVsNonMetroTable = function (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options; encode Angel Global 30 keys for stadester_ghsl.json, stadester_ghsl_non_metro_corrected.json
		options.global_30 = [
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
			["stadester-Mumbaî-India", "ghsl-Mumbai; Thane; Navi Mumbai; Bhiwandi-India"]
			
			//20-25
			
			//25-30
		]
	};
}