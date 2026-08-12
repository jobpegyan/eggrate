export interface SeedState {
  name: string;
  slug: string;
  code: string;
  displayOrder: number;
}

export interface SeedCity {
  name: string;
  stateCode: string;
  isFeatured: boolean;
  latitude: number;
  longitude: number;
  population: number;
}

export const ALL_STATES: SeedState[] = [
  { name: 'Andhra Pradesh', slug: 'andhra-pradesh', code: 'AP', displayOrder: 1 },
  { name: 'Arunachal Pradesh', slug: 'arunachal-pradesh', code: 'AR', displayOrder: 2 },
  { name: 'Assam', slug: 'assam', code: 'AS', displayOrder: 3 },
  { name: 'Bihar', slug: 'bihar', code: 'BR', displayOrder: 4 },
  { name: 'Chhattisgarh', slug: 'chhattisgarh', code: 'CT', displayOrder: 5 },
  { name: 'Goa', slug: 'goa', code: 'GA', displayOrder: 6 },
  { name: 'Gujarat', slug: 'gujarat', code: 'GJ', displayOrder: 7 },
  { name: 'Haryana', slug: 'haryana', code: 'HR', displayOrder: 8 },
  { name: 'Himachal Pradesh', slug: 'himachal-pradesh', code: 'HP', displayOrder: 9 },
  { name: 'Jharkhand', slug: 'jharkhand', code: 'JH', displayOrder: 10 },
  { name: 'Karnataka', slug: 'karnataka', code: 'KA', displayOrder: 11 },
  { name: 'Kerala', slug: 'kerala', code: 'KL', displayOrder: 12 },
  { name: 'Madhya Pradesh', slug: 'madhya-pradesh', code: 'MP', displayOrder: 13 },
  { name: 'Maharashtra', slug: 'maharashtra', code: 'MH', displayOrder: 14 },
  { name: 'Manipur', slug: 'manipur', code: 'MN', displayOrder: 15 },
  { name: 'Meghalaya', slug: 'meghalaya', code: 'ML', displayOrder: 16 },
  { name: 'Mizoram', slug: 'mizoram', code: 'MZ', displayOrder: 17 },
  { name: 'Nagaland', slug: 'nagaland', code: 'NL', displayOrder: 18 },
  { name: 'Odisha', slug: 'odisha', code: 'OD', displayOrder: 19 },
  { name: 'Punjab', slug: 'punjab', code: 'PB', displayOrder: 20 },
  { name: 'Rajasthan', slug: 'rajasthan', code: 'RJ', displayOrder: 21 },
  { name: 'Sikkim', slug: 'sikkim', code: 'SK', displayOrder: 22 },
  { name: 'Tamil Nadu', slug: 'tamil-nadu', code: 'TN', displayOrder: 23 },
  { name: 'Telangana', slug: 'telangana', code: 'TG', displayOrder: 24 },
  { name: 'Tripura', slug: 'tripura', code: 'TR', displayOrder: 25 },
  { name: 'Uttar Pradesh', slug: 'uttar-pradesh', code: 'UP', displayOrder: 26 },
  { name: 'Uttarakhand', slug: 'uttarakhand', code: 'UK', displayOrder: 27 },
  { name: 'West Bengal', slug: 'west-bengal', code: 'WB', displayOrder: 28 },
  { name: 'Andaman & Nicobar Islands', slug: 'andaman-and-nicobar-islands', code: 'AN', displayOrder: 29 },
  { name: 'Chandigarh', slug: 'chandigarh', code: 'CH', displayOrder: 30 },
  { name: 'Dadra Nagar Haveli & Daman Diu', slug: 'dadra-nagar-haveli-and-daman-diu', code: 'DN', displayOrder: 31 },
  { name: 'Delhi', slug: 'delhi', code: 'DL', displayOrder: 32 },
  { name: 'Jammu & Kashmir', slug: 'jammu-and-kashmir', code: 'JK', displayOrder: 33 },
  { name: 'Ladakh', slug: 'ladakh', code: 'LA', displayOrder: 34 },
  { name: 'Lakshadweep', slug: 'lakshadweep', code: 'LD', displayOrder: 35 },
  { name: 'Puducherry', slug: 'puducherry', code: 'PY', displayOrder: 36 }
];

