const AES_KEY = "UKu52ePUBwetZ9wNX88o54dnfKRu0T1l";

function openSaveFile() {
    document.getElementById("fileinput").click();
}

document.getElementById("fileinput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const saveData = decryptSaveFile(buffer);
    console.log(saveData);
});

function decryptSaveFile(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);

  let start = 0;
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    if ((c >= 65 && c <= 90) ||
        (c >= 97 && c <= 122) ||
        (c >= 48 && c <= 57) ||
        c === 43 || c === 47 || c === 61) {
      start = i;
      break;
    }
  }

  const b64 = new TextDecoder().decode(bytes.slice(start, bytes.length - 1));

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(b64) },
    CryptoJS.enc.Utf8.parse(AES_KEY),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}

function selectResourceTab(btn) {
  document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('tab-button-selected'));
  btn.classList.add('tab-button-selected');

  const underline = document.querySelector('.tab-underline');
  underline.style.left = btn.offsetLeft + 'px';
  underline.style.width = btn.offsetWidth + 'px';
}

window.addEventListener('load', () => {
  selectTab(document.querySelector('.tab-button-selected'));
});