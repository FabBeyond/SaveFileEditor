const AES_KEY = "UKu52ePUBwetZ9wNX88o54dnfKRu0T1l";
let player_data;
let scene_data;

const C_SHARP_HEADER = new Uint8Array([
    0x00, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
    0xFF, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x06, 0x01, 0x00, 0x00, 0x00
]);
const END_BYTE = new Uint8Array([0x0B]);

function csharp_length(len) {
    const values = [];
    for (let i = 0; i < 4; i++) {
        if ((len >> 7) === 0) {
            values.push(0x7F & len);
            len >>= 7;
            break;
        } else {
            values.push((0x7F & len) | 0x80);
            len >>= 7;
        }
    }
    if (len !== 0) values.push(len);
    return new Uint8Array(values);
}

function open_save_file() {
    document.getElementById("fileinput").click();
}

document.getElementById("fileinput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const save_data = decrypt_save_file(buffer);
    player_data = save_data["playerData"];
    scene_data = save_data["sceneData"];

    console.log(save_data);
    set_values();
});

function decrypt_save_file(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);

    let start = 0;
    for (let i = 0; i < bytes.length; i++) {
        const c = bytes[i];
        if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122) ||
            (c >= 48 && c <= 57) || c === 43 || c === 47 || c === 61) {
            start = i;
            break;
        }
    }

    const b64 = new TextDecoder().decode(bytes.slice(start, bytes.length - 1));

    const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: CryptoJS.enc.Base64.parse(b64) },
        CryptoJS.enc.Utf8.parse(AES_KEY),
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );

    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}

function encrypt_save_file() {
    const json_string = JSON.stringify({ playerData: player_data, sceneData: scene_data });
    const json_bytes = new TextEncoder().encode(json_string);

    const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.lib.WordArray.create(json_bytes),
        CryptoJS.enc.Utf8.parse(AES_KEY),
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );

    const b64_bytes = new TextEncoder().encode(
        encrypted.ciphertext.toString(CryptoJS.enc.Base64)
    );

    const len_bytes = csharp_length(b64_bytes.length);

    const result = new Uint8Array(
        C_SHARP_HEADER.length + len_bytes.length + b64_bytes.length + END_BYTE.length
    );
    let offset = 0;
    result.set(C_SHARP_HEADER, offset); offset += C_SHARP_HEADER.length;
    result.set(len_bytes, offset);      offset += len_bytes.length;
    result.set(b64_bytes, offset);      offset += b64_bytes.length;
    result.set(END_BYTE, offset);

    return result;
}

