export interface Lens {
  id: string;
  domain: string;
  title: string;
  focus: string;
  checklist: string[];
}

// Each lens is a hyper-focused reviewer. The orchestrator applies all of them
// to every new document and asks: does this reveal a concern or an opening?
export const LENSES: Lens[] = [
  {
    id: 'air',
    domain: 'air',
    title: 'Air Quality / EPA analyst',
    focus:
      'Emissions from 100+ diesel backup generators and any air permitting that could delay or block operation.',
    checklist: [
      'Does the document mention diesel generators, engines, emissions, NOx, PM2.5, CO, HAPs, or backup power?',
      'Is there any reference to a Maricopa County Air Quality Department or ADEQ permit, application, or public notice?',
      'Are potential-to-emit thresholds, minor/major source classification, or synthetic minor limits discussed?',
      'Is there a public comment period or notice date mentioned? Capture exact dates.',
      'Does anything conflict with NFPA 110 generator testing frequency or runtime assumptions?',
    ],
  },
  {
    id: 'acoustic',
    domain: 'acoustic',
    title: 'Acoustic / noise analyst',
    focus:
      'Compliance with the Phoenix noise ordinance given 24/7 cooling + generators and the amphitheater terrain effect.',
    checklist: [
      'Does the document reference noise, decibels, dBA, sound, acoustic studies, or the Phoenix noise ordinance?',
      'Is there any noise study on the record, or an admission that none exists?',
      'Are cooling systems, chillers, or generator noise levels quantified?',
      'Does it ignore terrain (South Mountain amphitheater effect) or temperature inversions?',
    ],
  },
  {
    id: 'water',
    domain: 'water',
    title: 'Water / stormwater analyst',
    focus:
      'Water/wastewater service, cooling water demand, AZPDES stormwater, dust control during grading.',
    checklist: [
      'Does the document discuss water usage, cooling water, wastewater, or water service capacity?',
      'Is there any AZPDES construction stormwater permit, drainage, or retention detail?',
      'Are dust-control (Maricopa County Rule 310) obligations referenced during grading?',
      'Any infrastructure upgrades whose cost may be recovered from ratepayers?',
    ],
  },
  {
    id: 'fire',
    domain: 'fire',
    title: 'Fire / hazmat analyst',
    focus:
      'On-site diesel fuel storage, fire code, hazardous materials, substation fire access.',
    checklist: [
      'Does the document reference diesel fuel storage volumes, tanks, or hazardous materials?',
      'Are fire code, NFPA, fire access, or emergency response items discussed?',
      'Is substation fencing, setback, or fire safety addressed?',
    ],
  },
  {
    id: 'legal',
    domain: 'legal',
    title: 'Legal / procedural analyst',
    focus:
      'Procedural defects, permit deficiencies, notice requirements, plat/site-plan denials. Output leads for the attorney, never advice.',
    checklist: [
      'Does the document show a denial, correction notice, deficiency, or unmet stipulation?',
      'Are there public notice, hearing, or comment requirements that may not have been met?',
      'Does it reference the Final Plat, site plan, building permits, or case 23-1632 status?',
      'Are there deadlines, expiration dates, or stipulation timeframes the developer must meet?',
      'Is there anything an attorney should review further? Frame as a QUESTION or LEAD, not advice.',
    ],
  },
];
