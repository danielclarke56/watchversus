const fs = require('fs');
const watches = JSON.parse(fs.readFileSync('./data/watches.json', 'utf8'));

// Category mapping from style
const categoryMap = {
  'dive': 'dive',
  'dress': 'dress',
  'gmt': 'gmt',
  'sport': 'sport',
  'chronograph': 'chronograph',
  'field': 'field',
  'casual': 'casual',
  'vintage': 'vintage',
  'luxury': 'luxury'
};

// Function to extract tagline from description (first sentence, ~60 chars)
function extractTagline(desc) {
  const match = desc.match(/^[^.!?]+[.!?]/);
  let tagline = match ? match[0] : desc.split(' ').slice(0, 10).join(' ');
  tagline = tagline.replace(/^The /, '').trim();
  if (tagline.length > 65) {
    tagline = tagline.substring(0, 62) + '...';
  }
  return tagline.replace(/\.$/, '');
}

// Function to get all similar watch slugs for alternatives
function getAlternatives(watch, allWatches) {
  const watchBrand = watch.brand.toLowerCase();
  const watchStyle = watch.style[0] || 'sport';
  const watchPrice = (watch.price_new_usd.min + watch.price_new_usd.max) / 2;
  
  const candidates = allWatches
    .filter(w => w.slug !== watch.slug)
    .map(w => {
      let score = 0;
      // Same style
      if (w.style.includes(watchStyle)) score += 10;
      // Same brand
      if (w.brand.toLowerCase() === watchBrand) score += 5;
      // Similar price (within 50%)
      const otherPrice = (w.price_new_usd.min + w.price_new_usd.max) / 2;
      if (Math.abs(otherPrice - watchPrice) / watchPrice < 0.5) score += 3;
      return { slug: w.slug, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.slug);
  
  return candidates.length >= 2 ? candidates : candidates.concat(
    allWatches.filter(w => w.slug !== watch.slug).slice(0, 3 - candidates.length).map(w => w.slug)
  );
}

// Process watches
const processed = watches.map((watch, idx) => {
  const primary_category = categoryMap[watch.style[0]] || watch.style[0];
  const tagline = extractTagline(watch.description);
  const score = 8.0;
  const buy_again_pct = 80;
  
  // Generate pros from specs and description
  const pros = [];
  const watchStyle = watch.style[0] || 'sport';
  if (watch.power_reserve_hours >= 60) pros.push(`${watch.power_reserve_hours}-hour power reserve`);
  if (watch.water_resistance_m >= 200) pros.push(`${watch.water_resistance_m}m water resistance`);
  if (watch.movement_type === 'automatic') pros.push('Reliable automatic movement');
  if (watch.crystal === 'sapphire') pros.push('Sapphire crystal');
  if (watch.case_material.includes('Steel')) pros.push('Durable stainless steel case');
  if (watch.case_material.includes('Gold')) pros.push('Precious metal prestige');
  
  // Generate cons
  const cons = [];
  if (watch.water_resistance_m < 100) cons.push('Limited water resistance');
  if (watch.case_diameter_mm > 42) cons.push('Large case size may not suit smaller wrists');
  if (watch.price_new_usd.min > 10000) cons.push('High price point limits accessibility');
  
  const verdict = {
    who_its_for: `Anyone seeking ${watchStyle} watch performance with Swiss craftsmanship.`,
    who_should_skip: 'Those prioritizing affordability or minimalist aesthetics.',
    final_take: watch.description.substring(0, 180) + '...'
  };
  
  const alternatives = getAlternatives(watch, watches);
  
  return {
    ...watch,
    primary_category,
    tagline,
    score,
    buy_again_pct,
    pros: pros.slice(0, 5),
    cons: cons.slice(0, 3),
    verdict,
    alternatives
  };
});

// Special case: Rolex Submariner 41 (index 0)
processed[0] = {
  ...processed[0],
  primary_category: 'dive',
  tagline: 'The benchmark dive watch — nothing more, nothing less.',
  score: 9.1,
  buy_again_pct: 91,
  pros: [
    'Bulletproof Cal. 3235 movement with 70hr power reserve',
    'Holds value exceptionally well — often appreciates',
    'Instantly recognizable icon that never goes out of style',
    '300m water resistance in a compact, wearable package'
  ],
  cons: [
    'Retail price far below grey market reality (+30–50% over MSRP)',
    'Waiting lists make authorized dealer purchase near-impossible',
    '41mm may feel large on smaller wrists'
  ],
  verdict: {
    who_its_for: 'Anyone who wants the definitive dive watch and can afford it. Perfect for daily wear, diving, or as a long-term investment piece.',
    who_should_skip: 'Budget-conscious buyers — the grey market premium is real. Also skip if you want something rarer or more distinctive.',
    final_take: 'The Submariner 41 is the benchmark that every other dive watch is measured against. The Cal. 3235 is among the best automatic movements in the world. Yes, it\'s overpriced at grey market rates — but if you can get one at retail, it\'s a no-brainer. Even at a premium, it\'s a watch you\'ll own for life.'
  },
  alternatives: ['omega-seamaster-300m', 'tudor-black-bay-58', 'tag-heuer-aquaracer-300']
};

fs.writeFileSync('./data/watches.json', JSON.stringify(processed, null, 2));
console.log('✓ Processed ' + processed.length + ' watches with MVP fields');
