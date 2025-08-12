export const createSVGMarker = (color, isCurrentLocation = false) => {
  const size = isCurrentLocation ? 32 : 28;  // 表示サイズ(px)
  const iconSize = isCurrentLocation ? 20 : 16;

  const getIconColor = (color) => {
    switch(color) {
      case 'green': return '#10b981'; 
      case 'yellow': return '#f59e0b';   
      case 'blue': return '#3b82f6'; 
      case 'purple': return '#8b5cf6'; 
      case 'red': return '#ef4444'; 
      default: return '#6b7280'; 
    }
  };

  const iconColor = getIconColor(color);

  // 高DPI対応
  const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  const S = size * dpr; // 実際に描くサイズ
  const r = S / 2 - 2 * dpr; // 半径
  const cx = S/2, cy = S/2;
  const icon = getIconColor(color);

  // const svg = `
  //   <svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
  //     <circle cx="${S/2}" cy="${S/2}" r="${r}" fill="${iconColor}" stroke="white" stroke-width="${2*dpr}"/>
  //     <g transform="translate(${(S - iconSize * dpr) / 2}, ${(S - iconSize * dpr) / 2})">
  //       <path d="M${(iconSize/2) * dpr} ${2*dpr} L${(iconSize/2) * dpr} ${(iconSize - 2) * dpr} 
  //                M${(iconSize/2 - 3) * dpr} ${5*dpr} L${(iconSize/2 + 3) * dpr} ${5*dpr} 
  //                M${(iconSize/2 - 2) * dpr} ${(iconSize - 5) * dpr} L${(iconSize/2 + 2) * dpr} ${(iconSize - 5) * dpr}"
  //             stroke="white" stroke-width="${2*dpr}" stroke-linecap="round"/>
  //     </g>
  //   </svg>
  // `;

  const svg = `
    <svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cx}" cy="${cy}" r="${S/2 - 2*dpr}" fill="${icon}" stroke="white" stroke-width="${2*dpr}"/>
      <circle cx="${cx}" cy="${cy}" r="${S*0.28}" fill="none" stroke="white" stroke-width="${2*dpr}" />
      <circle cx="${cx}" cy="${cy}" r="${S*0.12}" fill="white" />
    </svg>`;

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new window.google.maps.Size(size, size), // 表示サイズ
    anchor: new window.google.maps.Point(size / 2, size / 2) // アンカー位置：中心
  };
};


