function lightenHexColor(hex, percent) {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Calculate the adjustment value
  let adjust = (percent / 100) * 255;

  // Adjust and clamp each color component
  r = Math.min(255, r + adjust);
  g = Math.min(255, g + adjust);
  b = Math.min(255, b + adjust);

  // Convert back to hex and return
  return "#" + 
      Math.round(r).toString(16).padStart(2, '0') + 
      Math.round(g).toString(16).padStart(2, '0') + 
      Math.round(b).toString(16).padStart(2, '0');
}

export function darkenHexColor(hex, percent) {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Calculate the adjustment value
  let adjust = (percent / 100) * 255;

  // Adjust and clamp each color component
  r = Math.max(0, r - adjust);
  g = Math.max(0, g - adjust);
  b = Math.max(0, b - adjust);

  // Convert back to hex and return
  return "#" + 
      Math.round(r).toString(16).padStart(2, '0') + 
      Math.round(g).toString(16).padStart(2, '0') + 
      Math.round(b).toString(16).padStart(2, '0');
}
