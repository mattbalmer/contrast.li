export function copyTextToClipboard(text) {
  let textArea = document.createElement("textarea");
  let success = false;

  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = 0;
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();

  try {
    success = document.execCommand('copy');
  } catch (err) {
    console.log('Unable to copy string', err);
    success = false;
  }

  document.body.removeChild(textArea);

  return success;
}