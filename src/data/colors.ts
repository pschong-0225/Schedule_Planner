export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
}

// 28 curated stationery-inspired aesthetic colors (earthy, muted, vintage paper tones)
export const PALETTE_COLORS: PaletteColor[] = [
  { id: 'teal', name: 'Deep Teal', hex: '#2F5D54', bg: '#E2EBE8', border: '#8AA59D', badgeBg: '#DCE6E1', badgeText: '#234740' },
  { id: 'sage', name: 'Sage Green', hex: '#526E58', bg: '#E6ECE7', border: '#A2B5A7', badgeBg: '#DEE6DF', badgeText: '#3B5241' },
  { id: 'moss', name: 'Olive Moss', hex: '#63733B', bg: '#EAEDE0', border: '#ADB88E', badgeBg: '#E2E6D5', badgeText: '#465328' },
  { id: 'forest', name: 'Pine Forest', hex: '#2D5542', bg: '#DFE8E3', border: '#87A695', badgeBg: '#D5E2DA', badgeText: '#1E3E2F' },
  { id: 'matcha', name: 'Matcha Green', hex: '#738349', bg: '#ECEFE4', border: '#B4C196', badgeBg: '#E4E9D8', badgeText: '#515E31' },
  
  { id: 'slate', name: 'Slate Blue', hex: '#3E576F', bg: '#E0E7EE', border: '#92A6BA', badgeBg: '#D7E1EA', badgeText: '#2A3C4E' },
  { id: 'denim', name: 'Classic Denim', hex: '#345277', bg: '#DEE6F0', border: '#8AA3C2', badgeBg: '#D3DFEC', badgeText: '#223956' },
  { id: 'indigo', name: 'Night Indigo', hex: '#2E3E64', bg: '#DEE2EE', border: '#8493B7', badgeBg: '#D3D8E7', badgeText: '#1F2C49' },
  { id: 'navy', name: 'Deep Navy', hex: '#1F344D', bg: '#DBE3EB', border: '#7C93A9', badgeBg: '#CED9E3', badgeText: '#152538' },
  { id: 'steel', name: 'Steel Azure', hex: '#4A6B82', bg: '#E3ECF2', border: '#9CB3C3', badgeBg: '#DAE5EC', badgeText: '#324C5F' },
  
  { id: 'plum', name: 'Antique Plum', hex: '#6D4362', bg: '#EDE1E9', border: '#B08BA6', badgeBg: '#E6D7E1', badgeText: '#502E47' },
  { id: 'mauve', name: 'Dusty Mauve', hex: '#7D526C', bg: '#EFE3EA', border: '#BC9AAA', badgeBg: '#E7D8E1', badgeText: '#5A384D' },
  { id: 'lavender', name: 'Smoky Lavender', hex: '#5E5478', bg: '#E8E4EE', border: '#A29AB8', badgeBg: '#DFDAE7', badgeText: '#423A57' },
  { id: 'aubergine', name: 'Aubergine', hex: '#5C3857', bg: '#ECE0E9', border: '#A17D9B', badgeBg: '#E4D5E0', badgeText: '#42243E' },
  { id: 'heather', name: 'Heather Mist', hex: '#685D79', bg: '#EAE6F0', border: '#ABA1BC', badgeBg: '#E0DBE7', badgeText: '#4C425D' },

  { id: 'brick', name: 'Heritage Brick', hex: '#9B3C30', bg: '#F5E3E0', border: '#CE8B82', badgeBg: '#EED6D2', badgeText: '#772B21' },
  { id: 'terracotta', name: 'Terracotta', hex: '#A34B36', bg: '#F6E6E1', border: '#D39787', badgeBg: '#EEDAce', badgeText: '#7D3524' },
  { id: 'crimson', name: 'Muted Crimson', hex: '#8C2F39', bg: '#F3E1E3', border: '#C57E86', badgeBg: '#EAD1D4', badgeText: '#681F28' },
  { id: 'rust', name: 'Warm Rust', hex: '#994D2C', bg: '#F6E7E0', border: '#D09980', badgeBg: '#EEDCCE', badgeText: '#73371D' },
  { id: 'coral', name: 'Desert Coral', hex: '#AA5847', bg: '#F7E7E3', border: '#D79E91', badgeBg: '#EFDDD7', badgeText: '#823F31' },
  { id: 'blush', name: 'Blush Clay', hex: '#95585C', bg: '#F2E5E6', border: '#C59A9D', badgeBg: '#EADADB', badgeText: '#703D41' },

  { id: 'ochre', name: 'Golden Ochre', hex: '#A37227', bg: '#F4ECE0', border: '#CEB07D', badgeBg: '#EEE3D1', badgeText: '#775116' },
  { id: 'amber', name: 'Warm Amber', hex: '#9A6321', bg: '#F5EAE0', border: '#CCA474', badgeBg: '#EFE0D1', badgeText: '#724613' },
  { id: 'mustard', name: 'Vintage Mustard', hex: '#8E7127', bg: '#F3ECE0', border: '#C5B17B', badgeBg: '#EDE2D0', badgeText: '#664F16' },
  { id: 'sand', name: 'Warm Sand', hex: '#876D49', bg: '#F1EDE6', border: '#BFAC91', badgeBg: '#EAE3D9', badgeText: '#624D30' },
  { id: 'clay', name: 'Natural Clay', hex: '#8A5034', bg: '#F4E7E1', border: '#C6947D', badgeBg: '#ECDCD4', badgeText: '#663721' },
  { id: 'cinnamon', name: 'Cinnamon Bark', hex: '#7F452C', bg: '#F2E4DF', border: '#BC8874', badgeBg: '#E9D8D1', badgeText: '#5E301D' },
  { id: 'charcoal', name: 'Warm Charcoal', hex: '#424546', bg: '#E8E8E7', border: '#9CA0A1', badgeBg: '#DFE0DF', badgeText: '#2B2D2E' },
];

export function getPaletteColor(idOrHex: string | undefined): PaletteColor {
  if (!idOrHex) return PALETTE_COLORS[0];
  const found = PALETTE_COLORS.find(
    (c) => c.id.toLowerCase() === idOrHex.toLowerCase() || c.hex.toLowerCase() === idOrHex.toLowerCase()
  );
  if (found) return found;
  // If it's a hex code, construct a fallback
  if (idOrHex.startsWith('#')) {
    return {
      id: idOrHex,
      name: 'Custom',
      hex: idOrHex,
      bg: '#EFEFEA',
      border: idOrHex,
      badgeBg: '#EAEAEA',
      badgeText: idOrHex,
    };
  }
  return PALETTE_COLORS[0];
}

export function getColorHex(idOrHex: string | undefined): string {
  return getPaletteColor(idOrHex).hex;
}

export function getColorBg(idOrHex: string | undefined): string {
  return getPaletteColor(idOrHex).bg;
}
