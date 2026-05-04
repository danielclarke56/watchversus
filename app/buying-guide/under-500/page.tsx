/**
 * Best Watches Under $500 — buying guide
 * Route: /buying-guide/under-500
 */

export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getGuideBySlug } from '@/lib/buyingGuides'
import { db } from '@/lib/db'
import { photos } from '@/lib/db/schema'
import { eq, and, ilike, or, desc } from 'drizzle-orm'
import { CTAButton } from '@/components/CTAButton'
import { PhotoCarousel } from '@/components/guide/PhotoCarousel'
import { FaqAccordion } from '@/components/guide/FaqAccordion'
import { RankingTable } from '@/components/guide/RankingTable'
import { t, i } from '@/lib/styles'

// Converts a brand name to its /brand/[brand] href.
function toBrandHref(brand: string): string {
  return '/brand/' + encodeURIComponent(brand.toLowerCase())
}

// Official manufacturer URLs — international homepages or collection pages, no regional paths.
const MANUFACTURER_URLS: Record<string, string> = {
  // Seiko — global-en site, collection-level pages
  'Seiko 5 Sports SRPD55':              'https://www.seikowatches.com/global-en/products/5sports',
  'Seiko 5 Sports GMT SSK001':          'https://www.seikowatches.com/global-en/products/5sports',
  'Seiko 5 Sports GMT':                 'https://www.seikowatches.com/global-en/products/5sports',
  'Seiko SRPG43 (5 Sports Field)':      'https://www.seikowatches.com/global-en/products/5sports',
  'Seiko Prospex Alpinist SPB117J1':    'https://www.seikowatches.com/global-en/products/prospex',
  'Seiko Prospex Alpinist':             'https://www.seikowatches.com/global-en/products/prospex',
  'Seiko Presage SRPE41':               'https://www.seikowatches.com/global-en/products/presage',
  'Seiko Presage Cocktail Time SRPE41': 'https://www.seikowatches.com/global-en/products/presage',
  'Seiko Presage Cocktail Time':        'https://www.seikowatches.com/global-en/products/presage',
  'Seiko SNE109 Solar':                 'https://www.seikowatches.com/global-en/products/solar',
  'Seiko SKX007 (pre-owned)':           'https://www.seikowatches.com/global-en/products/prospex',
  // Orient — orient-watch.com/en/ is the international English hub
  'Orient Bambino RA-AC0001S':          'https://orient-watch.com/en/orient/collection/classic/',
  'Orient Bambino':                     'https://orient-watch.com/en/orient/collection/classic/',
  'Orient Kamasu RA-AA0002L':           'https://orient-watch.com/en/orient/collection/sports/',
  'Orient Kamasu':                      'https://orient-watch.com/en/orient/collection/sports/',
  'Orient Mako II':                     'https://orient-watch.com/en/orient/collection/sports/',
  'Orient Star RE-AV0B01Y':             'https://orient-watch.com/en/orientstar/',
  // Citizen — global site (auto-redirects by locale)
  'Citizen Tsuyosa NJ0150-81L':         'https://www.citizenwatch-global.com/collection/tsuyosa/',
  'Citizen Tsuyosa':                    'https://www.citizenwatch-global.com/collection/tsuyosa/',
  'Citizen Promaster Diver BN0150-28E': 'https://www.citizenwatch-global.com/collection/promaster/',
  'Citizen Promaster Diver':            'https://www.citizenwatch-global.com/collection/promaster/',
  'Citizen NB1050-59A':                 'https://www.citizenwatch-global.com/collection/classic/',
  'Citizen NB1050':                     'https://www.citizenwatch-global.com/collection/classic/',
  // Tissot — international site (en-en serves as global fallback)
  'Tissot PRX T137.210.11.031.00':      'https://www.tissotwatches.com/en-en/tissot-prx.html',
  'Tissot PRX T137.210':                'https://www.tissotwatches.com/en-en/tissot-prx.html',
  'Tissot PRX (quartz)':                'https://www.tissotwatches.com/en-en/tissot-prx.html',
  // Hamilton — international site
  'Hamilton Khaki Field H69439931':     'https://www.hamiltonwatch.com/en-intl/collection/khaki-field.html',
  'Hamilton Khaki Field':               'https://www.hamiltonwatch.com/en-intl/collection/khaki-field.html',
  // Casio — international G-Shock and standard product pages
  'Casio G-Shock DW-5600E-1V':          'https://www.casio.com/intl/watches/gshock/',
  'Casio G-Shock DW-5600E':             'https://www.casio.com/intl/watches/gshock/',
  'Casio GA-2100 "CasiOak"':            'https://www.casio.com/intl/watches/gshock/',
  'Casio GA-2100':                      'https://www.casio.com/intl/watches/gshock/',
  'Casio MDV-106':                      'https://www.casio.com/intl/watches/casio/',
  // Timex — international site
  'Timex Marlin TW2T22700':             'https://www.timex.com/collections/marlin',
  'Timex MK1 Steel':                    'https://www.timex.com/collections/mk1',
  'Q Timex GMT':                        'https://www.timex.com/collections/q-timex',
  // Glycine — international site
  'Glycine Combat Sub':                 'https://www.glycine-watch.ch/collections/combat-sub',
  // Baltic — ships internationally from its own site
  'Baltic HMS 001':                     'https://baltic-watches.com/en/collections/hms',
  // Lorier — ships internationally from its own site
  'Lorier Falcon':                      'https://lorierwatch.com/collections/falcon',
  // Certina — international site
  'Certina DS-1 Big Size Powermatic':   'https://www.certina.com/en/collection/ds-action',
  'Certina DS Action Diver':            'https://www.certina.com/en/collection/ds-action',
  // Vostok — international English site
  'Vostok Amphibia':                    'https://vostok-watches.ru/en/catalog/amphibia/',
  // Longines — international site
  'Longines Ultra-Chron (pre-owned)':   'https://www.longines.com/en-intl/watches/collection/heritage.html',
}



