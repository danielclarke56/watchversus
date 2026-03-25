const data = require('./data/comparison-overrides.json');

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

const slugMap = {};
data.forEach(entry => {
  slugMap[entry.slug] = entry;
});

let foundCount = 0;
let outOfRange = [];

batchBSlugs.forEach(slug => {
  if (slugMap[slug]) {
    foundCount++;
    const desc = slugMap[slug].meta_description;
    const len = desc.length;
    if (len < 140 || len > 155) {
      outOfRange.push({ slug, len, desc });
    }
  }
});

console.log('✓ Batch B entries found:', foundCount, '/', batchBSlugs.length);
console.log('✓ Total entries in file:', data.length);

if (outOfRange.length > 0) {
  console.log('\n⚠ Meta descriptions out of 140-155 range:');
  outOfRange.forEach(item => {
    console.log(`  ${item.slug}: ${item.len} chars`);
  });
} else {
  console.log('✓ All meta descriptions are 140-155 characters');
}

// Sample a few entries
console.log('\nSample Batch B entries:');
[0, 15, 30].forEach(idx => {
  const entry = data.find(e => e.slug === batchBSlugs[idx]);
  if (entry) {
    console.log(`\n  ${entry.slug}`);
    console.log(`  Hook: "${entry.hook}"`);
    console.log(`  Meta (${entry.meta_description.length} chars): "${entry.meta_description}"`);
  }
});
