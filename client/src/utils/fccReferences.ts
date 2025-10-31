/**
 * Utilities for handling FCC regulation references
 */

/**
 * Parse FCC reference string (e.g., "97.1", "97.3(a)(9)", "97.101 (d)")
 * and generate deep link to ecfr.gov
 */
export function getFCCReferenceLink(reference: string): string {
  if (!reference) return '';
  
  // Clean up the reference string - remove brackets and extra spaces
  const cleaned = reference.replace(/[\[\]]/g, '').trim();
  
  // Match pattern like "97.XXX" optionally followed by (a)(b) etc
  const match = cleaned.match(/^97\.(\d+)\s*(\([\w\d]+\))?(\([\w\d]+\))?/);
  
  if (!match) return '';
  
  const section = match[1]; // e.g., "1", "3", "101"
  const subsection1 = match[2] ? match[2].replace(/[()]/g, '') : ''; // e.g., "a", "d"
  const subsection2 = match[3] ? match[3].replace(/[()]/g, '') : ''; // e.g., "9"
  
  // Build the eCFR URL
  // Format: https://www.ecfr.gov/current/title-47/chapter-I/subchapter-D/part-97/section-97.XXX
  let url = `https://www.ecfr.gov/current/title-47/chapter-I/subchapter-D/part-97/section-97.${section}`;
  
  // Add paragraph reference if exists (format: #p-97.XXX(a)(9))
  if (subsection1) {
    let paragraph = `#p-97.${section}(${subsection1})`;
    if (subsection2) {
      paragraph += `(${subsection2})`;
    }
    url += paragraph;
  }
  
  return url;
}

/**
 * Format reference for display (e.g., "97.1", "97.3(a)(9)")
 */
export function formatFCCReference(reference: string): string {
  if (!reference) return '';
  
  // Remove brackets and extra whitespace
  return reference.replace(/[\[\]]/g, '').trim();
}

/**
 * Get human-readable description of the regulation
 */
export function getFCCReferenceDescription(reference: string): string {
  if (!reference) return '';
  
  const cleaned = formatFCCReference(reference);
  const section = cleaned.split('.')[1]?.split('(')[0];
  
  // Map common Part 97 sections to descriptions
  const descriptions: Record<string, string> = {
    '1': 'Basis and Purpose',
    '3': 'Definitions',
    '5': 'Station license required',
    '7': 'Control operator required',
    '9': 'Operator license required',
    '11': 'Stations aboard ships or aircraft',
    '13': 'Restrictions on station location',
    '15': 'Station antenna structures',
    '17': 'Application for new license',
    '19': 'Application forms',
    '21': 'Application for a vanity call sign',
    '101': 'General standards',
    '103': 'Station licensee responsibilities',
    '105': 'Control operator duties',
    '107': 'Operator/primary station license',
    '109': 'Station control',
    '111': 'Authorized frequencies',
    '113': 'Transmitter power',
    '115': 'Power limitations',
    '117': 'Prohibited transmissions',
    '119': 'Station identification',
    '201': 'Authorized frequency bands',
    '203': 'Beacon station',
    '205': 'Repeater station',
    '207': 'Space station',
    '209': 'Earth station',
    '211': 'Space telecommand station',
    '213': 'Telecommand of model craft',
    '215': 'Telecommand of devices',
    '217': 'Telemetry',
    '219': 'Message forwarding system',
    '221': 'Automatically controlled digital station',
    '301': 'Authorized frequency bands (Technician)',
    '303': 'Frequency sharing',
    '305': 'Authorized emission types',
    '307': 'Emission standards',
    '309': 'RTTY and data emission codes',
    '311': 'SS emission types',
    '313': 'Transmitter power',
    '401': 'Operation on 2190-2200 kHz',
    '403': 'Safety communications',
    '405': 'Station in distress',
    '407': 'Radio amateur civil emergency service',
    '409': 'Emergency communications',
  };
  
  return descriptions[section] || '';
}