export const metadata: Metadata = {
  title: 'Best Watches Under $500 — Community Ranking & Buying Guide | Watchems',
  description: 'The 50 most recommended watches under $500, ranked by community research across r/Watches, WatchUSeek, and 17 other sources. Specs, FAQs, and honest trade-offs.',
  alternates: { canonical: 'https://watchems.com/buying-guide/under-500' },
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP 50 RANKING — community + trusted source consensus
// ─────────────────────────────────────────────────────────────────────────────

interface RankEntry {
  rank: number
  brand: string
  model: string
  price: string
  caseSize: string
  thickness: string
  movement: string
  crystal: string
  wr: string
  url?: string
}

const RANKING: RankEntry[] = [
  { rank: 1,  brand: 'Seiko',    model: 'Seiko 5 Sports SRPD55',              price: '~$350', caseSize: '42.5mm', thickness: '13mm',    movement: 'Auto (4R36)',        crystal: 'Hardlex',  wr: '100m',  url: 'https://www.seikowatches.com/global-en/products/5sports' },
  { rank: 2,  brand: 'Orient',   model: 'Orient Bambino (V1–V6)',             price: '~$180', caseSize: '38–42mm', thickness: '11mm',   movement: 'Auto (F6724)',        crystal: 'Mineral',  wr: '30m',   url: 'https://orient-watch.com/en/orient/collection/classic/' },
  { rank: 3,  brand: 'Seiko',    model: 'Seiko Prospex Turtle SRPE93',        price: '~$425', caseSize: '45mm',   thickness: '13.5mm',  movement: 'Auto (4R36)',        crystal: 'Hardlex',  wr: '200m',  url: 'https://www.seikowatches.com/global-en/products/prospex' },
  { rank: 4,  brand: 'Hamilton', model: 'Hamilton Khaki Field Mechanical',    price: '~$495', caseSize: '38mm',   thickness: '10mm',    movement: 'Manual (H-50, 80hr)',crystal: 'Sapphire', wr: '50m',   url: 'https://www.hamiltonwatch.com/en-intl/collection/khaki-field.html' },
  { rank: 5,  brand: 'Orient',   model: 'Orient Kamasu RA-AA0002L',           price: '~$200', caseSize: '41.8mm', thickness: '12.5mm',  movement: 'Auto (F6922)',        crystal: 'Sapphire', wr: '200m',  url: 'https://orient-watch.com/en/orient/collection/sports/' },
  { rank: 6,  brand: 'Seiko',    model: 'Seiko Presage Cocktail Time SRPE41', price: '~$350', caseSize: '40.5mm', thickness: '12.5mm',  movement: 'Auto (4R35)',         crystal: 'Sapphire', wr: '50m',   url: 'https://www.seikowatches.com/global-en/products/presage' },
  { rank: 7,  brand: 'Casio',    model: 'Casio G-Shock DW-5600E',             price: '~$70',  caseSize: '42.8mm', thickness: '13.4mm',  movement: 'Quartz (3232)',       crystal: 'Mineral',  wr: '200m',  url: 'https://www.casio.com/intl/watches/gshock/' },
  { rank: 8,  brand: 'Tissot',   model: 'Tissot PRX Quartz',                  price: '~$350', caseSize: '40mm',   thickness: '10.5mm',  movement: 'Quartz (ETA F06)',    crystal: 'Sapphire', wr: '100m',  url: 'https://www.tissotwatches.com/en-en/tissot-prx.html' },
  { rank: 9,  brand: 'Seiko',    model: 'Seiko 5 SNK809',                     price: '~$90',  caseSize: '37mm',   thickness: '11mm',    movement: 'Auto (7S26)',         crystal: 'Hardlex',  wr: '30m',   url: 'https://www.seikowatches.com/global-en/products/5sports' },
  { rank: 10, brand: 'Citizen',  model: 'Citizen Promaster Diver BN0150',     price: '~$295', caseSize: '44mm',   thickness: '14mm',    movement: 'Solar (E168)',        crystal: 'Mineral',  wr: '200m',  url: 'https://www.citizenwatch-global.com/collection/promaster/' },
  { rank: 11, brand: 'Orient',   model: 'Orient Mako II',                     price: '~$175', caseSize: '41.5mm', thickness: '13mm',    movement: 'Auto (F6922)',        crystal: 'Mineral',  wr: '200m',  url: 'https://orient-watch.com/en/orient/collection/sports/' },
  { rank: 12, brand: 'Casio',    model: 'Casio G-Shock GA-2100 CasiOak',      price: '~$99',  caseSize: '45.4mm', thickness: '11.8mm',  movement: 'Ana-digi quartz',     crystal: 'Mineral',  wr: '200m',  url: 'https://www.casio.com/intl/watches/gshock/' },
  { rank: 13, brand: 'Seiko',    model: 'Seiko Prospex Solar SNE549',         price: '~$425', caseSize: '38.5mm', thickness: '12mm',    movement: 'Solar (V157)',        crystal: 'Sapphire', wr: '200m',  url: 'https://www.seikowatches.com/global-en/products/prospex' },
  { rank: 14, brand: 'Timex',    model: 'Timex Marlin Automatic',             price: '~$220', caseSize: '40mm',   thickness: '11mm',    movement: 'Auto (Miyota 8215)',  crystal: 'Acrylic',  wr: '30m',   url: 'https://www.timex.com/collections/marlin' },
  { rank: 15, brand: 'Vostok',   model: 'Vostok Amphibia',                    price: '~$90',  caseSize: '40mm',   thickness: '13mm',    movement: 'Auto (2416B)',        crystal: 'Acrylic',  wr: '200m',  url: 'https://vostok-watches.ru/en/catalog/amphibia/' },
  { rank: 16, brand: 'Citizen',  model: 'Citizen Tsuyosa NJ0150',             price: '~$450', caseSize: '40mm',   thickness: '11.8mm',  movement: 'Auto (Miyota 8210)',  crystal: 'Sapphire', wr: '100m',  url: 'https://www.citizenwatch-global.com/collection/tsuyosa/' },
  { rank: 17, brand: 'Hamilton', model: 'Hamilton Khaki Field Auto',          price: '~$495', caseSize: '38mm',   thickness: '10mm',    movement: 'Auto (H-10, 80hr)',   crystal: 'Sapphire', wr: '100m',  url: 'https://www.hamiltonwatch.com/en-intl/collection/khaki-field.html' },
  { rank: 18, brand: 'Seiko',    model: 'Seiko 5 Sports GMT SSK001',          price: '~$495', caseSize: '42.5mm', thickness: '14mm',    movement: 'Auto GMT (4R34)',     crystal: 'Hardlex',  wr: '100m',  url: 'https://www.seikowatches.com/global-en/products/5sports' },
  { rank: 19, brand: 'Seiko',    model: 'Seiko Prospex Samurai SRPB51',       price: '~$395', caseSize: '43.8mm', thickness: '13mm',    movement: 'Auto (4R35)',         crystal: 'Hardlex',  wr: '200m',  url: 'https://www.seikowatches.com/global-en/products/prospex' },
  { rank: 20, brand: 'Orient',   model: 'Orient Sun and Moon RA-AK0001S',     price: '~$250', caseSize: '42mm',   thickness: '13mm',    movement: 'Auto (F6B24)',        crystal: 'Mineral',  wr: '50m',   url: 'https://orient-watch.com/en/orient/collection/classic/' },
  { rank: 21, brand: 'Baltic',   model: 'Baltic HMS 002',                     price: '~$390', caseSize: '36.5mm', thickness: '10.5mm',  movement: 'Auto (Miyota 8215)',  crystal: 'Sapphire', wr: '50m',   url: 'https://baltic-watches.com/en/collections/hms' },
  { rank: 22, brand: 'Timex',    model: 'Q Timex GMT',                        price: '~$199', caseSize: '38mm',   thickness: '11mm',    movement: 'Quartz GMT',          crystal: 'Acrylic',  wr: '50m',   url: 'https://www.timex.com/collections/q-timex' },
  { rank: 23, brand: 'Seiko',    model: 'Seiko Prospex Mini Tuna SRPH77',     price: '~$420', caseSize: '44mm',   thickness: '13mm',    movement: 'Auto (4R35)',         crystal: 'Hardlex',  wr: '200m',  url: 'https://www.seikowatches.com/global-en/products/prospex' },
  { rank: 24, brand: 'Bulova',   model: 'Bulova Hack Watch 96A245',           price: '~$350', caseSize: '38mm',   thickness: '10mm',    movement: 'Auto (Miyota 82S0)',  crystal: 'Mineral',  wr: '30m',   url: 'https://www.bulova.com/collections/hack-watch' },
  { rank: 25, brand: 'Seagull',  model: 'Seagull 1963 Chronograph',           price: '~$250', caseSize: '38mm',   thickness: '13mm',    movement: 'Manual chrono (ST19)',crystal: 'Sapphire', wr: '30m',   url: 'https://www.seagullwatches.com' },
  { rank: 26, brand: 'Swatch',   model: 'Swatch Sistem51',                    price: '~$200', caseSize: '42mm',   thickness: '11mm',    movement: 'Auto (Sistem51, 90hr)',crystal: 'Plexiglas',wr: '30m',   url: 'https://www.swatch.com/en-intl/collections/sistem51.html' },
  { rank: 27, brand: 'Casio',    model: 'Casio MDV-106 Duro',                 price: '~$55',  caseSize: '44.2mm', thickness: '11mm',    movement: 'Quartz (2784)',       crystal: 'Mineral',  wr: '200m',  url: 'https://www.casio.com/intl/watches/casio/' },
  { rank: 28, brand: 'Lorier',   model: 'Lorier Neptune III',                 price: '~$499', caseSize: '39mm',   thickness: '12mm',    movement: 'Auto (Miyota 90S5)',  crystal: 'Hesalite', wr: '200m',  url: 'https://lorierwatch.com/collections/neptune' },
  { rank: 29, brand: 'Citizen',  model: 'Citizen Promaster Nighthawk BJ7000', price: '~$250', caseSize: '42mm',   thickness: '12mm',    movement: 'Solar GMT (E168)',    crystal: 'Mineral',  wr: '200m',  url: 'https://www.citizenwatch-global.com/collection/promaster/' },
  { rank: 30, brand: 'Tissot',   model: 'Tissot Seastar 1000 Quartz',         price: '~$450', caseSize: '40mm',   thickness: '11.9mm',  movement: 'Quartz (ETA)',        crystal: 'Sapphire', wr: '300m',  url: 'https://www.tissotwatches.com/en-en/tissot-t-sport-seastar-1000.html' },
  { rank: 31, brand: 'Orient',   model: 'Orient Ray II',                      price: '~$160', caseSize: '41.5mm', thickness: '12.5mm',  movement: 'Auto (F6922)',        crystal: 'Mineral',  wr: '200m',  url: 'https://orient-watch.com/en/orient/collection/sports/' },
  { rank: 32, brand: 'Nodus',    model: 'Nodus Sector Field',                 price: '~$450', caseSize: '38mm',   thickness: '11mm',    movement: 'Auto (NH38)',         crystal: 'Sapphire', wr: '150m',  url: 'https://noduswatch.com/collections/field-watch' },
  { rank: 33, brand: 'Casio',    model: 'Casio GW-M5610 G-Shock',            price: '~$99',  caseSize: '42.8mm', thickness: '11.9mm',  movement: 'Solar/Radio quartz',  crystal: 'Mineral',  wr: '200m',  url: 'https://www.casio.com/intl/watches/gshock/' },
  { rank: 34, brand: 'Marathon', model: 'Marathon General Purpose Mechanical',price: '~$420', caseSize: '34mm',   thickness: '12mm',    movement: 'Auto (NH35A)',        crystal: 'Sapphire', wr: '30m',   url: 'https://www.marathonwatch.com/collections/general-purpose-mechanical' },
  { rank: 35, brand: 'Spinnaker',model: 'Spinnaker Bradner',                  price: '~$290', caseSize: '42mm',   thickness: '12mm',    movement: 'Auto (NH35)',         crystal: 'Sapphire', wr: '180m',  url: 'https://www.spinnaker-watches.com/collections/bradner' },
  { rank: 36, brand: 'Laco',     model: 'Laco Aachen Pilot',                  price: '~$450', caseSize: '40mm',   thickness: '10mm',    movement: 'Auto (Miyota 821A)',  crystal: 'Sapphire', wr: '50m',   url: 'https://www.laco.de/en/collections/pilot-watches' },
  { rank: 37, brand: 'Tissot',   model: 'Tissot Everytime Swissmatic',        price: '~$450', caseSize: '40mm',   thickness: '9.7mm',   movement: 'Auto (Swissmatic)',   crystal: 'Sapphire', wr: '30m',   url: 'https://www.tissotwatches.com/en-en/tissot-t-classic-everytime-swissmatic.html' },
  { rank: 38, brand: 'Sternglas',model: 'Sternglas Naos Automatik',           price: '~$445', caseSize: '38mm',   thickness: '10mm',    movement: 'Auto (Miyota 821A)',  crystal: 'Sapphire', wr: '50m',   url: 'https://www.sternglas.de/en/collections/naos' },
  { rank: 39, brand: 'Orient',   model: 'Orient Maestro',                     price: '~$200', caseSize: '40mm',   thickness: '11mm',    movement: 'Auto (F6722)',        crystal: 'Mineral',  wr: '100m',  url: 'https://orient-watch.com/en/orient/collection/classic/' },
  { rank: 40, brand: 'Traska',   model: 'Traska Freediver',                   price: '~$400', caseSize: '40mm',   thickness: '12mm',    movement: 'Auto (NH35)',         crystal: 'Sapphire', wr: '200m',  url: 'https://traskawatch.com/collections/freediver' },
  { rank: 41, brand: 'Glycine',  model: 'Glycine Combat Sub',                 price: '~$350', caseSize: '42mm',   thickness: '13mm',    movement: 'Auto (ETA 2824)',     crystal: 'Sapphire', wr: '200m',  url: 'https://www.glycine-watch.ch/collections/combat-sub' },
  { rank: 42, brand: 'Lorier',   model: 'Lorier Falcon III',                  price: '~$499', caseSize: '36mm',   thickness: '11mm',    movement: 'Auto (Miyota 90S5)',  crystal: 'Acrylic',  wr: '100m',  url: 'https://lorierwatch.com/collections/falcon' },
  { rank: 43, brand: 'Vaer',     model: 'Vaer A5 Field',                      price: '~$399', caseSize: '40mm',   thickness: '11mm',    movement: 'Auto (Miyota 9015)',  crystal: 'Sapphire', wr: '100m',  url: 'https://vaerwatches.com/collections/field' },
  { rank: 44, brand: 'Tissot',   model: 'Tissot PRX Powermatic 80',           price: '~$495', caseSize: '40mm',   thickness: '10.65mm', movement: 'Auto (PM80)',         crystal: 'Sapphire', wr: '100m',  url: 'https://www.tissotwatches.com/en-en/tissot-prx.html' },
  { rank: 45, brand: 'Certina',  model: 'Certina DS Action Diver',            price: '~$495', caseSize: '43mm',   thickness: '13.9mm',  movement: 'Auto (PM80)',         crystal: 'Sapphire', wr: '300m',  url: 'https://www.certina.com/en/collection/ds-action' },
  { rank: 46, brand: 'Zelos',    model: 'Zelos Hammerhead Bronze',            price: '~$449', caseSize: '44mm',   thickness: '15mm',    movement: 'Auto (NH35)',         crystal: 'Acrylic',  wr: '1000m', url: 'https://zeloswatches.com/collections/hammerhead' },
  { rank: 47, brand: 'Islander', model: 'Islander Northport',                 price: '~$429', caseSize: '40.5mm', thickness: '12mm',    movement: 'Auto (Miyota 9015)',  crystal: 'Sapphire', wr: '200m',  url: 'https://islanderwatches.com/collections/northport' },
  { rank: 48, brand: 'Orient',   model: 'Orient Star Classic RE-AV0B01Y',    price: '~$450', caseSize: '40.5mm', thickness: '13.1mm',  movement: 'Auto (F6R24)',        crystal: 'Sapphire', wr: '50m',   url: 'https://orient-watch.com/en/orientstar/' },
  { rank: 49, brand: 'Hamilton', model: 'Hamilton Khaki Field Quartz',        price: '~$350', caseSize: '38mm',   thickness: '9.5mm',   movement: 'Quartz (ETA)',        crystal: 'Sapphire', wr: '50m',   url: 'https://www.hamiltonwatch.com/en-intl/collection/khaki-field.html' },
  { rank: 50, brand: 'Tissot',   model: 'Tissot Gent XL Swissmatic',         price: '~$475', caseSize: '43mm',   thickness: '11.4mm',  movement: 'Auto (ETA C15, 72hr)',crystal: 'Sapphire', wr: '100m',  url: 'https://www.tissotwatches.com/en-en/tissot-t-classic-gent-xl.html' },
]

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────

const EXTENDED_FAQ = [
  {
    question: 'Should I get an automatic or a quartz watch under $500?',
    answer: 'Quartz for function, automatic for sentiment. At this budget a $300 quartz watch typically has better finishing and accuracy than a $300 automatic — because the movement costs less to produce, more budget goes into the case and dial. A typical automatic drifts 5–15 seconds per day; a standard quartz loses maybe 15 seconds per month. If you care about the ritual of a mechanical movement — the sweeping hand, no battery, tactile winding — go automatic. If you just want a reliable daily watch, quartz wins.',
  },
  {
    question: 'Are automatics more accurate than quartz?',
    answer: 'No — this is the most common misconception in the hobby. A typical automatic at this price drifts 5–15 seconds per day; a standard quartz loses maybe 15 seconds per month. A high-accuracy solar quartz like Citizen Eco-Drive can be within seconds per year. Automatics are about craftsmanship and feel, not precision.',
  },
  {
    question: 'What movement should I look for in an automatic under $500?',
    answer: 'The most recommended movements at this price: Seiko NH35/NH38 (21,600 bph, hacking, hand-wind, globally serviceable, cheap parts), Miyota 9015 (28,800 bph for a smoother sweep, hacking, hand-wind, accurate out of the box), and ETA 2824-2 (Swiss-made, slightly more refined, but parts cost more). Community consensus: NH35 or Miyota 9015 are smarter choices than ETA 2824-2 at this budget — spending on a Swiss movement often means less budget left for case quality and crystal.',
  },
  {
    question: 'What does "hacking" mean and do I need it?',
    answer: 'Hacking means pulling the crown stops the seconds hand so you can set time precisely — without it, you can\'t synchronize to the second. Most good movements in this bracket hack. Some older Miyota 8215 variants do not. It\'s a real quality-of-life feature worth checking before buying.',
  },
  {
    question: 'Is Japanese or Swiss better at this price point?',
    answer: 'The community is near-unanimous: Japanese (Seiko, Orient, Citizen) offers better overall value below $500. A Swiss-made label adds $100–200 to the cost with diminishing material returns at this budget. Seiko\'s dial quality and finishing at $300–400 rivals Swiss watches costing $1,500. The Swiss-made premium makes more sense above $700–800.',
  },
  {
    question: 'Is the "Swiss Made" label worth paying a premium for under $500?',
    answer: '"Swiss Made" legally requires only 60% of manufacturing value to be Swiss — it does not guarantee better movement finishing, crystal quality, or case fit. Orient and Seiko at equivalent prices often have better fit and finish than similarly priced Tissot or Hamilton. The Swiss label matters more as a collector signal than a pure quality signal under $500.',
  },
  {
    question: 'What is the best automatic watch under $500?',
    answer: 'The Seiko 5 Sports SRPD55 (~$350) is the most versatile — day/date, 100m WR, proven 4R36 calibre, hundreds of colourways. For a complication, the Seiko 5 Sports GMT SSK001 (~$495) adds a mechanical GMT at a price Swiss brands charge $800+ for. For dress, the Orient Bambino (~$180). For value, the Orient Kamasu (~$200) gives sapphire crystal and 200m WR for less than the Seiko.',
  },
  {
    question: 'Seiko 5 Sports vs Orient Kamasu — which is better for a first watch?',
    answer: 'The Seiko 5 Sports is the safer all-rounder — 100m WR, day/date display, more colourway options, and a decade of enthusiast consensus behind it. The Kamasu has better dive specs (200m, sapphire, ceramic bezel) for less money, but fewer dial options. If you want a watch you can also use in water regularly, the Kamasu is arguably stronger value. If you want versatile daily wear, the Seiko.',
  },
  {
    question: 'What case size should I get for my wrist?',
    answer: 'The single most common regret-causing mistake is buying by diameter alone. Lug-to-lug (L2L) — the distance between the lug tips across your wrist — determines actual fit. A 42mm watch with long lugs can wear much larger than a 40mm with compact ones. Rough guide: L2L should be roughly 80–90% of your wrist width. For a 6-inch (155mm) wrist, 44–45mm L2L is a ceiling. Always check L2L before buying online.',
  },
  {
    question: 'What is a GADA watch and why does everyone recommend one for a first buy?',
    answer: 'GADA = "Go Anywhere, Do Anything." A watch versatile enough to wear to the office and the beach. The recommendation for first buyers is a GADA before branching into specialist watches. Top GADA picks under $500: Seiko 5 Sports SRPD series, Citizen Tsuyosa, Tissot PRX. They bridge casual and formal without looking out of place in either.',
  },
  {
    question: 'Does it matter if it has sapphire crystal vs. mineral glass?',
    answer: 'It matters for long-term ownership. Sapphire (rated 9 on Mohs hardness) resists everyday scratches from keys, desk surfaces, and sleeves that will mark mineral glass within months. Sapphire is more brittle under sharp direct impact, but wrist wear rarely produces that. Sapphire is now common under $500 — Orient, Citizen, Tissot all offer it below $400. For under $200, mineral glass is expected.',
  },
  {
    question: 'What is the difference between sapphire, Hardlex, and mineral crystal?',
    answer: 'Sapphire is the hardest watch crystal — highly scratch-resistant but chips under sharp impacts. Hardlex is Seiko\'s proprietary treated mineral glass — more impact-resistant than sapphire but scratches more easily; standard on Seiko 5 Sports and GMT lines. Mineral glass scratches under normal use. Acrylic is soft plastic — scratches easily but polishes out, used on the Timex Marlin for its vintage look. Quick rule: work with your hands → Hardlex. Want it to stay clear with minimal effort → sapphire.',
  },
  {
    question: 'How much water resistance do I actually need?',
    answer: '30m means splash-proof only — rain and handwashing, do not submerge. 50m is rated for light swimming in calm water, not active pool swimming. 100m is suitable for swimming, snorkelling, and daily beach wear — the minimum for anyone near water regularly. 200m+ is a proper dive rating. Important: WR ratings are static pressure tests — dynamic movement (jumping into a pool) multiplies effective pressure 3–4x, which is why 30m is splash-only in practice.',
  },
  {
    question: 'Does water resistance degrade over time?',
    answer: 'Yes. Gaskets and seals dry out and lose compression over time. A watch rated 100m when new may be effectively 30m after years of heavy use. Have it pressure-tested ($25–50 at any watchmaker) if you regularly swim with it, especially after any crown service or case opening. Never press pushers or unscrew the crown underwater.',
  },
  {
    question: 'Are microbrands worth the risk at this price?',
    answer: 'Mixed consensus. Reputable microbrands (Lorier, Nodus, Baltic, Traska) offer distinctive design and better specs-per-dollar than mainstream brands, often running NH35 or Miyota 9015. The risk: no heritage, uncertain longevity, and lower resale value (30–40% retained vs. 50–70% for Seiko/Tissot/Hamilton). Community advice: research the specific brand thoroughly, check owner forums, verify real customer service exists before buying.',
  },
  {
    question: 'Should I buy new or pre-owned under $500?',
    answer: 'Pre-owned is well regarded for established brands (Seiko, Tissot, Hamilton) because they have predictable service histories and strong parts availability. Buy from trusted sources — Chrono24, r/WatchExchange, or reputable local dealers — rather than unknown eBay listings. Inspect photos for crown condition (pushed-in crown can signal water damage), crystal chips, and bracelet stretch. Pre-owned Seiko references often represent significantly better value than equivalent new entry points.',
  },
  {
    question: 'Is the gray market safe for buying watches under $500?',
    answer: 'Gray-market dealers (Jomashop, etc.) sell genuine watches at 15–30% discounts by operating outside official brand distribution. Trade-off: manufacturer warranty is voided for most brands. Community consensus: for Seiko, Citizen, and Orient — where independent service costs are low — gray market is generally fine. For Tissot or Hamilton, the warranty has more practical value, so buy authorized during sales or with discount codes.',
  },
  {
    question: 'Do watches under $500 hold their value?',
    answer: 'Mostly no. Established brands (Seiko, Hamilton, Tissot) retain 50–70% of original retail on the secondary market. Microbrands retain 30–40%. No watch under $500 should be purchased as an investment. Exception: limited edition or discontinued Seiko references (SKX007, certain Presage dials) can hold or exceed retail on the pre-owned market due to strong collector demand.',
  },
  {
    question: 'Should I just save up and spend $800–1,000 instead?',
    answer: 'Honest community answer: if you know exactly what you want and the $800 watch genuinely excites you more, save up. But $500 is not a compromise — some of the most beloved watches in the hobby (Hamilton Khaki Field, Seiko 5 Sports, Tissot PRX) live in this bracket. Many experienced collectors say their most-worn watch is under $500. Buying a $300 watch you love is smarter than stretching to $1,000 on something you\'re unsure about.',
  },
  {
    question: 'What do I give up compared to the $500–$1,000 tier?',
    answer: 'Better bracelet finishing — end links, clasp mechanisms, tighter tolerances. Sapphire crystal on almost every model. COSC-certified movements (±4 sec/day). Cleaner case polishing and edge finishing. Movements in the under-$500 tier are equally durable — the differences are aesthetic, not mechanical.',
  },
  {
    question: 'Is a chronograph under $500 worth it, or is it a trap?',
    answer: 'Generally treated as a trap by experienced buyers advising newcomers. Cheap chronograph movements add complexity, cost more to service, and most people never actually use the stopwatch function. The community almost always recommends: get a clean three-hand watch first, understand what you actually use, then consider a chronograph. Exception: the Seagull 1963 Chronograph (~$250) is cited as an honest value if you genuinely want the complication.',
  },
  {
    question: 'Should I worry about bracelet quality at this price?',
    answer: 'Yes — bracelets are where most manufacturers cut corners under $500. A watch on a poor bracelet is uncomfortable and cheapens the whole package. Factor in $30–80 for an aftermarket strap or bracelet if needed. Most watches in this ranking wear better on leather, NATO, or rubber straps anyway, and changing straps is one of the most accessible ways to personalise a watch.',
  },
  {
    question: 'How do I change straps and is it difficult?',
    answer: 'Strap changing is one of the most accessible customisations in the hobby. Most watches with standard lug widths (18mm, 20mm, 22mm) accept any aftermarket strap — leather, NATO, rubber, mesh — for $15–60. You need a spring bar tool ($8–12) and a basic YouTube tutorial. Lug width is the critical spec to match when buying a replacement strap.',
  },
  {
    question: 'How often does an automatic watch need servicing and what does it cost?',
    answer: 'Manufacturer guidance is every 4–5 years. In practice, many NH35-based watches run 8–10 years without service if kept clean and away from salt water. Service cost from a qualified independent: $150–250 for a standard three-hand automatic. This is a real long-term cost to factor in. Quartz watches need only battery changes ($5–15 every 2–3 years) and are significantly cheaper to own over a decade.',
  },
  {
    question: 'Can I find a genuine ISO-certified dive watch under $500?',
    answer: 'Yes — the Citizen Promaster Diver BN0150 (~$295) is ISO 6425 certified with 200m WR and a solar movement that never needs a battery. The Glycine Combat Sub (~$350) is a Swiss-made 200m diver, though without ISO 6425 certification specifically.',
  },
  {
    question: 'Is a watch under $500 a "real" watch or will people think it\'s cheap?',
    answer: 'Most people cannot identify watch brands by sight. A well-chosen Seiko, Tissot, or Hamilton will read as a sharp, intentional accessory to anyone who isn\'t themselves a watch collector. A Hamilton Khaki Field or Seiko Presage worn with care will attract genuine compliments far beyond what the price tag warrants. The watch community explicitly discourages price-shaming — the most important thing is whether the watch means something to you.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default async function BuyingGuideV2Page() {
  const entry = getGuideBySlug('under-500')
  if (!entry) return null

  const modelConditions = entry.notableModels.map((m) => {
    const keyword = m.name.replace(m.brandName, '').trim()
    return and(ilike(photos.brandName, m.brandName), ilike(photos.modelName, `%${keyword}%`))
  })

  const allModelPhotos = await db
    .select({ id: photos.id, slug: photos.slug, url: photos.url, thumbnailUrl: photos.thumbnailUrl, brandName: photos.brandName, modelName: photos.modelName })
    .from(photos)
    .where(and(eq(photos.status, 'approved'), or(...modelConditions)))
    .orderBy(desc(photos.createdAt))
    .limit(entry.notableModels.length * 4)

  const photoByModel = new Map<string, typeof allModelPhotos[0]>()
  for (const model of entry.notableModels) {
    const keyword = model.name.replace(model.brandName, '').trim().toLowerCase()
    const match = allModelPhotos.find(
      (p) =>
        p.brandName?.toLowerCase() === model.brandName.toLowerCase() &&
        p.modelName?.toLowerCase().includes(keyword)
    )
    if (match) photoByModel.set(model.name, match)
  }

  const datePublished = new Date(`${entry.lastUpdated} 01`).toISOString().slice(0, 10)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Watches Under $500 — What the Community Actually Buys',
    description: 'What watch buyers actually recommend under $500 — community consensus across every use case, with specs and real trade-offs.',
    url: 'https://watchems.com/buying-guide/under-500-v2',
    datePublished,
    image: entry.images.hero,
    author: { '@type': 'Organization', name: 'Watchems Editorial', url: 'https://watchems.com' },
    publisher: { '@type': 'Organization', name: 'Watchems', url: 'https://watchems.com' },
    citation: entry.sources.map((s) => ({ '@type': 'CreativeWork', name: s.label, url: s.url })),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: EXTENDED_FAQ.map(({ question, answer }) => ({
      '@type': 'Question', name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main>
        <article>

          {/* ════════════════════════════════════════
              HERO
          ════════════════════════════════════════ */}
          <header>
            <div className="relative w-full h-[60vh] min-h-72 max-h-[520px] overflow-hidden bg-surfaceAlt">
              <Image src="/images/guides/under-500-hero.png" alt="Assorted automatic watches under $500 — illustrative image" fill priority className="object-cover" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <p className="absolute bottom-2 right-3 text-white/30 text-[10px] leading-none">Illustrative image — AI generated</p>
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 w-full">
                  <nav aria-label="Breadcrumb" className="text-white/50 text-xs mb-5 flex items-center gap-1.5">
                    <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/buying-guides" className="hover:text-white/80 transition-colors">Buying Guides</Link>
                    <span>/</span>
                    <span className="text-white/70">Under $500</span>
                  </nav>
                  <h1 className="font-heading text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-[1.05] mb-4">
                    Best Watches Under $500
                  </h1>
                  <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-2xl">
                    What watch buyers actually recommend under $500. No editorial agenda. Prices verified May 2026.
                  </p>
                </div>
              </div>
            </div>

            {/* Proof strip */}
            <div className="bg-surface border-b border-border">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  {[
                    { stat: '50', label: 'watches ranked' },
                    { stat: '$55–$499', label: 'price range' },
                    { stat: 'May 2026', label: 'prices verified' },
                  ].map((p) => (
                    <div key={p.label} className="flex items-baseline gap-2">
                      <span className="font-heading text-xl font-semibold text-textPrimary tabular-nums">{p.stat}</span>
                      <span className="text-xs text-textMuted">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </header>

          {/* ════════════════════════════════════════
              RANKING TABLE — top 50
          ════════════════════════════════════════ */}
          <section id="ranking" aria-labelledby="ranking-heading" className="py-16 border-b border-border">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className="mb-8">
                <h2 className={`${t.h2}`} id="ranking-heading">Top 50 watches under $500</h2>
                <p className="text-sm text-textMuted mt-1">Curated by the Watchems team based on enthusiast community research. Not a live data feed. Scroll horizontally on mobile.</p>
              </div>
              <RankingTable rows={RANKING} />
              <div className="mt-4 flex items-start gap-4 flex-wrap">
                <p className="text-xs text-textMuted leading-relaxed">Specs are approximate. Click any model to view the manufacturer&apos;s page. No sponsored picks.</p>
                <details className="group shrink-0">
                  <summary className="cursor-pointer list-none flex items-center gap-1.5 text-xs font-medium text-textSecond hover:text-textPrimary transition-colors select-none">
                    <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    How this list was built
                  </summary>
                  <p className="mt-3 text-xs text-textSecond leading-relaxed max-w-lg">
                    This ranking was compiled by the Watchems team by researching recommendation frequency across 19 sources including r/Watches, WatchUSeek, Worn &amp; Wound, Teddy Baldassarre, Two Broke Watch Snobs, Fratello Watches, HiConsumption, Gear Patrol, and Time and Tide Watches. Rank order reflects how often each model appeared across those sources — not a live data pull. The list may be updated or modified by the Watchems team at any time. Last reviewed May 2026.
                  </p>
                </details>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════
              OWNER CTA
          ════════════════════════════════════════ */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <aside className="rounded-2xl bg-textPrimary px-8 py-10 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">Own one of these?</p>
                <h2 className="font-heading text-xl font-semibold text-white mb-1">Show it on your wrist.</h2>
                <p className="text-white/70 text-sm leading-relaxed max-w-md">Real owner photos help buyers make better decisions. Add yours to the Watchems community gallery.</p>
              </div>
              <div className="shrink-0">
                <Link href="/upload" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white text-textPrimary text-sm font-semibold hover:bg-white/90 transition-colors whitespace-nowrap">
                  Upload your wrist shot
                </Link>
              </div>
            </aside>
          </div>

          {/* ════════════════════════════════════════
              FAQ
          ════════════════════════════════════════ */}
          <section id="faq" aria-labelledby="faq-heading" className="py-16 border-b border-border [scroll-margin-top:108px]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className={`${t.h2} mb-8`} id="faq-heading">Common questions</h2>
              <FaqAccordion items={EXTENDED_FAQ} />
            </div>
          </section>

          {/* ════════════════════════════════════════
              COMMUNITY PHOTOS
          ════════════════════════════════════════ */}
          {allModelPhotos.length > 0 && (
            <section aria-label="Community photos" className="py-16 border-b border-border bg-surfaceAlt">
              <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="mb-6">
                  <h2 className={`${t.h2}`}>From the community</h2>
                  <p className="text-sm text-textMuted mt-1">Real wrist shots submitted by Watchems members</p>
                </div>
                <PhotoCarousel modelName="" photos={allModelPhotos} />
                <div className="mt-6">
                  <CTAButton priority="primary" size="sm" href="/upload">Upload yours</CTAButton>
                </div>
              </div>
            </section>
          )}

          {/* ════════════════════════════════════════
              EXPLORE + OWNER CTA
          ════════════════════════════════════════ */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12">

            {entry.internalLinks.length > 0 && (
              <aside aria-label="Explore related content">
                <p className="text-xs font-semibold text-textMuted uppercase tracking-widest mb-4">Explore on Watchems</p>
                <nav aria-label="Related pages">
                  <ul className="flex flex-wrap gap-2">
                    {entry.internalLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className={i.pill}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            <footer className="flex items-center justify-between gap-4 border-t border-border pt-6">
              <Link href="/buying-guides" className={`${t.meta} hover:text-textSecond transition-colors inline-flex items-center gap-2`}>
                <span aria-hidden="true">←</span>
                <span>All buying guides</span>
              </Link>
              <Link href="/buying-guide/under-500" className={`${t.meta} hover:text-textSecond transition-colors`}>
                View v1 →
              </Link>
            </footer>
          </div>

        </article>
      </main>
    </>
  )
}
