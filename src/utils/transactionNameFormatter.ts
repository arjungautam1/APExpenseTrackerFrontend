// Utility to format transaction descriptions to be more user-friendly

interface MerchantMapping {
  [key: string]: string;
}

// Common merchant name mappings
const merchantMappings: MerchantMapping = {
  // Transportation
  'LYFT': 'Lyft Ride',
  'UBER': 'Uber Ride',
  'PRESTO APPL': 'TTC Transit',
  'PRESTO APPLSGHDDFDGP': 'TTC Transit',
  'PRESTO': 'Transit Card',
  
  // Food & Dining
  'TIM HORTONS': 'Tim Hortons',
  'MCDONALDS': 'McDonald\'s',
  'MCDONALDS Q4': 'McDonald\'s',
  'DHABA KEBAB EAST': 'Dhaba Kebab',
  'STARBUCKS': 'Starbucks',
  'SUBWAY': 'Subway',
  'PIZZA PIZZA': 'Pizza Pizza',
  'A&W': 'A&W',
  'BURGER KING': 'Burger King',
  'KFC': 'KFC',
  'TACO BELL': 'Taco Bell',
  
  // Groceries
  'SHOPPERS DRUG MART': 'Shoppers Drug Mart',
  'COPPAS FRESH MARKET': 'Coppa\'s Fresh Market',
  'YUMMY MARKET NORTH': 'Yummy Market',
  'T&T': 'T&T Supermarket',
  'METRO': 'Metro',
  'LOBLAWS': 'Loblaws',
  'NO FRILLS': 'No Frills',
  'WALMART': 'Walmart',
  'COSTCO': 'Costco',
  'SOBEYS': 'Sobeys',
  
  // Bills & Utilities
  'FREEDOM MOBILE ON': 'Freedom Mobile',
  'ROGERS': 'Rogers',
  'BELL': 'Bell',
  'TELUS': 'Telus',
  'HYDRO ONE': 'Hydro One',
  'ENBRIDGE': 'Enbridge Gas',
  'CASH ADVANCE': 'Cash Advance',
  
  // Banking
  'ATM WITHDRAWAL': 'ATM Withdrawal',
  'INTERAC': 'Interac Transfer',
  'E-TRANSFER': 'E-Transfer',
  
  // General
  'AMAZON': 'Amazon',
  'PAYPAL': 'PayPal',
  'GOOGLE': 'Google Services',
  'APPLE': 'Apple',
  'NETFLIX': 'Netflix',
  'SPOTIFY': 'Spotify'
};

// Patterns to clean up
const cleanupPatterns = [
  // Remove trailing random characters/codes
  /\s+[A-Z0-9]{3,}$/,
  // Remove extra spaces
  /\s+/g,
  // Remove common prefixes
  /^(POS|PURCHASE|PAYMENT)\s+/i,
  // Remove location codes
  /\s+(ON|QC|BC|AB|SK|MB|NB|NS|PE|NL|YT|NT|NU)(\s|$)/i,
  // Remove postal codes
  /\s+[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i
];

export function formatTransactionDescription(description: string): string {
  if (!description || description.trim().length === 0) {
    return 'Transaction';
  }

  let cleaned = description.trim().toUpperCase();
  
  // Check for exact merchant mappings first
  if (merchantMappings[cleaned]) {
    return merchantMappings[cleaned];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(merchantMappings)) {
    if (cleaned.includes(key)) {
      return value;
    }
  }
  
  // Apply cleanup patterns
  let result = description.trim();
  
  // Remove trailing codes/numbers
  result = result.replace(/\s+[A-Z0-9]{4,}$/i, '');
  
  // Remove extra spaces
  result = result.replace(/\s+/g, ' ');
  
  // Remove common prefixes
  result = result.replace(/^(POS|PURCHASE|PAYMENT)\s+/i, '');
  
  // Convert to title case
  result = result.toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Handle special cases
  result = result.replace(/\bAnd\b/g, '&');
  result = result.replace(/\bThe\b/g, 'the');
  result = result.replace(/\bOf\b/g, 'of');
  result = result.replace(/\bFor\b/g, 'for');
  result = result.replace(/\bAt\b/g, 'at');
  result = result.replace(/\bIn\b/g, 'in');
  result = result.replace(/\bOn\b/g, 'on');
  
  return result.trim() || 'Transaction';
}

export function getShortDescription(description: string, maxLength: number = 25): string {
  const formatted = formatTransactionDescription(description);
  
  if (formatted.length <= maxLength) {
    return formatted;
  }
  
  return formatted.substring(0, maxLength - 3) + '...';
}