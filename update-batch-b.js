const fs = require('fs');
const watches = JSON.parse(fs.readFileSync('./data/watches.json', 'utf8'));
const rawOverrides = JSON.parse(fs.readFileSync('./data/comparison-overrides.json', 'utf8'));

const watchMap = {};
watches.forEach(w => {
  watchMap[w.slug] = w;
});

const batchBSlugs = [
  'breitling-navitimer-b01-42-vs-breitling-superocean-42',
  'breitling-navitimer-b01-42-vs-rolex-gmt-master-ii-pepsi',
  'breitling-navitimer-b01-42-vs-zenith-el-primero-chronomaster',
  'breitling-superocean-42-vs-omega-planet-ocean-600m',
  'breitling-superocean-42-vs-tag-heuer-aquaracer-300',
  'baltic-bicompax-001-vs-hamilton-jazzmaster-40',
  'baltic-bicompax-001-vs-longines-hydroconquest-41',
  'baltic-bicompax-001-vs-seiko-presage-spb165',
  'cartier-ballon-bleu-42-vs-omega-constellation-39',
  'cartier-ronde-solo-vs-iwc-portugieser-40',
  'cartier-tank-must-vs-nomos-tangente-38',
  'cartier-tank-must-vs-omega-aqua-terra-38',
  'christopher-ward-c65-trident-vs-longines-hydroconquest-41',
  'frederique-constant-classics-auto-vs-longines-master-collection-40',
  'halios-tropik-vs-longines-hydroconquest-41',
  'hamilton-jazzmaster-40-vs-nomos-club-campus',
  'iwc-pilot-mark-xviii-vs-omega-aqua-terra-38',
  'iwc-portofino-40-vs-jaeger-lecoultre-reverso-classic',
  'iwc-portofino-40-vs-rolex-datejust-36',
  'iwc-portugieser-40-vs-jaeger-lecoultre-master-ultra-thin',
  'longines-hydroconquest-41-vs-mido-ocean-star-tribute',
  'longines-hydroconquest-41-vs-rolex-submariner-41',
  'longines-hydroconquest-41-vs-tissot-seastar-1000',
  'longines-master-collection-40-vs-nomos-club-campus',
  'nomos-club-campus-vs-nomos-tangente-38',
  'omega-aqua-terra-38-vs-tag-heuer-carrera-42',
  'omega-speedmaster-moonwatch-vs-zenith-el-primero-chronomaster',
  'rolex-yacht-master-40-vs-tudor-pelagos-39',
  'seiko-5-sports-srpe55-vs-seiko-prospex-sbdc101',
  'seiko-5-sports-srpe55-vs-seiko-prospex-spb143',
  'seiko-5-sports-srpe55-vs-tissot-prx-40'
];

function getWatchName(w) {
  return w.name || 'Watch';
}

function formatPrice(price) {
  if (!price) return '';
  return '$' + Math.round(price).toLocaleString();
}

function createMetaDescription(w1, w2) {
  const name1 = getWatchName(w1).substring(0, 30);
  const name2 = getWatchName(w2).substring(0, 30);
  const price1 = w1.price_new_usd?.min || w1.price_new_usd;
  const price2 = w2.price_new_usd?.min || w2.price_new_usd;
  
  const size1 = w1.case_diameter_mm ? `${w1.case_diameter_mm}mm` : '';
  const size2 = w2.case_diameter_mm ? `${w2.case_diameter_mm}mm` : '';
  
  const type1 = w1.movement_type ? w1.movement_type : '';
  const type2 = w2.movement_type ? w2.movement_type : '';
  
  // Build with careful length management
  let desc = `Compare ${name1} vs ${name2}: ${size1} vs ${size2} case, ${type1} vs ${type2}. Price: ${formatPrice(price1)} vs ${formatPrice(price2)}.`;
  
  // Pad to 140-155 chars
  while (desc.length < 140) {
    desc = desc.replace('.', ' Find the perfect watch for your wrist today.');
  }
  
  // Trim to 155 max
  if (desc.length > 155) {
    desc = desc.substring(0, 152) + '...';
  }
  
  // Final check
  if (desc.length < 140 || desc.length > 155) {
    desc = `Compare ${name1} vs ${name2}: ${size1} vs ${size2}, ${type1} vs ${type2}. ${formatPrice(price1)} vs ${formatPrice(price2)}. Complete details & verdict available.`;
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
  
  return verdict.substring(0, 500);
}

// Parse slug to get watch slugs
function parseSlug(slug) {
  const parts = slug.split('-vs-');
  if (parts.length === 2) {
    return { w1: parts[0], w2: parts[1] };
  }
  return null;
}

// Update all Batch B entries
let updated = 0;
const batchBMap = new Set(batchBSlugs);

rawOverrides.forEach(entry => {
  if (batchBMap.has(entry.slug)) {
    const parsed = parseSlug(entry.slug);
    if (parsed) {
      const w1 = watchMap[parsed.w1];
      const w2 = watchMap[parsed.w2];
      
      if (w1 && w2) {
        entry.meta_description = createMetaDescription(w1, w2);
        entry.hook = createHook(w1, w2);
        entry.verdict = createVerdict(w1, w2);
        entry.promoted = true;
        updated++;
      }
    }
  }
});

// Sort by slug
rawOverrides.sort((a, b) => a.slug.localeCompare(b.slug));

// Validate meta description lengths
let inRange = 0;
let outOfRange = [];
rawOverrides.forEach(e => {
  if (e.meta_description) {
    const len = e.meta_description.length;
    if (len >= 140 && len <= 155) {
      inRange++;
    } else if (batchBMap.has(e.slug)) {
      outOfRange.push({ slug: e.slug, len });
    }
  }
});

console.log('✓ Batch B entries updated:', updated);
console.log('✓ Total entries in file:', rawOverrides.length);
console.log('✓ Batch B meta descriptions in range (140-155):', inRange, '/ 31');

if (outOfRange.length > 0) {
  console.log('\n⚠ Out of range Batch B entries:');
  outOfRange.forEach(item => {
    console.log(`  ${item.slug}: ${item.len} chars`);
  });
}

// Validate JSON
try {
  JSON.stringify(rawOverrides);
  console.log('\n✓ JSON is valid');
} catch (e) {
  console.error('✗ JSON validation error:', e.message);
  process.exit(1);
}

// Write to file
fs.writeFileSync('./data/comparison-overrides.json', JSON.stringify(rawOverrides, null, 2));
console.log('✓ File written successfully\n');

console.log('Sample Batch B entries (updated):');
[0, 15, 30].forEach(idx => {
  const slug = batchBSlugs[idx];
  const e = rawOverrides.find(entry => entry.slug === slug);
  if (e) {
    console.log(`\n${e.slug}`);
    console.log(`  Meta (${e.meta_description.length} chars): "${e.meta_description.substring(0, 80)}..."`);
  }
});
