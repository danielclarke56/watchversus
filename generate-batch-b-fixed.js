const watches = require('./data/watches.json');
const overrides = require('./data/comparison-overrides.json');

const watchMap = {};
watches.forEach(w => {
  watchMap[w.slug] = w;
});

const batchB = [
  { slug: 'breitling-navitimer-b01-42-vs-breitling-superocean-42', w1: 'breitling-navitimer-b01-42', w2: 'breitling-superocean-42' },
  { slug: 'breitling-navitimer-b01-42-vs-rolex-gmt-master-ii-pepsi', w1: 'breitling-navitimer-b01-42', w2: 'rolex-gmt-master-ii-pepsi' },
  { slug: 'breitling-navitimer-b01-42-vs-zenith-el-primero-chronomaster', w1: 'breitling-navitimer-b01-42', w2: 'zenith-el-primero-chronomaster' },
  { slug: 'breitling-superocean-42-vs-omega-planet-ocean-600m', w1: 'breitling-superocean-42', w2: 'omega-planet-ocean-600m' },
  { slug: 'breitling-superocean-42-vs-tag-heuer-aquaracer-300', w1: 'breitling-superocean-42', w2: 'tag-heuer-aquaracer-300' },
  { slug: 'baltic-bicompax-001-vs-hamilton-jazzmaster-40', w1: 'baltic-bicompax-001', w2: 'hamilton-jazzmaster-40' },
  { slug: 'baltic-bicompax-001-vs-longines-hydroconquest-41', w1: 'baltic-bicompax-001', w2: 'longines-hydroconquest-41' },
  { slug: 'baltic-bicompax-001-vs-seiko-presage-spb165', w1: 'baltic-bicompax-001', w2: 'seiko-presage-spb165' },
  { slug: 'cartier-ballon-bleu-42-vs-omega-constellation-39', w1: 'cartier-ballon-bleu-42', w2: 'omega-constellation-39' },
  { slug: 'cartier-ronde-solo-vs-iwc-portugieser-40', w1: 'cartier-ronde-solo', w2: 'iwc-portugieser-40' },
  { slug: 'cartier-tank-must-vs-nomos-tangente-38', w1: 'cartier-tank-must', w2: 'nomos-tangente-38' },
  { slug: 'cartier-tank-must-vs-omega-aqua-terra-38', w1: 'cartier-tank-must', w2: 'omega-aqua-terra-38' },
  { slug: 'christopher-ward-c65-trident-vs-longines-hydroconquest-41', w1: 'christopher-ward-c65-trident', w2: 'longines-hydroconquest-41' },
  { slug: 'frederique-constant-classics-auto-vs-longines-master-collection-40', w1: 'frederique-constant-classics-auto', w2: 'longines-master-collection-40' },
  { slug: 'halios-tropik-vs-longines-hydroconquest-41', w1: 'halios-tropik', w2: 'longines-hydroconquest-41' },
  { slug: 'hamilton-jazzmaster-40-vs-nomos-club-campus', w1: 'hamilton-jazzmaster-40', w2: 'nomos-club-campus' },
  { slug: 'iwc-pilot-mark-xviii-vs-omega-aqua-terra-38', w1: 'iwc-pilot-mark-xviii', w2: 'omega-aqua-terra-38' },
  { slug: 'iwc-portofino-40-vs-jaeger-lecoultre-reverso-classic', w1: 'iwc-portofino-40', w2: 'jaeger-lecoultre-reverso-classic' },
  { slug: 'iwc-portofino-40-vs-rolex-datejust-36', w1: 'iwc-portofino-40', w2: 'rolex-datejust-36' },
  { slug: 'iwc-portugieser-40-vs-jaeger-lecoultre-master-ultra-thin', w1: 'iwc-portugieser-40', w2: 'jaeger-lecoultre-master-ultra-thin' },
  { slug: 'longines-hydroconquest-41-vs-mido-ocean-star-tribute', w1: 'longines-hydroconquest-41', w2: 'mido-ocean-star-tribute' },
  { slug: 'longines-hydroconquest-41-vs-rolex-submariner-41', w1: 'longines-hydroconquest-41', w2: 'rolex-submariner-41' },
  { slug: 'longines-hydroconquest-41-vs-tissot-seastar-1000', w1: 'longines-hydroconquest-41', w2: 'tissot-seastar-1000' },
  { slug: 'longines-master-collection-40-vs-nomos-club-campus', w1: 'longines-master-collection-40', w2: 'nomos-club-campus' },
  { slug: 'nomos-club-campus-vs-nomos-tangente-38', w1: 'nomos-club-campus', w2: 'nomos-tangente-38' },
  { slug: 'omega-aqua-terra-38-vs-tag-heuer-carrera-42', w1: 'omega-aqua-terra-38', w2: 'tag-heuer-carrera-42' },
  { slug: 'omega-speedmaster-moonwatch-vs-zenith-el-primero-chronomaster', w1: 'omega-speedmaster-moonwatch', w2: 'zenith-el-primero-chronomaster' },
  { slug: 'rolex-yacht-master-40-vs-tudor-pelagos-39', w1: 'rolex-yacht-master-40', w2: 'tudor-pelagos-39' },
  { slug: 'seiko-5-sports-srpe55-vs-seiko-prospex-sbdc101', w1: 'seiko-5-sports-srpe55', w2: 'seiko-prospex-sbdc101' },
  { slug: 'seiko-5-sports-srpe55-vs-seiko-prospex-spb143', w1: 'seiko-5-sports-srpe55', w2: 'seiko-prospex-spb143' },
  { slug: 'seiko-5-sports-srpe55-vs-tissot-prx-40', w1: 'seiko-5-sports-srpe55', w2: 'tissot-prx-40' }
];

