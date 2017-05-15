import imgur from 'utils/imgur';
import { renderAlbums } from './albums';
import { copyTextToClipboard } from 'utils/copy';
import { show, hide } from './tooltips';

let updateButton = <HTMLButtonElement> document.querySelector('#submit');
let shareButton = <HTMLButtonElement> document.querySelector('#share');
let sourceForm = <HTMLFormElement> document.querySelector('#sourceForm');
let source1Input = <HTMLInputElement> document.querySelector('#source1');
let source2Input = <HTMLInputElement> document.querySelector('#source2');

function onInputChange() {
  let val1 = source1Input.value;
  let val2 = source2Input.value;

  if(val1 && val2) {
    updateButton.disabled = false;
  } else {
    updateButton.disabled = true;
  }
}

function update(values) {
  let val1 = values[0];
  let val2 = values[1];

  shareButton.disabled = false;

  imgur.requestAlbumImages([
      val1, val2,
    ])
    .then(images => renderAlbums(images[0], images[1]))
    .then(() => {
      window.history.replaceState({
        html: null,
        pageTitle: 'contrast.li',
      }, '', `/a/${val1},${val2}`);
    });

  onInputChange();
}

export function setSources(sources) {
  let source1 = sources[0];
  let source2 = sources[1];

  source1Input.value = source1;
  source2Input.value = source2;

  update([source1, source2]);
}

export function initControls() {
  source1Input.addEventListener('keydown', onInputChange);
  source2Input.addEventListener('keydown', onInputChange);

  sourceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(updateButton.disabled) return;

    let val1 = source1Input.value;
    let val2 = source2Input.value;

    update([val1, val2]);
  });

  shareButton.addEventListener('click', (e: MouseEvent) => {
    let copied = copyTextToClipboard(window.location.href);
    if(copied) {
      show('URL copied to clipboard!', shareButton);
    } else {
      show(`Couldn't copy.`, shareButton);
    }
  });
}