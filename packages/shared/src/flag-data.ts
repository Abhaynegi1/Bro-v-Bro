export interface CountryFlagItem {
  name: string;
  code: string;
}

export const COUNTRY_FLAGS: CountryFlagItem[] = [
  { name: 'Japan', code: 'jp' },
  { name: 'Brazil', code: 'br' },
  { name: 'France', code: 'fr' },
  { name: 'Germany', code: 'de' },
  { name: 'Canada', code: 'ca' },
  { name: 'Argentina', code: 'ar' },
  { name: 'India', code: 'in' },
  { name: 'United States', code: 'us' },
  { name: 'Italy', code: 'it' },
  { name: 'United Kingdom', code: 'gb' },
  { name: 'Spain', code: 'es' },
  { name: 'Australia', code: 'au' },
  { name: 'South Korea', code: 'kr' },
  { name: 'Mexico', code: 'mx' },
  { name: 'Egypt', code: 'eg' },
  { name: 'South Africa', code: 'za' },
  { name: 'Sweden', code: 'se' },
  { name: 'Switzerland', code: 'ch' },
  { name: 'Greece', code: 'gr' },
  { name: 'Netherlands', code: 'nl' },
  { name: 'Norway', code: 'no' },
  { name: 'Jamaica', code: 'jm' },
  { name: 'Turkey', code: 'tr' },
  { name: 'Portugal', code: 'pt' },
  { name: 'New Zealand', code: 'nz' },
  { name: 'Ireland', code: 'ie' },
  { name: 'Belgium', code: 'be' },
  { name: 'Denmark', code: 'dk' },
  { name: 'Finland', code: 'fi' },
  { name: 'Chile', code: 'cl' },
  { name: 'Colombia', code: 'co' },
  { name: 'Morocco', code: 'ma' },
  { name: 'Vietnam', code: 'vn' },
  { name: 'Thailand', code: 'th' },
  { name: 'Iceland', code: 'is' },
  { name: 'Croatia', code: 'hr' },
  { name: 'Poland', code: 'pl' },
  { name: 'Austria', code: 'at' },
  { name: 'Kenya', code: 'ke' },
  { name: 'Singapore', code: 'sg' },
  { name: 'Czech Republic', code: 'cz' },
  { name: 'Philippines', code: 'ph' },
  { name: 'Uruguay', code: 'uy' },
  { name: 'Cuba', code: 'cu' },
  { name: 'Nigeria', code: 'ng' },
  { name: 'Peru', code: 'pe' },
  { name: 'Ukraine', code: 'ua' },
  { name: 'Indonesia', code: 'id' },
  { name: 'Saudi Arabia', code: 'sa' },
  { name: 'Malaysia', code: 'my' },
];

export interface GeneratedFlagQuestion {
  countryName: string;
  countryCode: string;
  options: string[];
}

export function generateFlagQuestion(excludedCodes: string[] = []): GeneratedFlagQuestion {
  const eligible = COUNTRY_FLAGS.filter((c) => !excludedCodes.includes(c.code));
  const pool = eligible.length >= 4 ? eligible : COUNTRY_FLAGS;
  
  const targetIndex = Math.floor(Math.random() * pool.length);
  const target = pool[targetIndex];

  // Pick 3 unique random distractors
  const distractors: string[] = [];
  const remaining = COUNTRY_FLAGS.filter((c) => c.name !== target.name);

  while (distractors.length < 3 && remaining.length > 0) {
    const idx = Math.floor(Math.random() * remaining.length);
    distractors.push(remaining[idx].name);
    remaining.splice(idx, 1);
  }

  // Combine target and distractors and shuffle
  const options = [target.name, ...distractors].sort(() => Math.random() - 0.5);

  return {
    countryName: target.name,
    countryCode: target.code,
    options,
  };
}