function getWatchName(w) {
  return w.name || 'Watch';
}

function formatPrice(price) {
  if (!price) return '';
  return '$' + price.toLocaleString();
}

function createMetaDescription(w1, w2) {
  const name1 = getWatchName(w1);
  const name2 = getWatchName(w2);
  const price1 = w1.price_new_usd?.min || w1.price_new_usd;
  const price2 = w2.price_new_usd?.min || w2.price_new_usd;
  
  const size1 = w1.case_diameter_mm ? `${w1.case_diameter_mm}mm` : '';
  const size2 = w2.case_diameter_mm ? `${w2.case_diameter_mm}mm` : '';
  
  const type1 = w1.movement_type ? w1.movement_type : '';
  const type2 = w2.movement_type ? w2.movement_type : '';
  
  // Build description with enough detail to hit 140+ characters
  let desc = `Compare ${name1} vs ${name2}: ${size1} vs ${size2} cases, ${type1} vs ${type2} movements. Prices: ${formatPrice(price1)} vs ${formatPrice(price2)}. Full specs & verdict inside.`;
  
  // Adjust if too long (max 155)
  if (desc.length > 155) {
    desc = `Compare ${name1} vs ${name2}: ${size1} vs ${size2} cases, ${type1} vs ${type2} movements. Prices: ${formatPrice(price1)} vs ${formatPrice(price2)}. Get full verdict.`;
  }
  
  // Adjust if still too long or too short
  if (desc.length > 155) {
    desc = desc.substring(0, 155);
    const lastSpace = desc.lastIndexOf(' ');
    if (lastSpace > 130) {
      desc = desc.substring(0, lastSpace) + '.';
    }
  }
  
  // Pad if too short
  if (desc.length < 140) {
    desc = `Compare ${name1} vs ${name2}: ${size1} vs ${size2} cases, ${type1} vs ${type2} movements, ${formatPrice(price1)} vs ${formatPrice(price2)}. Read the detailed comparison & verdict.`;
  }
  
  return desc.substring(0, 155);
}

