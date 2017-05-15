let tooltip: HTMLElement = null;
let isHovered = false;
let hideTimer = null;

export function show(content: string, anchor: HTMLElement) {
  let top = anchor.offsetTop;
  let left = anchor.offsetLeft;
  let height = anchor.offsetHeight;

  tooltip.innerHTML = content;
  tooltip.style.display = `block`;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top + height}px`;
}

export function hide() {
  tooltip.innerHTML = '';
  tooltip.style.display = 'none';
}

export function initTooltips() {
  tooltip = document.querySelector('#tooltip');

  let triggers = Array.prototype.slice.call(document.querySelectorAll('[data-tooltip]'), 0);
  triggers.forEach(target => {
    target.addEventListener('mouseenter', (e: MouseEvent) => {
      clearTimeout(hideTimer);
      let tooltipTemplate = target.dataset['tooltip'];
      if(tooltipTemplate) {
        let selector = `[data-template="${tooltipTemplate}"]`;
        let template = document.querySelector(selector);
        show(template.innerHTML, target);
      }
    });
    target.addEventListener('mouseleave', (e: MouseEvent) => {
      clearTimeout(hideTimer);
      if(!isHovered) {
        hideTimer = setTimeout(hide, 300);
      }
    });
  });

  tooltip.addEventListener('mouseenter', (e) => {
    clearTimeout(hideTimer);
    isHovered = true;
  });
  tooltip.addEventListener('mouseleave', (e) => {
    clearTimeout(hideTimer);
    isHovered = false;
    hideTimer = setTimeout(hide, 300);
  });
}