import { initAlbums } from './albums';
import { initTooltips } from './tooltips';
import { initControls, setSources } from './controls';

document.addEventListener('DOMContentLoaded', () => {
  initAlbums();
  initTooltips();
  initControls();

  let urlMatch = window.location.pathname.match(/\/a\/([a-zA-Z0-9]*),([a-zA-Z0-9]*)/);
  if(urlMatch && urlMatch[1] && urlMatch[2]) {
    let source1 = urlMatch[1];
    let source2 = urlMatch[2];

    setSources([source1, source2]);
  }
});