function createHook(w1, w2) {
  const hooks = [
    'Heavyweight Chronograph Showdown',
    'Sports Watch Battle Royale',
    'Diver vs. Dress Watch',
    'Icon Comparison',
    'Luxury Showdown',
    'Technical Specs Face-Off',
    'Price vs. Performance',
    'Classic Rivals Compared',
    'Movement Mechanics Duel',
    'Size, Style, Substance'
  ];
  
  const idx = Math.abs(w1.slug.charCodeAt(0) + w2.slug.charCodeAt(0)) % hooks.length;
  return hooks[idx];
}

function createVerdict(w1, w2) {
  const name1 = getWatchName(w1);
  const name2 = getWatchName(w2);
  const price1 = w1.price_new_usd?.min || w1.price_new_usd;
  const price2 = w2.price_new_usd?.min || w2.price_new_usd;
  const size1 = w1.case_diameter_mm || 0;
  const size2 = w2.case_diameter_mm || 0;
  const wr1 = w1.water_resistance_m || 0;
  const wr2 = w2.water_resistance_m || 0;
  
  let verdict = '';
  
  verdict += `${name1}: ${size1}mm case, ${w1.movement_type} ${w1.movement_caliber || ''}, `;
  if (price1) verdict += `${formatPrice(price1)}, `;
  verdict += `${wr1}m water resistance. `;
  
  verdict += `${name2}: ${size2}mm case, ${w2.movement_type} ${w2.movement_caliber || ''}, `;
  if (price2) verdict += `${formatPrice(price2)}, `;
  verdict += `${wr2}m water resistance. `;
  
  if (price1 && price2 && price1 < price2) {
    verdict += `Buy ${name1} if you prefer better value; buy ${name2} for premium features.`;
  } else if (price1 && price2 && price2 < price1) {
    verdict += `Buy ${name2} if you prefer better value; buy ${name1} for premium features.`;
  } else if (size1 < size2) {
    verdict += `Buy ${name1} if you prefer a smaller case; buy ${name2} for a bolder wrist presence.`;
  } else {
    verdict += `Choose based on your preferred style and specifications.`;
  }
  
  if (verdict.length > 500) {
    verdict = verdict.substring(0, 500);
  }
  
  return verdict;
}

// Generate new entries
const newEntries = [];
batchB.forEach(pair => {
  const w1 = watchMap[pair.w1];
  const w2 = watchMap[pair.w2];
  
  if (w1 && w2) {
    const entry = {
      slug: pair.slug,
      hook: createHook(w1, w2),
      meta_description: createMetaDescription(w1, w2),
      verdict: createVerdict(w1, w2),
      promoted: true
    };
    
    newEntries.push(entry);
  }
});

// Merge and deduplicate
const allEntries = [...overrides];
const slugSet = new Set(allEntries.map(e => e.slug));

newEntries.forEach(entry => {
  if (!slugSet.has(entry.slug)) {
    allEntries.push(entry);
    slugSet.add(entry.slug);
  }
});

// Sort by slug
allEntries.sort((a, b) => a.slug.localeCompare(b.slug));

console.log('New entries created:', newEntries.length);
console.log('Total entries after merge:', allEntries.length);

// Validate meta description lengths
let shortCount = 0;
let longCount = 0;
newEntries.forEach(e => {
  const len = e.meta_description.length;
  if (len < 140) shortCount++;
  if (len > 155) longCount++;
});

console.log('Meta descriptions in range (140-155): ', newEntries.length - shortCount - longCount);
if (shortCount > 0) console.log('  Too short (<140):', shortCount);
if (longCount > 0) console.log('  Too long (>155):', longCount);

// Validate JSON
try {
  JSON.stringify(allEntries);
  console.log('✓ JSON is valid');
} catch (e) {
  console.error('✗ JSON validation error:', e.message);
  process.exit(1);
}

// Write to file
const fs = require('fs');
fs.writeFileSync('./data/comparison-overrides.json', JSON.stringify(allEntries, null, 2));
console.log('✓ File written successfully');