function download_save_file() {
    const result = encrypt_save_file();

    const blob = new Blob([result]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "save.dat";
    a.click();
}

function set_values() {
    update_resources();
    update_masks();
    update_spools();
    update_items();
    update_abilities();
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
            element.src = "resources/resources/mask_full.png";
        }
        else {
            element.src = "resources/resources/mask" + player_data["heartPieces"] + ".png"
            break;
        }
    }
}
function update_spools() {
    const images = document.querySelectorAll(".spools > img");
    for (let i = 0; i < images.length; i++) {
        const element = images[i];
        if (i+1 <= player_data["silkMax"]-9) {
            element.src = "resources/resources/spool_full.png";
        }
        else {
            element.src = "resources/resources/spool" + player_data["silkSpoolParts"] + ".png"
            break;
        }
    }
}
function update_items() {
    const architect_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Architect Key" && item["Data"]["Amount"] != 0);
    if (architect_key) {
        toggle_item(document.querySelector("img[alt='architect_key']"));
    }
    const bellhome_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Belltown House Key" && item["Data"]["Amount"] != 0);
    if (bellhome_key) {
        toggle_item(document.querySelector("img[alt='bellhome_key']"));
    }
    const dock_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Dock Key" && item["Data"]["Amount"] != 0);
    if (dock_key) {
        toggle_item(document.querySelector("img[alt='dock_key']"));
    }
    const whiteward_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Ward Key" && item["Data"]["Amount"] != 0)
    if (whiteward_key) {
        toggle_item(document.querySelector("img[alt='whiteward_key']"));
    }
    const surgeons_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Ward Boss Key" && item["Data"]["Amount"] != 0);
    if (surgeons_key) {
        toggle_item(document.querySelector("img[alt='surgeons_key']"));
    }

    if (player_data["HasSlabKeyC"]) toggle_item(document.querySelector("img[alt='key_indolent']"));
    if (player_data["HasSlabKeyB"]) toggle_item(document.querySelector("img[alt='key_heretic']"));
    if (player_data["HasSlabKeyA"]) toggle_item(document.querySelector("img[alt='key_apostate']"));

    const clover_heart = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Clover Heart" && item["Data"]["Amount"] != 0);
    if (clover_heart) toggle_item(document.querySelector("img[alt='heart_prince']"));
    const coral_heart = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Coral Heart" && item["Data"]["Amount"] != 0);
    if (coral_heart) toggle_item(document.querySelector("img[alt='heart_coral']"));
    const flower_heart = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Flower Heart" && item["Data"]["Amount"] != 0);
    if (flower_heart) toggle_item(document.querySelector("img[alt='heart_flower']"));
    const hunter_heart = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Hunter Heart" && item["Data"]["Amount"] != 0);
    if (hunter_heart) toggle_item(document.querySelector("img[alt='heart_ant']"));

    if (player_data["HasMelodyArchitect"]) toggle_item(document.querySelector("img[alt='melody_architect']"));
    if (player_data["HasMelodyConductor"]) toggle_item(document.querySelector("img[alt='melody_conductor']"));
    if (player_data["HasMelodyLibrarian"]) toggle_item(document.querySelector("img[alt='melody_valutkeeper']"));

    const craw_summons = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Craw Summons" && item["Data"]["Amount"] != 0);
    if (craw_summons) toggle_item(document.querySelector("img[alt='craw_summons']"));
    const everbloom = player_data["Collectables"]["savedData"].find(item => item["Name"] == "White Flower" && item["Data"]["Amount"] != 0);
    if (everbloom) toggle_item(document.querySelector("img[alt='everbloom']"));
    const farsight = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Farsight" && item["Data"]["Amount"] != 0);
    if (farsight) toggle_item(document.querySelector("img[alt='farsight']"));

    if (player_data["hasQuill"]) toggle_item(document.querySelector("img[alt='quill']"));
}
function update_abilities() {
    console.log(document.querySelector("img[alt='swift_step']"));
    if (player_data["hasDash"]) toggle_ability(document.querySelector("img[alt='swift_step']"));
    if (player_data["hasBrolly"]) toggle_ability(document.querySelector("img[alt='drifters_cloak']"));
    if (player_data["hasWalljump"]) toggle_ability(document.querySelector("img[alt='cling_grip']"));
    if (player_data["hasNeedolin"]) toggle_ability(document.querySelector("img[alt='needolin']"));
    if (player_data["hasChargeSlash"]) toggle_ability(document.querySelector("img[alt='needle_strike']"));
    if (player_data["hasHarpoonDash"]) toggle_ability(document.querySelector("img[alt='clawline']"));
    if (player_data["UnlockedFastTravelTeleport"]) toggle_ability(document.querySelector("img[alt='beastling_call']"));
    if (player_data["hasNeedolinMemoryPowerup"]) toggle_ability(document.querySelector("img[alt='elegy']"));
    if (player_data["hasSuperJump"]) toggle_ability(document.querySelector("img[alt='silksoar']"));
    if (player_data["HasBoundCrestUpgrader"]) toggle_ability(document.querySelector("img[alt='sylphsong']"));
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

function on_shell_shard_change(obj) {
    if (obj.value > player_data["ToolPouchUpgrades"] * 100 + 400) {
        obj.value = player_data["ToolPouchUpgrades"] * 100 + 400;
    }
}

function toggle_item(obj) {
    if (obj == null) return;

    if (obj.style.webkitFilter == "grayscale(0)") {
        obj.style.webkitFilter = "grayscale(1)";
        obj.parentNode.style.backgroundColor = "#101418";
    }
    else {
        obj.style.webkitFilter = "grayscale(0)";
        obj.parentNode.style.backgroundColor = "#474e55";
    }
}
function toggle_ability(obj) {
    if (obj == null) return;
    
    if (obj.style.webkitFilter == "grayscale(0)") {
        obj.style.webkitFilter = "grayscale(1)";
        obj.parentNode.parentNode.style.backgroundColor = "#101418";
    }
    else {
        obj.style.webkitFilter = "grayscale(0)";
        obj.parentNode.parentNode.style.backgroundColor = "#474e55";
    }
}

function update_item(obj) {
    key = obj.alt;
    if (key == "architect_key") {
        const architect_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Architect Key");
        toggle_item(obj);
        console.log(architect_key);
        architect_key["Data"]["Amount"] = architect_key["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "bellhome_key") {
        const bellhome_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Belltown House Key");
        toggle_item(obj);
        bellhome_key["Data"]["Amount"] = bellhome_key["Data"]["Amount"] == 0 ? 1  : 0;
    }
    else if (key == "dock_key") {
        const dock_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Dock Key");
        toggle_item(obj);
        dock_key["Data"]["Amount"] = dock_key["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "whiteward_key") {
        const whiteward_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Ward Key");
        toggle_item(obj);
        whiteward_key["Data"]["Amount"] = whiteward_key["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "surgeons_key") {
        const surgeons_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Ward Boss Key");
        toggle_item(obj);
        surgeons_key["Data"]["Amount"] = surgeons_key["Data"]["Amount"] == 0 ? 1 : 0;
    }

    else if (key == "key_apostate") {
        toggle_item(obj);
        player_data["HasSlabKeyC"] = player_data["HasSlabKeyC"] == true ? false : true;
    }
    else if (key == "key_heretic") {
        toggle_item(obj);
        player_data["HasSlabKeyB"] = player_data["HasSlabKeyB"] == true ? false : true;
    }
    else if (key == "key_indolent") {
        toggle_item(obj);
        player_data["HasSlabKeyA"] = player_data["HasSlabKeyA"] == true ? false : true;
    }

    else if (key == "heart_ant") {
        const heart_hunter = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Hunter Heart");
        toggle_item(obj);
        heart_hunter["Data"]["Amount"] = heart_hunter["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "heart_coral") {
        const heart_coral = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Coral Heart");
        toggle_item(obj);
        heart_coral["Data"]["Amount"] = heart_coral["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "heart_flower") {
        const heart_flower = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Flower Heart");
        toggle_item(obj);
        heart_flower["Data"]["Amount"] = heart_flower["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "heart_prince") {
        const heart_clover = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Clover Heart");
        toggle_item(obj);
        heart_clover["Data"]["Amount"] = heart_clover["Data"]["Amount"] == 0 ? 1 : 0;
    }

    else if (key == "melody_architect") {
        toggle_item(obj);
        player_data["HasMelodyArchitect"] = player_data["HasMelodyArchitect"] == true ? false : true;
    }
    else if (key == "melody_conductor") {
        toggle_item(obj);
        player_data["HasMelodyConductor"] = player_data["HasMelodyConductor"] == true ? false : true;
    }
    else if (key == "melody_valutkeeper") {
        toggle_item(obj);
        player_data["HasMelodyLibrarian"] = player_data["HasMelodyLibrarian"] == true ? false : true;
    }

    else if (key == "craw_summons") {
        const craw_summons = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Craw Summons");
        toggle_item(obj);
        craw_summons["Data"]["Amount"] = craw_summons["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "everbloom") {
        const everbloom = player_data["Collectables"]["savedData"].find(item => item["Name"] == "White Flower");
        toggle_item(obj);
        everbloom["Data"]["Amount"] = everbloom["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "farsight") {
        const farsight = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Farsight");
        toggle_item(obj);
        farsight["Data"]["Amount"] = farsight["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "quill") {
        player_data["QuillState"] += 1;
        if (player_data["QuillState"] == 4) {
            player_data["hasQuill"] = false;
            player_data["QuillState"] = 0;
            obj.src = "resources/items/quill1.png";
            toggle_item(obj);
        }
        else {
            obj.src = "resources/items/quill" + player_data["QuillState"] + ".png";
        }
        if (player_data["QuillState"] == 1) {
            player_data["hasQuill"] = true;
            toggle_item(obj);
        }
    }
}

function update_ability(obj) {
    obj = obj.querySelector("img");
    key = obj.alt;

    if (key == "swift_step") {
        toggle_ability(obj);
        player_data["hasDash"] = player_data["hasDash"] == true ? false : true;
    }
    else if (key == "drifters_cloak") {
        toggle_ability(obj);
        player_data["hasBrolly"] = player_data["hasBrolly"] == true ? false : true;
    }
    else if (key == "cling_grip") {
        toggle_ability(obj);
        player_data["hasWalljump"] = player_data["hasWalljump"] == true ? false : true;
    }
    else if (key == "needolin") {
        toggle_ability(obj);
        player_data["hasNeedolin"] = player_data["hasNeedolin"] == true ? false : true;
    }
    else if (key == "needle_strike") {
        toggle_ability(obj);
        player_data["hasChargeSlash"] = player_data["hasChargeSlash"] == true ? false : true;
    }
    else if (key == "clawline") {
        toggle_ability(obj);
        player_data["hasHarpoonDash"] = player_data["hasHarpoonDash"] == true ? false : true;
    }
    else if (key == "beastling_call") {
        toggle_ability(obj);
        player_data["UnlockedFastTravelTeleport"] = player_data["UnlockedFastTravelTeleport"] == true ? false : true;
    }
    else if (key == "elegy") {
        toggle_ability(obj);
        player_data["hasNeedolinMemoryPowerup"] = player_data["hasNeedolinMemoryPowerup"] == true ? false : true;
    }
    else if (key == "silksoar") {
        toggle_ability(obj);
        player_data["hasSuperJump"] = player_data["hasSuperJump"] == true ? false : true;
    }
    else if (key == "sylphsong") {
        toggle_ability(obj);
        player_data["HasBoundCrestUpgrader"] = player_data["HasBoundCrestUpgrader"] == true ? false : true;
    }
}

function switchTab(btn, path, reload_id) {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("tab-button-selected"));
    btn.classList.add("tab-button-selected");

    const underline = document.querySelector(".tab-underline");
    underline.style.left = btn.offsetLeft + "px";
    underline.style.width = btn.offsetWidth + "px";

    fetch("tabs/" + path + ".html")
        .then(res => res.text())
        .then(html => {
        document.querySelector(".misc-container-content").innerHTML = html;

        if (reload_id == "items") update_items();
        else if (reload_id == "abilities") update_abilities();
    });
}

switchTab(document.querySelector(".tab-button"), "misc/items")