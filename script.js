const AES_KEY = "UKu52ePUBwetZ9wNX88o54dnfKRu0T1l";
let player_data;
let scene_data;

function openSaveFile() {
    document.getElementById("fileinput").click();
}

document.getElementById("fileinput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const save_data = decryptSaveFile(buffer);
    player_data = save_data["playerData"];
    scene_data = save_data["sceneData"];

    console.log(save_data);
    set_values();
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
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("tab-button-selected"));
  btn.classList.add("tab-button-selected");

  const underline = document.querySelector(".tab-underline");
  underline.style.left = btn.offsetLeft + "px";
  underline.style.width = btn.offsetWidth + "px";
}

window.addEventListener("load", () => {
  selectResourceTab(document.querySelector(".tab-button-selected"));
});

function set_values() {
    update_resources();
    update_masks();
    update_spools();
}

function update_resources() {
    const resources = document.querySelectorAll(".resources-entry input");
    resources[0].value = player_data["geo"];
    resources[1].value = player_data["ShellShards"];
    document.querySelector(".shell-shards-cap").innerHTML = "/ " + (player_data["ToolPouchUpgrades"] * 100 + 400);
}

function update_masks() {
    const images = document.querySelectorAll(".masks > img");
    for (let i = 0; i < images.length; i++) {
        const element = images[i];
        if (i+1 <= player_data["maxHealth"]) {
            element.src = "resources/mask_full.png";
        }
        else {
            element.src = "resources/mask" + player_data["heartPieces"] + ".png"
            break;
        }
    }
}
function update_spools() {
    const images = document.querySelectorAll(".spools > img");
    for (let i = 0; i < images.length; i++) {
        const element = images[i];
        if (i+1 <= player_data["silkMax"]-9) {
            element.src = "resources/spool_full.png";
        }
        else {
            element.src = "resources/spool" + player_data["silkSpoolParts"] + ".png"
            break;
        }
    }
}


function change_masks(amount) {
    player_data["heartPieces"] += amount;
    if (player_data["heartPieces"] == 4) {
        player_data["maxHealth"] += 1;
        player_data["heartPieces"] = 0;
    }
    else if (player_data["heartPieces"] == -1) {
        player_data["maxHealth"] -= 1;
        player_data["heartPieces"] = 3;
    }

    if (player_data["maxHealth"] == 0) {
        player_data["maxHealth"] = 1;
        player_data["heartPieces"] = 0;
    }
    if (player_data["maxHealth"] == 10 && player_data["heartPieces"] > 0) {
        player_data["maxHealth"] = 10;
        player_data["heartPieces"] = 0;
    }

    update_masks();
}
function change_spools(amount) {
    player_data["silkSpoolParts"] += amount;
    if (player_data["silkSpoolParts"] == 2) {
        player_data["silkMax"] += 1;
        player_data["silkSpoolParts"] = 0;
    }
    else if (player_data["silkSpoolParts"] == -1) {
        player_data["silkMax"] -= 1;
        player_data["silkSpoolParts"] = 1;
    }

    if (player_data["silkMax"] == 8) {
        player_data["silkMax"] = 9;
        player_data["silkSpoolParts"] = 0;
    }
    else if (player_data["silkMax"] == 18 && player_data["silkSpoolParts"] > 0) {
        player_data["silkMax"] = 18;
        player_data["silkSpoolParts"] = 0;
    }

    update_spools();
}