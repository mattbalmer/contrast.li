import { createElement } from 'utils/dom';
import { diff, shared } from 'utils/strings';
import { smoothScroll } from 'utils/window';
import { debounce } from 'utils/functions';
import analytics, { EventActions, EventCategories, EventLabels, Dimensions } from 'services/analytics';

type Image = {
  src: string,
  desc: string,
  label: string,
}
type Album = {
  id: string,
  title: string,
  images: Array<{
    title: string,
    link: string,
    description: string
  }>
}

let albumsContainer: HTMLElement = null;
let currentIndex = -1;
let currentTargetPair: HTMLElement = null;
let albumCount = 0;
let pairEls: Array<HTMLElement> = [];
let scrollLock = false;
let scrollTimer = null;

const KeyCodes = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
};

export function initAlbums() {
  albumsContainer = <HTMLElement> document.querySelector('#albums');

  albumsContainer.addEventListener('change', (e) => {
    let val = e.target.value;
    let i = parseInt(e.target.dataset['i']);
    showImage(i, val);
  });

  window.addEventListener('keydown', (e) => {
    //noinspection TypeScriptUnresolvedFunction
    let doCareAbout = Object.values(KeyCodes).indexOf(e.keyCode) > -1;
    if(doCareAbout) {
      if(e.keyCode == KeyCodes.DOWN) {
        nextPair();
      }
      if(e.keyCode == KeyCodes.UP) {
        prevPair();
      }
      if(e.keyCode == KeyCodes.RIGHT) {
        nextImage();
      }
      if(e.keyCode == KeyCodes.LEFT) {
        prevImage();
      }
    }
  });

  window.addEventListener('scroll', debouncedAdjustScroll);
}

function adjustCurrentFromScroll(e) {
  if(scrollLock) return;

  let top = window.scrollY;
  let pairElTops = pairEls.map(e => e.offsetTop);
  for(let i = 0; i < pairElTops.length; i++) {
    let next = pairElTops[i + 1];
    if(next && top + 200 < next) {
      if(currentTargetPair) {
        currentTargetPair.classList.remove('is-focused');
      }
      currentIndex = i;
      let target = pairEls[i];
      target.classList.add('is-focused');
      currentTargetPair = target;
      break;
    }
  }
}

let debouncedAdjustScroll = debounce(adjustCurrentFromScroll, 500);

function nextPair() {
  currentIndex ++;
  if(currentIndex >= albumCount) {
    currentIndex = 0;
  }
  scrollToPair(currentIndex);
}
function prevPair() {
  currentIndex --;
  if(currentIndex < 0) {
    currentIndex = albumCount - 1;
  }
  scrollToPair(currentIndex);
}

function scrollToPair(i: number) {
  if(scrollLock) {
    return;
  }
  if(currentTargetPair) {
    currentTargetPair.classList.remove('is-focused');
  }
  let target = pairEls[i];
  target.classList.add('is-focused');
  currentTargetPair = target;
  window.removeEventListener('scroll', debouncedAdjustScroll);
  let duration = smoothScroll(target);
  clearTimeout(scrollTimer);
  scrollLock = true;
  scrollTimer = setTimeout(() => {
    scrollLock = false;
    window.addEventListener('scroll', debouncedAdjustScroll);
  }, duration + 1);
}

function showImage(i: number, val: string) {
  let target = <HTMLElement> albumsContainer.querySelector(`[data-i="${i}"]`);
  target.dataset['show'] = val;
}

function nextImage() {
  let target = albumsContainer.querySelector(`[data-i="${currentIndex}"]`);
  let vals = Array.prototype.slice.call(target.querySelectorAll('.src-toggle'), 0);
  let i = vals.findIndex(v => !!v.checked);
  i++;
  if(i > vals.length - 1) {
    i = 0;
  }
  let val = vals[i].value;
  vals[i].checked = true;
  showImage(currentIndex, val);
}

function prevImage() {
  let target = albumsContainer.querySelector(`[data-i="${currentIndex}"]`);
  let vals = Array.prototype.slice.call(target.querySelectorAll('.src-toggle'), 0);
  let i = vals.findIndex(v => !!v.checked);
  i--;
  if(i < 0) {
    i = vals.length - 1;
  }
  let val = vals[i].value;
  vals[i].checked = true;
  showImage(currentIndex, val);
}

export function renderAlbums(album1: Album, album2: Album) {
  analytics.trackEvent({
    action: EventActions.UPDATE,
    category: EventCategories.VIEWER,
    label: EventLabels.ALBUM_SOURCES,
    dimensions: {
      [Dimensions.SOURCES]: [album1.id, album2.id].join(','),
      [Dimensions.SOURCE_ONE]: album1.id,
      [Dimensions.SOURCE_TWO]: album2.id,
    }
  });
  
  let count = Math.max(album1.images.length, album2.images.length);
  let labels = diff(album1.title, album2.title);
  pairEls = [];
  albumsContainer.innerHTML = '';

  albumCount = count;
 
  for(let i = 0; i < count; i++) {
    let i1 = album1.images[i];
    let i2 = album2.images[i];
    let rawTitle = shared(i1.title, i2.title);
    let title = `#${i + 1}${rawTitle ? ` - ${rawTitle}` : ''}`;

    let el = renderImagePair(i, title, {
      src: i1.link,
      desc: i1.description,
      label: labels[0]
    }, {
      src: i2.link,
      desc: i2.description,
      label: labels[1]
    });
    pairEls.push(el);
  }

  currentIndex = 0;
  currentTargetPair = pairEls[0];
  currentTargetPair.classList.add('is-focused');
}

function renderImagePair(i: number, title: string, i1: Image, i2: Image) {
  let imagePairElement = createElement(`
    <div class="image-pair" data-i="${i}" data-show="a">
      <div class="image-pair__controls">
        <span class="pair-id">${title}</span>
        <fieldset class="src-toggle-container">
          <span>
            <input class="src-toggle" type="radio" id="${i}a" name="pair-${i}" data-i="${i}" value="a" checked />
            <label for="${i}a">${i1.label || 'A'}</label>
          </span>
          <span>
            <input class="src-toggle" type="radio" id="${i}b" name="pair-${i}" data-i="${i}" value="b" />
            <label for="${i}b">${i2.label || 'B'}</label>
          </span>
        </fieldset>
      </div>
      <div class="image-pair__sources">
        <div class="image" data-id="a">
          <div class="image-pair__src-wrapper">
            <img class="image__src" src="${i1.src}" />
          </div>
          <div class="image__desc">
            <p>${i1.desc || (i2.desc ? `<span class="assumed-desc">[${i2.desc}]</span>` : '')}</p>
          </div>
        </div>
        <div class="image" data-id="b">
          <div class="image-pair__src-wrapper">
            <img class="image__src" src="${i2.src}" />
          </div>
          <div class="image__desc">
            <p>${i2.desc || (i1.desc ? `<span class="assumed-desc">[${i1.desc}]</span>` : '')}</p>
          </div>
        </div>
      </div>
    </div>
  `);
  albumsContainer.appendChild(imagePairElement);
  return <HTMLElement> imagePairElement
}