export const ALL_CITIES: SeedCity[] = [
  // Andhra Pradesh (AP)
  { name: 'Vijayawada', stateCode: 'AP', isFeatured: true, latitude: 16.5062, longitude: 80.6480, population: 1048240 },
  { name: 'Visakhapatnam', stateCode: 'AP', isFeatured: true, latitude: 17.6868, longitude: 83.2185, population: 2035922 },
  { name: 'Guntur', stateCode: 'AP', isFeatured: true, latitude: 16.3067, longitude: 80.4365, population: 651382 },
  { name: 'Tirupati', stateCode: 'AP', isFeatured: true, latitude: 13.6288, longitude: 79.4192, population: 459985 },
  { name: 'Rajahmundry', stateCode: 'AP', isFeatured: false, latitude: 17.0005, longitude: 81.8040, population: 341831 },
  { name: 'Kakinada', stateCode: 'AP', isFeatured: false, latitude: 16.9891, longitude: 82.2475, population: 312538 },
  { name: 'Nellore', stateCode: 'AP', isFeatured: true, latitude: 14.4426, longitude: 79.9865, population: 505258 },
  { name: 'Kurnool', stateCode: 'AP', isFeatured: true, latitude: 15.8281, longitude: 78.0373, population: 430214 },
  { name: 'Anantapur', stateCode: 'AP', isFeatured: false, latitude: 14.6819, longitude: 77.6006, population: 340613 },
  { name: 'Eluru', stateCode: 'AP', isFeatured: false, latitude: 16.7107, longitude: 81.1031, population: 217876 },
  { name: 'Ongole', stateCode: 'AP', isFeatured: false, latitude: 15.5057, longitude: 80.0499, population: 204746 },
  { name: 'Chittoor', stateCode: 'AP', isFeatured: false, latitude: 13.2172, longitude: 79.1003, population: 153766 },
  { name: 'Kadapa', stateCode: 'AP', isFeatured: false, latitude: 14.4673, longitude: 78.8242, population: 343054 },
  { name: 'Srikakulam', stateCode: 'AP', isFeatured: false, latitude: 18.2949, longitude: 83.8938, population: 146988 },
  { name: 'Machilipatnam', stateCode: 'AP', isFeatured: false, latitude: 16.1782, longitude: 81.1326, population: 169892 },
  { name: 'East Godavari', stateCode: 'AP', isFeatured: true, latitude: 17.0300, longitude: 81.8000, population: 5154296 },
  { name: 'West Godavari', stateCode: 'AP', isFeatured: true, latitude: 16.7000, longitude: 81.1000, population: 3936966 },
  { name: 'Tenali', stateCode: 'AP', isFeatured: false, latitude: 16.2375, longitude: 80.6475, population: 164937 },
  { name: 'Proddatur', stateCode: 'AP', isFeatured: false, latitude: 14.7526, longitude: 78.5520, population: 162717 },
  { name: 'Hindupur', stateCode: 'AP', isFeatured: false, latitude: 13.8277, longitude: 77.4912, population: 151835 },

  // Arunachal Pradesh (AR)
  { name: 'Itanagar', stateCode: 'AR', isFeatured: true, latitude: 27.0844, longitude: 93.6053, population: 59490 },
  { name: 'Naharlagun', stateCode: 'AR', isFeatured: false, latitude: 27.1035, longitude: 93.6890, population: 36158 },
  { name: 'Pasighat', stateCode: 'AR', isFeatured: false, latitude: 28.0667, longitude: 95.3333, population: 24656 },
  { name: 'Tawang', stateCode: 'AR', isFeatured: false, latitude: 27.5855, longitude: 91.8617, population: 11202 },
  { name: 'Ziro', stateCode: 'AR', isFeatured: false, latitude: 27.5359, longitude: 93.8340, population: 12806 },

  // Assam (AS)
  { name: 'Guwahati', stateCode: 'AS', isFeatured: true, latitude: 26.1445, longitude: 91.7362, population: 962334 },
  { name: 'Dibrugarh', stateCode: 'AS', isFeatured: false, latitude: 27.4728, longitude: 94.9120, population: 154296 },
  { name: 'Silchar', stateCode: 'AS', isFeatured: false, latitude: 24.8333, longitude: 92.7789, population: 172830 },
  { name: 'Jorhat', stateCode: 'AS', isFeatured: false, latitude: 26.7509, longitude: 94.2037, population: 153889 },
  { name: 'Nagaon', stateCode: 'AS', isFeatured: false, latitude: 26.3480, longitude: 92.6840, population: 117722 },
  { name: 'Tezpur', stateCode: 'AS', isFeatured: false, latitude: 26.6528, longitude: 92.7926, population: 102505 },
  { name: 'Tinsukia', stateCode: 'AS', isFeatured: false, latitude: 27.4922, longitude: 95.3468, population: 99448 },
  { name: 'Bongaigaon', stateCode: 'AS', isFeatured: false, latitude: 26.4740, longitude: 90.5583, population: 74810 },

  // Bihar (BR)
  { name: 'Patna', stateCode: 'BR', isFeatured: true, latitude: 25.5941, longitude: 85.1376, population: 2046652 },
  { name: 'Muzaffarpur', stateCode: 'BR', isFeatured: true, latitude: 26.1209, longitude: 85.3647, population: 393724 },
  { name: 'Gaya', stateCode: 'BR', isFeatured: true, latitude: 24.7914, longitude: 85.0002, population: 474093 },
  { name: 'Bhagalpur', stateCode: 'BR', isFeatured: true, latitude: 25.2425, longitude: 87.0177, population: 400146 },
  { name: 'Purnia', stateCode: 'BR', isFeatured: false, latitude: 25.7771, longitude: 87.4753, population: 282248 },
  { name: 'Darbhanga', stateCode: 'BR', isFeatured: false, latitude: 26.1542, longitude: 85.8918, population: 296039 },
  { name: 'Bihar Sharif', stateCode: 'BR', isFeatured: false, latitude: 25.1982, longitude: 85.5170, population: 297268 },
  { name: 'Munger', stateCode: 'BR', isFeatured: false, latitude: 25.3757, longitude: 86.4744, population: 213303 },
  { name: 'Arrah', stateCode: 'BR', isFeatured: false, latitude: 25.5560, longitude: 84.6603, population: 261430 },
  { name: 'Begusarai', stateCode: 'BR', isFeatured: false, latitude: 25.4167, longitude: 86.1333, population: 252008 },
  { name: 'Samastipur', stateCode: 'BR', isFeatured: false, latitude: 25.8628, longitude: 85.7810, population: 104747 },
  { name: 'Hajipur', stateCode: 'BR', isFeatured: false, latitude: 25.6845, longitude: 85.2078, population: 147688 },
  { name: 'Chhapra', stateCode: 'BR', isFeatured: false, latitude: 25.7796, longitude: 84.7499, population: 202352 },
  { name: 'Siwan', stateCode: 'BR', isFeatured: false, latitude: 26.2196, longitude: 84.3567, population: 135066 },
  { name: 'Bettiah', stateCode: 'BR', isFeatured: false, latitude: 26.8016, longitude: 84.5029, population: 132209 },
  { name: 'Motihari', stateCode: 'BR', isFeatured: false, latitude: 26.6436, longitude: 84.9209, population: 126158 },
  { name: 'Saharsa', stateCode: 'BR', isFeatured: false, latitude: 25.8835, longitude: 86.6006, population: 156540 },
  { name: 'Katihar', stateCode: 'BR', isFeatured: false, latitude: 25.5393, longitude: 87.5684, population: 240565 },

  // Chhattisgarh (CT)
  { name: 'Raipur', stateCode: 'CT', isFeatured: true, latitude: 21.2514, longitude: 81.6296, population: 1010087 },
  { name: 'Bhilai', stateCode: 'CT', isFeatured: true, latitude: 21.1938, longitude: 81.3509, population: 625700 },
  { name: 'Bilaspur', stateCode: 'CT', isFeatured: true, latitude: 22.0797, longitude: 82.1391, population: 331030 },
  { name: 'Korba', stateCode: 'CT', isFeatured: false, latitude: 22.3595, longitude: 82.7500, population: 363390 },
  { name: 'Durg', stateCode: 'CT', isFeatured: false, latitude: 21.1904, longitude: 81.2849, population: 268806 },
  { name: 'Rajnandgaon', stateCode: 'CT', isFeatured: false, latitude: 21.0963, longitude: 80.3168, population: 163114 },
  { name: 'Jagdalpur', stateCode: 'CT', isFeatured: false, latitude: 19.0763, longitude: 82.0232, population: 125463 },
  { name: 'Ambikapur', stateCode: 'CT', isFeatured: false, latitude: 23.1189, longitude: 83.1950, population: 114575 },

  // Goa (GA)
  { name: 'Panaji', stateCode: 'GA', isFeatured: true, latitude: 15.4909, longitude: 73.8278, population: 40017 },
  { name: 'Margao', stateCode: 'GA', isFeatured: false, latitude: 15.2736, longitude: 73.9585, population: 87650 },
  { name: 'Vasco da Gama', stateCode: 'GA', isFeatured: false, latitude: 15.3949, longitude: 73.8166, population: 100000 },
  { name: 'Mapusa', stateCode: 'GA', isFeatured: false, latitude: 15.5901, longitude: 73.8105, population: 39989 },
  { name: 'Ponda', stateCode: 'GA', isFeatured: false, latitude: 15.3981, longitude: 74.0118, population: 22664 },

  // Gujarat (GJ)
  { name: 'Ahmedabad', stateCode: 'GJ', isFeatured: true, latitude: 23.0225, longitude: 72.5714, population: 5570585 },
  { name: 'Surat', stateCode: 'GJ', isFeatured: true, latitude: 21.1702, longitude: 72.8311, population: 4467797 },
  { name: 'Vadodara', stateCode: 'GJ', isFeatured: true, latitude: 22.3072, longitude: 73.1812, population: 1670806 },
  { name: 'Rajkot', stateCode: 'GJ', isFeatured: true, latitude: 22.3039, longitude: 70.8022, population: 1286678 },
  { name: 'Bhavnagar', stateCode: 'GJ', isFeatured: true, latitude: 21.7645, longitude: 72.1519, population: 593368 },
  { name: 'Jamnagar', stateCode: 'GJ', isFeatured: true, latitude: 22.4707, longitude: 70.0577, population: 600943 },
  { name: 'Junagadh', stateCode: 'GJ', isFeatured: false, latitude: 21.5222, longitude: 70.4579, population: 319462 },
  { name: 'Gandhinagar', stateCode: 'GJ', isFeatured: true, latitude: 23.2156, longitude: 72.6369, population: 292167 },
  { name: 'Anand', stateCode: 'GJ', isFeatured: true, latitude: 22.5645, longitude: 72.9289, population: 288092 }, // Important dairy/poultry region
  { name: 'Nadiad', stateCode: 'GJ', isFeatured: false, latitude: 22.6916, longitude: 72.8634, population: 225071 },
  { name: 'Mehsana', stateCode: 'GJ', isFeatured: false, latitude: 23.5880, longitude: 72.3693, population: 184991 },
  { name: 'Bharuch', stateCode: 'GJ', isFeatured: false, latitude: 21.7051, longitude: 72.9959, population: 169007 },
  { name: 'Navsari', stateCode: 'GJ', isFeatured: false, latitude: 20.9467, longitude: 72.9322, population: 160941 },
  { name: 'Morbi', stateCode: 'GJ', isFeatured: false, latitude: 22.8120, longitude: 70.8320, population: 194947 },
  { name: 'Gandhidham', stateCode: 'GJ', isFeatured: false, latitude: 23.0763, longitude: 70.1336, population: 247992 },
  { name: 'Bhuj', stateCode: 'GJ', isFeatured: false, latitude: 23.2420, longitude: 69.6669, population: 148834 },

  // Haryana (HR)
  { name: 'Gurugram', stateCode: 'HR', isFeatured: true, latitude: 28.4595, longitude: 77.0266, population: 876900 },
  { name: 'Faridabad', stateCode: 'HR', isFeatured: true, latitude: 28.4089, longitude: 77.3178, population: 1414050 },
  { name: 'Panipat', stateCode: 'HR', isFeatured: false, latitude: 29.3909, longitude: 76.9708, population: 294292 },
  { name: 'Ambala', stateCode: 'HR', isFeatured: false, latitude: 30.3752, longitude: 76.7821, population: 195153 },
  { name: 'Karnal', stateCode: 'HR', isFeatured: false, latitude: 29.6857, longitude: 76.9905, population: 286827 },
  { name: 'Hisar', stateCode: 'HR', isFeatured: false, latitude: 29.1492, longitude: 75.7217, population: 301383 },
  { name: 'Rohtak', stateCode: 'HR', isFeatured: false, latitude: 28.8955, longitude: 76.5892, population: 374292 },
  { name: 'Sonipat', stateCode: 'HR', isFeatured: false, latitude: 28.9931, longitude: 77.0151, population: 278149 },
  { name: 'Barwala', stateCode: 'HR', isFeatured: true, latitude: 29.3787, longitude: 75.9220, population: 40000 }, // Major NECC Centre
  { name: 'Yamunanagar', stateCode: 'HR', isFeatured: false, latitude: 30.1290, longitude: 77.2674, population: 216677 },
  { name: 'Bhiwani', stateCode: 'HR', isFeatured: false, latitude: 28.7952, longitude: 76.1367, population: 196057 },
  { name: 'Sirsa', stateCode: 'HR', isFeatured: false, latitude: 29.5330, longitude: 75.0177, population: 182534 },
  { name: 'Rewari', stateCode: 'HR', isFeatured: false, latitude: 28.1928, longitude: 76.6239, population: 143021 },
  { name: 'Panchkula', stateCode: 'HR', isFeatured: false, latitude: 30.6942, longitude: 76.8606, population: 211355 },
  { name: 'Jind', stateCode: 'HR', isFeatured: false, latitude: 29.3178, longitude: 76.3115, population: 167592 },
  { name: 'Bahadurgarh', stateCode: 'HR', isFeatured: false, latitude: 28.6823, longitude: 76.9254, population: 170767 },

  // Himachal Pradesh (HP)
  { name: 'Shimla', stateCode: 'HP', isFeatured: true, latitude: 31.1048, longitude: 77.1734, population: 169578 },
  { name: 'Manali', stateCode: 'HP', isFeatured: false, latitude: 32.2396, longitude: 77.1887, population: 8096 },
  { name: 'Dharamshala', stateCode: 'HP', isFeatured: false, latitude: 32.2190, longitude: 76.3234, population: 53543 },
  { name: 'Mandi', stateCode: 'HP', isFeatured: false, latitude: 31.5892, longitude: 76.9318, population: 26422 },
  { name: 'Solan', stateCode: 'HP', isFeatured: false, latitude: 30.9084, longitude: 77.0999, population: 39256 },
  { name: 'Kullu', stateCode: 'HP', isFeatured: false, latitude: 31.9579, longitude: 77.1095, population: 18536 },
  { name: 'Hamirpur', stateCode: 'HP', isFeatured: false, latitude: 31.6862, longitude: 76.5213, population: 17604 },
  { name: 'Una', stateCode: 'HP', isFeatured: false, latitude: 31.4685, longitude: 76.2708, population: 18722 },
  { name: 'Palampur', stateCode: 'HP', isFeatured: false, latitude: 32.1109, longitude: 76.5363, population: 35000 },

  // Jharkhand (JH)
  { name: 'Ranchi', stateCode: 'JH', isFeatured: true, latitude: 23.3441, longitude: 85.3096, population: 1073427 },
  { name: 'Jamshedpur', stateCode: 'JH', isFeatured: true, latitude: 22.8046, longitude: 86.2029, population: 1339438 },
  { name: 'Dhanbad', stateCode: 'JH', isFeatured: true, latitude: 23.7915, longitude: 86.4304, population: 1162472 },
  { name: 'Bokaro', stateCode: 'JH', isFeatured: true, latitude: 23.6693, longitude: 86.1511, population: 564319 },
  { name: 'Deoghar', stateCode: 'JH', isFeatured: false, latitude: 24.4841, longitude: 86.6999, population: 203123 },
  { name: 'Hazaribagh', stateCode: 'JH', isFeatured: false, latitude: 23.9925, longitude: 85.3637, population: 153595 },
  { name: 'Giridih', stateCode: 'JH', isFeatured: false, latitude: 24.1906, longitude: 86.3005, population: 114533 },
  { name: 'Ramgarh', stateCode: 'JH', isFeatured: false, latitude: 23.6333, longitude: 85.5167, population: 132441 },
  { name: 'Dumka', stateCode: 'JH', isFeatured: false, latitude: 24.2676, longitude: 87.2471, population: 47584 },

  // Karnataka (KA)
  { name: 'Bengaluru', stateCode: 'KA', isFeatured: true, latitude: 12.9716, longitude: 77.5946, population: 8443675 },
  { name: 'Mysuru', stateCode: 'KA', isFeatured: true, latitude: 12.2958, longitude: 76.6394, population: 920550 },
  { name: 'Mangaluru', stateCode: 'KA', isFeatured: true, latitude: 12.9141, longitude: 74.8560, population: 499487 },
  { name: 'Hubli-Dharwad', stateCode: 'KA', isFeatured: true, latitude: 15.3647, longitude: 75.1240, population: 943788 },
  { name: 'Belgaum', stateCode: 'KA', isFeatured: true, latitude: 15.8497, longitude: 74.4977, population: 488157 },
  { name: 'Davangere', stateCode: 'KA', isFeatured: false, latitude: 14.4644, longitude: 75.9218, population: 434971 },
  { name: 'Tumkur', stateCode: 'KA', isFeatured: false, latitude: 13.3392, longitude: 77.1010, population: 305821 },
  { name: 'Shimoga', stateCode: 'KA', isFeatured: false, latitude: 13.9299, longitude: 75.5681, population: 322650 },
  { name: 'Hospet', stateCode: 'KA', isFeatured: true, latitude: 15.2689, longitude: 76.3909, population: 206167 }, // Notable egg market
  { name: 'Gulbarga', stateCode: 'KA', isFeatured: true, latitude: 17.3297, longitude: 76.8343, population: 533587 },
  { name: 'Raichur', stateCode: 'KA', isFeatured: false, latitude: 16.2076, longitude: 77.3463, population: 232456 },
  { name: 'Bidar', stateCode: 'KA', isFeatured: false, latitude: 17.9104, longitude: 77.5199, population: 216020 },
  { name: 'Bellary', stateCode: 'KA', isFeatured: false, latitude: 15.1394, longitude: 76.9214, population: 410445 },
  { name: 'Hassan', stateCode: 'KA', isFeatured: false, latitude: 13.0068, longitude: 76.1004, population: 155006 },
  { name: 'Udupi', stateCode: 'KA', isFeatured: false, latitude: 13.3409, longitude: 74.7421, population: 144960 },
  { name: 'Chitradurga', stateCode: 'KA', isFeatured: false, latitude: 14.2251, longitude: 76.3980, population: 145853 },
  { name: 'Mandya', stateCode: 'KA', isFeatured: false, latitude: 12.5218, longitude: 76.8951, population: 137358 },

  // Kerala (KL)
  { name: 'Thiruvananthapuram', stateCode: 'KL', isFeatured: true, latitude: 8.5241, longitude: 76.9366, population: 743691 },
  { name: 'Kochi', stateCode: 'KL', isFeatured: true, latitude: 9.9312, longitude: 76.2673, population: 602046 },
  { name: 'Kozhikode', stateCode: 'KL', isFeatured: true, latitude: 11.2588, longitude: 75.7804, population: 609224 },
  { name: 'Thrissur', stateCode: 'KL', isFeatured: false, latitude: 10.5276, longitude: 76.2144, population: 315906 },
  { name: 'Kollam', stateCode: 'KL', isFeatured: false, latitude: 8.8932, longitude: 76.6141, population: 349033 },
  { name: 'Kannur', stateCode: 'KL', isFeatured: false, latitude: 11.8745, longitude: 75.3704, population: 232486 },
  { name: 'Palakkad', stateCode: 'KL', isFeatured: false, latitude: 10.7867, longitude: 76.6548, population: 131019 },
  { name: 'Alappuzha', stateCode: 'KL', isFeatured: false, latitude: 9.4981, longitude: 76.3388, population: 174164 },
  { name: 'Malappuram', stateCode: 'KL', isFeatured: false, latitude: 11.0733, longitude: 76.0740, population: 101386 },
  { name: 'Kottayam', stateCode: 'KL', isFeatured: false, latitude: 9.5916, longitude: 76.5222, population: 136812 },

  // Madhya Pradesh (MP)
  { name: 'Bhopal', stateCode: 'MP', isFeatured: true, latitude: 23.2599, longitude: 77.4126, population: 1798218 },
  { name: 'Indore', stateCode: 'MP', isFeatured: true, latitude: 22.7196, longitude: 75.8577, population: 1994397 },
  { name: 'Jabalpur', stateCode: 'MP', isFeatured: true, latitude: 23.1815, longitude: 79.9864, population: 1081677 },
  { name: 'Gwalior', stateCode: 'MP', isFeatured: true, latitude: 26.2183, longitude: 78.1828, population: 1054420 },
  { name: 'Ujjain', stateCode: 'MP', isFeatured: true, latitude: 23.1765, longitude: 75.7885, population: 515215 },
  { name: 'Sagar', stateCode: 'MP', isFeatured: false, latitude: 23.8388, longitude: 78.7378, population: 273357 },
  { name: 'Satna', stateCode: 'MP', isFeatured: false, latitude: 24.5772, longitude: 80.8266, population: 280222 },
  { name: 'Rewa', stateCode: 'MP', isFeatured: false, latitude: 24.5358, longitude: 81.3005, population: 235654 },
  { name: 'Ratlam', stateCode: 'MP', isFeatured: false, latitude: 23.3315, longitude: 75.0367, population: 264914 },
  { name: 'Dewas', stateCode: 'MP', isFeatured: false, latitude: 22.9676, longitude: 76.0534, population: 289550 },
  { name: 'Burhanpur', stateCode: 'MP', isFeatured: false, latitude: 21.3145, longitude: 76.2234, population: 210886 },
  { name: 'Khandwa', stateCode: 'MP', isFeatured: false, latitude: 21.8315, longitude: 76.3533, population: 200738 },
  { name: 'Chhindwara', stateCode: 'MP', isFeatured: false, latitude: 22.0573, longitude: 78.9382, population: 190008 },

  // Maharashtra (MH)
  { name: 'Mumbai', stateCode: 'MH', isFeatured: true, latitude: 19.0760, longitude: 72.8777, population: 12442373 },
  { name: 'Pune', stateCode: 'MH', isFeatured: true, latitude: 18.5204, longitude: 73.8567, population: 3124458 },
  { name: 'Nagpur', stateCode: 'MH', isFeatured: true, latitude: 21.1458, longitude: 79.0882, population: 2405665 },
  { name: 'Nashik', stateCode: 'MH', isFeatured: true, latitude: 20.0110, longitude: 73.7903, population: 1486053 },
  { name: 'Aurangabad', stateCode: 'MH', isFeatured: true, latitude: 19.8762, longitude: 75.3433, population: 1175116 },
  { name: 'Solapur', stateCode: 'MH', isFeatured: true, latitude: 17.6599, longitude: 75.9064, population: 951558 },
  { name: 'Kolhapur', stateCode: 'MH', isFeatured: true, latitude: 16.7050, longitude: 74.2433, population: 549236 },
  { name: 'Sangli', stateCode: 'MH', isFeatured: true, latitude: 16.8524, longitude: 74.5815, population: 502793 }, // Important agricultural hub
  { name: 'Latur', stateCode: 'MH', isFeatured: false, latitude: 18.4088, longitude: 76.5604, population: 382940 },
  { name: 'Ahmednagar', stateCode: 'MH', isFeatured: false, latitude: 19.0952, longitude: 74.7496, population: 350859 },
  { name: 'Akola', stateCode: 'MH', isFeatured: false, latitude: 20.7059, longitude: 77.0019, population: 425817 },
  { name: 'Amravati', stateCode: 'MH', isFeatured: true, latitude: 20.9320, longitude: 77.7523, population: 647057 },
  { name: 'Nanded', stateCode: 'MH', isFeatured: true, latitude: 19.1383, longitude: 77.3210, population: 550564 },
  { name: 'Jalgaon', stateCode: 'MH', isFeatured: false, latitude: 21.0077, longitude: 75.5626, population: 460468 },
  { name: 'Dhule', stateCode: 'MH', isFeatured: false, latitude: 20.9042, longitude: 74.7749, population: 375559 },
  { name: 'Satara', stateCode: 'MH', isFeatured: false, latitude: 17.6805, longitude: 73.9926, population: 120195 },
  { name: 'Chandrapur', stateCode: 'MH', isFeatured: false, latitude: 19.9615, longitude: 79.2961, population: 320379 },
  { name: 'Ratnagiri', stateCode: 'MH', isFeatured: false, latitude: 16.9902, longitude: 73.3120, population: 76229 },
  { name: 'Palghar', stateCode: 'MH', isFeatured: false, latitude: 19.6960, longitude: 72.7655, population: 68930 },
  { name: 'Thane', stateCode: 'MH', isFeatured: true, latitude: 19.2183, longitude: 72.9781, population: 1841488 },
  { name: 'Navi Mumbai', stateCode: 'MH', isFeatured: true, latitude: 19.0330, longitude: 73.0297, population: 1120547 },
  { name: 'Kalyan', stateCode: 'MH', isFeatured: true, latitude: 19.2403, longitude: 73.1305, population: 1262255 },

  // Manipur (MN)
  { name: 'Imphal', stateCode: 'MN', isFeatured: true, latitude: 24.8170, longitude: 93.9368, population: 268243 },
  { name: 'Thoubal', stateCode: 'MN', isFeatured: false, latitude: 24.6346, longitude: 94.0152, population: 45947 },
  { name: 'Bishnupur', stateCode: 'MN', isFeatured: false, latitude: 24.6294, longitude: 93.7667, population: 16264 },
  { name: 'Churachandpur', stateCode: 'MN', isFeatured: false, latitude: 24.3316, longitude: 93.6766, population: 54141 },

  // Meghalaya (ML)
  { name: 'Shillong', stateCode: 'ML', isFeatured: true, latitude: 25.5788, longitude: 91.8933, population: 143229 },
  { name: 'Tura', stateCode: 'ML', isFeatured: false, latitude: 25.5147, longitude: 90.2033, population: 74858 },
  { name: 'Jowai', stateCode: 'ML', isFeatured: false, latitude: 25.4418, longitude: 92.1950, population: 28430 },
  { name: 'Nongstoin', stateCode: 'ML', isFeatured: false, latitude: 25.5186, longitude: 91.2662, population: 28742 },

  // Mizoram (MZ)
  { name: 'Aizawl', stateCode: 'MZ', isFeatured: true, latitude: 23.7307, longitude: 92.7173, population: 293416 },
  { name: 'Lunglei', stateCode: 'MZ', isFeatured: false, latitude: 22.8809, longitude: 92.7380, population: 57111 },
  { name: 'Champhai', stateCode: 'MZ', isFeatured: false, latitude: 23.4735, longitude: 93.3283, population: 32734 },
  { name: 'Serchhip', stateCode: 'MZ', isFeatured: false, latitude: 23.3088, longitude: 92.8465, population: 21158 },

  // Nagaland (NL)
  { name: 'Kohima', stateCode: 'NL', isFeatured: true, latitude: 25.6586, longitude: 94.1053, population: 99039 },
  { name: 'Dimapur', stateCode: 'NL', isFeatured: true, latitude: 25.8640, longitude: 93.7297, population: 122834 },
  { name: 'Mokokchung', stateCode: 'NL', isFeatured: false, latitude: 26.3268, longitude: 94.5143, population: 35913 },
  { name: 'Tuensang', stateCode: 'NL', isFeatured: false, latitude: 26.2730, longitude: 94.8252, population: 36774 },

  // Odisha (OD)
  { name: 'Bhubaneswar', stateCode: 'OD', isFeatured: true, latitude: 20.2961, longitude: 85.8245, population: 843402 },
  { name: 'Cuttack', stateCode: 'OD', isFeatured: true, latitude: 20.4625, longitude: 85.8830, population: 606007 },
  { name: 'Rourkela', stateCode: 'OD', isFeatured: true, latitude: 22.2604, longitude: 84.8536, population: 536450 },
  { name: 'Berhampur', stateCode: 'OD', isFeatured: false, latitude: 19.3150, longitude: 84.7941, population: 356598 },
  { name: 'Sambalpur', stateCode: 'OD', isFeatured: false, latitude: 21.4669, longitude: 83.9812, population: 269575 },
  { name: 'Balasore', stateCode: 'OD', isFeatured: false, latitude: 21.4934, longitude: 86.9337, population: 144373 },
  { name: 'Puri', stateCode: 'OD', isFeatured: false, latitude: 19.8135, longitude: 85.8312, population: 200564 },
  { name: 'Baripada', stateCode: 'OD', isFeatured: false, latitude: 21.9360, longitude: 86.7410, population: 110058 },
  { name: 'Jharsuguda', stateCode: 'OD', isFeatured: false, latitude: 21.8596, longitude: 84.0041, population: 97730 },
  { name: 'Jeypore', stateCode: 'OD', isFeatured: false, latitude: 18.8576, longitude: 82.5516, population: 84830 },

  // Punjab (PB)
  { name: 'Ludhiana', stateCode: 'PB', isFeatured: true, latitude: 30.9010, longitude: 75.8573, population: 1618879 },
  { name: 'Amritsar', stateCode: 'PB', isFeatured: true, latitude: 31.6340, longitude: 74.8723, population: 1132383 },
  { name: 'Jalandhar', stateCode: 'PB', isFeatured: true, latitude: 31.3260, longitude: 75.5762, population: 862886 },
  { name: 'Patiala', stateCode: 'PB', isFeatured: false, latitude: 30.3398, longitude: 76.3869, population: 446246 },
  { name: 'Bathinda', stateCode: 'PB', isFeatured: false, latitude: 30.2110, longitude: 74.9455, population: 285788 },
  { name: 'Mohali', stateCode: 'PB', isFeatured: false, latitude: 30.7046, longitude: 76.7179, population: 146104 },
  { name: 'Hoshiarpur', stateCode: 'PB', isFeatured: false, latitude: 31.5303, longitude: 75.9133, population: 168653 },
  { name: 'Pathankot', stateCode: 'PB', isFeatured: false, latitude: 32.2680, longitude: 75.6483, population: 156314 },
  { name: 'Moga', stateCode: 'PB', isFeatured: false, latitude: 30.8142, longitude: 75.1718, population: 159897 },
  { name: 'Barnala', stateCode: 'PB', isFeatured: false, latitude: 30.3819, longitude: 75.5463, population: 116449 },
  { name: 'Batala', stateCode: 'PB', isFeatured: false, latitude: 31.8153, longitude: 75.2014, population: 156517 },
  { name: 'Kapurthala', stateCode: 'PB', isFeatured: false, latitude: 31.3813, longitude: 75.3857, population: 98916 },
  { name: 'Firozpur', stateCode: 'PB', isFeatured: false, latitude: 30.9304, longitude: 74.6180, population: 110313 },
  { name: 'Khanna', stateCode: 'PB', isFeatured: false, latitude: 30.7061, longitude: 76.2230, population: 128130 },
  { name: 'Phagwara', stateCode: 'PB', isFeatured: false, latitude: 31.2223, longitude: 75.7686, population: 117966 },

  // Rajasthan (RJ)
  { name: 'Jaipur', stateCode: 'RJ', isFeatured: true, latitude: 26.9124, longitude: 75.7873, population: 3046163 },
  { name: 'Jodhpur', stateCode: 'RJ', isFeatured: true, latitude: 26.2389, longitude: 73.0243, population: 1033918 },
  { name: 'Udaipur', stateCode: 'RJ', isFeatured: true, latitude: 24.5854, longitude: 73.7125, population: 451100 },
  { name: 'Kota', stateCode: 'RJ', isFeatured: true, latitude: 25.2138, longitude: 75.8648, population: 1001694 },
  { name: 'Ajmer', stateCode: 'RJ', isFeatured: true, latitude: 26.4499, longitude: 74.6399, population: 542321 }, // Major Egg Market
  { name: 'Bikaner', stateCode: 'RJ', isFeatured: true, latitude: 28.0229, longitude: 73.3119, population: 644406 },
  { name: 'Bhilwara', stateCode: 'RJ', isFeatured: false, latitude: 25.3463, longitude: 74.6364, population: 359483 },
  { name: 'Alwar', stateCode: 'RJ', isFeatured: false, latitude: 27.5530, longitude: 76.6346, population: 315331 },
  { name: 'Sikar', stateCode: 'RJ', isFeatured: false, latitude: 27.6094, longitude: 75.1399, population: 237532 },
  { name: 'Bharatpur', stateCode: 'RJ', isFeatured: false, latitude: 27.2170, longitude: 77.4900, population: 252342 },
  { name: 'Pali', stateCode: 'RJ', isFeatured: false, latitude: 25.7711, longitude: 73.3234, population: 230075 },
  { name: 'Sri Ganganagar', stateCode: 'RJ', isFeatured: false, latitude: 29.9038, longitude: 73.8772, population: 224532 },
  { name: 'Tonk', stateCode: 'RJ', isFeatured: false, latitude: 26.1667, longitude: 75.7833, population: 165294 },
  { name: 'Churu', stateCode: 'RJ', isFeatured: false, latitude: 28.2900, longitude: 74.9600, population: 119856 },
  { name: 'Nagaur', stateCode: 'RJ', isFeatured: false, latitude: 27.2000, longitude: 73.7300, population: 102872 },
  { name: 'Chittorgarh', stateCode: 'RJ', isFeatured: false, latitude: 24.8887, longitude: 74.6269, population: 116406 },
  { name: 'Bundi', stateCode: 'RJ', isFeatured: false, latitude: 25.4305, longitude: 75.6499, population: 104919 },

  // Sikkim (SK)
  { name: 'Gangtok', stateCode: 'SK', isFeatured: true, latitude: 27.3314, longitude: 88.6138, population: 100286 },
  { name: 'Namchi', stateCode: 'SK', isFeatured: false, latitude: 27.1678, longitude: 88.3563, population: 12194 },
  { name: 'Mangan', stateCode: 'SK', isFeatured: false, latitude: 27.4981, longitude: 88.5273, population: 4644 },
  { name: 'Gyalshing', stateCode: 'SK', isFeatured: false, latitude: 27.2882, longitude: 88.2568, population: 4013 },

  // Tamil Nadu (TN)
  { name: 'Chennai', stateCode: 'TN', isFeatured: true, latitude: 13.0827, longitude: 80.2707, population: 7088000 },
  { name: 'Namakkal', stateCode: 'TN', isFeatured: true, latitude: 11.2189, longitude: 78.1674, population: 55149 }, // Biggest Egg Production Center in India
  { name: 'Coimbatore', stateCode: 'TN', isFeatured: true, latitude: 11.0168, longitude: 76.9558, population: 1050721 },
  { name: 'Madurai', stateCode: 'TN', isFeatured: true, latitude: 9.9252, longitude: 78.1198, population: 1017865 },
  { name: 'Tiruchirappalli', stateCode: 'TN', isFeatured: true, latitude: 10.7905, longitude: 78.7047, population: 916857 },
  { name: 'Salem', stateCode: 'TN', isFeatured: true, latitude: 11.6643, longitude: 78.1460, population: 829267 },
  { name: 'Tirunelveli', stateCode: 'TN', isFeatured: false, latitude: 8.7139, longitude: 77.7567, population: 473637 },
  { name: 'Erode', stateCode: 'TN', isFeatured: true, latitude: 11.3410, longitude: 77.7172, population: 157101 }, // Important Poultry zone
  { name: 'Vellore', stateCode: 'TN', isFeatured: true, latitude: 12.9165, longitude: 79.1325, population: 504079 },
  { name: 'Thoothukudi', stateCode: 'TN', isFeatured: false, latitude: 8.7642, longitude: 78.1348, population: 237830 },
  { name: 'Dindigul', stateCode: 'TN', isFeatured: false, latitude: 10.3673, longitude: 77.9803, population: 207327 },
  { name: 'Thanjavur', stateCode: 'TN', isFeatured: false, latitude: 10.7870, longitude: 79.1378, population: 222943 },
  { name: 'Hosur', stateCode: 'TN', isFeatured: false, latitude: 12.7409, longitude: 77.8253, population: 116821 },
  { name: 'Tirupur', stateCode: 'TN', isFeatured: true, latitude: 11.1085, longitude: 77.3411, population: 877778 },
  { name: 'Karur', stateCode: 'TN', isFeatured: false, latitude: 10.9601, longitude: 78.0766, population: 70980 },
  { name: 'Krishnagiri', stateCode: 'TN', isFeatured: false, latitude: 12.5273, longitude: 78.2141, population: 71323 },

  // Telangana (TG)
  { name: 'Hyderabad', stateCode: 'TG', isFeatured: true, latitude: 17.3850, longitude: 78.4867, population: 6993262 }, // Major Egg Market
  { name: 'Warangal', stateCode: 'TG', isFeatured: true, latitude: 17.9689, longitude: 79.5941, population: 811844 },
  { name: 'Karimnagar', stateCode: 'TG', isFeatured: false, latitude: 18.4386, longitude: 79.1288, population: 261185 },
  { name: 'Nizamabad', stateCode: 'TG', isFeatured: false, latitude: 18.6705, longitude: 78.0941, population: 311152 },
  { name: 'Khammam', stateCode: 'TG', isFeatured: false, latitude: 17.2473, longitude: 80.1514, population: 184210 },
  { name: 'Mahbubnagar', stateCode: 'TG', isFeatured: false, latitude: 16.7490, longitude: 78.0003, population: 157902 },
  { name: 'Nalgonda', stateCode: 'TG', isFeatured: false, latitude: 17.0500, longitude: 79.2700, population: 135744 },
  { name: 'Adilabad', stateCode: 'TG', isFeatured: false, latitude: 19.6667, longitude: 78.5333, population: 117167 },
  { name: 'Medak', stateCode: 'TG', isFeatured: false, latitude: 18.0468, longitude: 78.2618, population: 44255 },
  { name: 'Suryapet', stateCode: 'TG', isFeatured: false, latitude: 17.1350, longitude: 79.6254, population: 106805 },
  { name: 'Siddipet', stateCode: 'TG', isFeatured: false, latitude: 18.1018, longitude: 78.8521, population: 111358 },

  // Tripura (TR)
  { name: 'Agartala', stateCode: 'TR', isFeatured: true, latitude: 23.8315, longitude: 91.2868, population: 400004 },
  { name: 'Udaipur', stateCode: 'TR', isFeatured: false, latitude: 23.5350, longitude: 91.4820, population: 32781 },
  { name: 'Dharmanagar', stateCode: 'TR', isFeatured: false, latitude: 24.3683, longitude: 92.1643, population: 40595 },
  { name: 'Kailasahar', stateCode: 'TR', isFeatured: false, latitude: 24.3211, longitude: 92.0069, population: 22405 },

  // Uttar Pradesh (UP)
  { name: 'Lucknow', stateCode: 'UP', isFeatured: true, latitude: 26.8467, longitude: 80.9462, population: 2817105 },
  { name: 'Varanasi', stateCode: 'UP', isFeatured: true, latitude: 25.3176, longitude: 82.9739, population: 1198491 },
  { name: 'Kanpur', stateCode: 'UP', isFeatured: true, latitude: 26.4499, longitude: 80.3319, population: 2765348 },
  { name: 'Agra', stateCode: 'UP', isFeatured: true, latitude: 27.1767, longitude: 78.0081, population: 1585704 },
  { name: 'Meerut', stateCode: 'UP', isFeatured: true, latitude: 28.9845, longitude: 77.7064, population: 1305429 },
  { name: 'Prayagraj', stateCode: 'UP', isFeatured: true, latitude: 25.4358, longitude: 81.8463, population: 1112544 },
  { name: 'Noida', stateCode: 'UP', isFeatured: true, latitude: 28.5355, longitude: 77.3910, population: 642381 },
  { name: 'Ghaziabad', stateCode: 'UP', isFeatured: true, latitude: 28.6692, longitude: 77.4538, population: 1648643 },
  { name: 'Gorakhpur', stateCode: 'UP', isFeatured: true, latitude: 26.7606, longitude: 83.3732, population: 673446 },
  { name: 'Moradabad', stateCode: 'UP', isFeatured: true, latitude: 28.8386, longitude: 78.7733, population: 887871 },
  { name: 'Aligarh', stateCode: 'UP', isFeatured: true, latitude: 27.8974, longitude: 78.0880, population: 874408 },
  { name: 'Bareilly', stateCode: 'UP', isFeatured: true, latitude: 28.3670, longitude: 79.4304, population: 903668 },
  { name: 'Jhansi', stateCode: 'UP', isFeatured: true, latitude: 25.4484, longitude: 78.5685, population: 505693 },
  { name: 'Mathura', stateCode: 'UP', isFeatured: false, latitude: 27.4924, longitude: 77.6737, population: 349909 },
  { name: 'Firozabad', stateCode: 'UP', isFeatured: true, latitude: 27.1500, longitude: 78.3970, population: 604214 },
  { name: 'Sultanpur', stateCode: 'UP', isFeatured: false, latitude: 26.2625, longitude: 82.0722, population: 107640 },
  { name: 'Ayodhya', stateCode: 'UP', isFeatured: false, latitude: 26.7922, longitude: 82.1998, population: 167544 },
  { name: 'Saharanpur', stateCode: 'UP', isFeatured: true, latitude: 29.9680, longitude: 77.5552, population: 705478 },
  { name: 'Muzaffarnagar', stateCode: 'UP', isFeatured: false, latitude: 29.4727, longitude: 77.7085, population: 392768 },
  { name: 'Loni', stateCode: 'UP', isFeatured: true, latitude: 28.7500, longitude: 77.2800, population: 516082 },
  { name: 'Etawah', stateCode: 'UP', isFeatured: false, latitude: 26.7725, longitude: 79.0253, population: 256838 },
  { name: 'Hapur', stateCode: 'UP', isFeatured: false, latitude: 28.7306, longitude: 77.7759, population: 262983 },
  { name: 'Bulandshahr', stateCode: 'UP', isFeatured: false, latitude: 28.4069, longitude: 77.8498, population: 222519 },
  { name: 'Shahjahanpur', stateCode: 'UP', isFeatured: false, latitude: 27.8806, longitude: 79.9133, population: 329736 },
  { name: 'Rampur', stateCode: 'UP', isFeatured: false, latitude: 28.8154, longitude: 79.0252, population: 325313 },

  // Uttarakhand (UK)
  { name: 'Dehradun', stateCode: 'UK', isFeatured: true, latitude: 30.3165, longitude: 78.0322, population: 578420 },
  { name: 'Haridwar', stateCode: 'UK', isFeatured: false, latitude: 29.9457, longitude: 78.1642, population: 228832 },
  { name: 'Haldwani', stateCode: 'UK', isFeatured: false, latitude: 29.2183, longitude: 79.5130, population: 156078 },
  { name: 'Roorkee', stateCode: 'UK', isFeatured: false, latitude: 29.8543, longitude: 77.8880, population: 118200 },
  { name: 'Rishikesh', stateCode: 'UK', isFeatured: false, latitude: 30.0869, longitude: 78.2676, population: 102138 },
  { name: 'Kashipur', stateCode: 'UK', isFeatured: false, latitude: 29.2104, longitude: 78.9619, population: 121623 },
  { name: 'Rudrapur', stateCode: 'UK', isFeatured: false, latitude: 28.9800, longitude: 79.4000, population: 154554 },
  { name: 'Nainital', stateCode: 'UK', isFeatured: false, latitude: 29.3919, longitude: 79.4542, population: 41377 },
  { name: 'Kotdwar', stateCode: 'UK', isFeatured: false, latitude: 29.7495, longitude: 78.5284, population: 33035 },

  // West Bengal (WB)
  { name: 'Kolkata', stateCode: 'WB', isFeatured: true, latitude: 22.5726, longitude: 88.3639, population: 4496694 },
  { name: 'Siliguri', stateCode: 'WB', isFeatured: true, latitude: 26.7271, longitude: 88.3953, population: 513264 },
  { name: 'Durgapur', stateCode: 'WB', isFeatured: true, latitude: 23.5204, longitude: 87.3119, population: 566517 },
  { name: 'Asansol', stateCode: 'WB', isFeatured: true, latitude: 23.6739, longitude: 86.9524, population: 1156387 },
  { name: 'Howrah', stateCode: 'WB', isFeatured: true, latitude: 22.5958, longitude: 88.2636, population: 1077075 },
  { name: 'Bardhaman', stateCode: 'WB', isFeatured: false, latitude: 23.2324, longitude: 87.8615, population: 314265 },
  { name: 'Malda', stateCode: 'WB', isFeatured: false, latitude: 25.0108, longitude: 88.1411, population: 205521 },
  { name: 'Kharagpur', stateCode: 'WB', isFeatured: false, latitude: 22.3302, longitude: 87.3237, population: 207604 },
  { name: 'Haldia', stateCode: 'WB', isFeatured: false, latitude: 22.0667, longitude: 88.0698, population: 200827 },
  { name: 'Baharampur', stateCode: 'WB', isFeatured: false, latitude: 24.1001, longitude: 88.2505, population: 195223 },
  { name: 'Krishnanagar', stateCode: 'WB', isFeatured: false, latitude: 23.4007, longitude: 88.5029, population: 181182 },
  { name: 'Raiganj', stateCode: 'WB', isFeatured: false, latitude: 25.6171, longitude: 88.1189, population: 183612 },

  // Union Territories
  { name: 'Chandigarh', stateCode: 'CH', isFeatured: true, latitude: 30.7333, longitude: 76.7794, population: 1055450 },

  { name: 'Delhi', stateCode: 'DL', isFeatured: true, latitude: 28.7041, longitude: 77.1025, population: 16787941 },
  { name: 'New Delhi', stateCode: 'DL', isFeatured: true, latitude: 28.6139, longitude: 77.2090, population: 257803 },

  { name: 'Srinagar', stateCode: 'JK', isFeatured: true, latitude: 34.0837, longitude: 74.7973, population: 1180570 },
  { name: 'Jammu', stateCode: 'JK', isFeatured: true, latitude: 32.7266, longitude: 74.8570, population: 502197 },
  { name: 'Anantnag', stateCode: 'JK', isFeatured: false, latitude: 33.7311, longitude: 75.1487, population: 109433 },
  { name: 'Baramulla', stateCode: 'JK', isFeatured: false, latitude: 34.2008, longitude: 74.3435, population: 71434 },
  { name: 'Sopore', stateCode: 'JK', isFeatured: false, latitude: 34.3000, longitude: 74.4700, population: 66963 },
  { name: 'Udhampur', stateCode: 'JK', isFeatured: false, latitude: 32.9261, longitude: 75.1328, population: 35507 },

  { name: 'Leh', stateCode: 'LA', isFeatured: true, latitude: 34.1526, longitude: 77.5771, population: 30870 },
  { name: 'Kargil', stateCode: 'LA', isFeatured: false, latitude: 34.5539, longitude: 76.1349, population: 16338 },

  { name: 'Puducherry', stateCode: 'PY', isFeatured: true, latitude: 11.9416, longitude: 79.8083, population: 244377 },
  { name: 'Karaikal', stateCode: 'PY', isFeatured: false, latitude: 10.9254, longitude: 79.8380, population: 86838 },

  { name: 'Port Blair', stateCode: 'AN', isFeatured: true, latitude: 11.6234, longitude: 92.7265, population: 108058 },

  { name: 'Silvassa', stateCode: 'DN', isFeatured: true, latitude: 20.2764, longitude: 73.0083, population: 98265 },
  { name: 'Daman', stateCode: 'DN', isFeatured: false, latitude: 20.3974, longitude: 72.8328, population: 44282 },
  { name: 'Diu', stateCode: 'DN', isFeatured: false, latitude: 20.7144, longitude: 70.9874, population: 23991 },

  { name: 'Kavaratti', stateCode: 'LD', isFeatured: true, latitude: 10.5667, longitude: 72.6369, population: 11210 }
];
