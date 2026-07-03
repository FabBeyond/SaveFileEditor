const AES_KEY = "UKu52ePUBwetZ9wNX88o54dnfKRu0T1l";
let player_data;
let scene_data;
let map;

const mask_shards = [
    [[1136.7087319396874, 1351.9879915330132], "Bought from Plebb"],
    [[2302.271150742097, 902.5156720670847], "Bought from Grindle"],
    [[1306.2001889689382, 856.0069201335178], "Wormways Entrance"],
    [[1160.1811739695288, 2653.974354799316], "Marrow/Deep Docks Arena"],
    [[1107.6759379551986, 3961.4910445330943], "Above Seamstress"],
    [[1787.4411637337112, 1914.9275421314012], "Shellwood Center"],
    [[1000.1690484626589, 1856.940364731743], "Wavenest Atla Platforming"],
    [[3049.4714775008856, 3429.128633070097], "Bought from Jubilana"],
    [[2993.9314161726106, 2556.732961329846], "After Cogwork Core Arena"],
    [[2845.4593519940163, 3519.1331108035497], "After Moving Puzzle"],
    [[1620.192334947443, 2341.057192868192], "Savage Beastfly 2 Wish"],
    [[1030.4541159796856, 4524.198241471953], "Skull Cave"],
    [[2901.580607062714, 366.03663600097696], "Mount Fay"],
    [[3165.481693219036, 1619.1507100066403], "The Slab"],
    [[2625.709696468643, 4628.57551086868], "After Slubberlug Room"],
    [[2077.469797201449, 3304.1752759721053], "East Wisp Thicket"],
    [[1988.7387701271605, 707.0177074004722], "Blasted Steps"],
    [[3147.4764379355142, 1071.1025808027355], "Brightvein"],
    [[1384.5278657648305, 4844.124780051003], "Sprintmaster Reward"],
    [[1622.2164481713319, 2324.092811202475], "Dark Hearts Wish"],
    [[1645.722924294319, 2335.5974924692664], "Hidden Hunter Wish"]
];

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
    calculate_completion_percentage();
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
        toggle_ability(document.querySelector("img[alt='architect_key']"));
    }
    const bellhome_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Belltown House Key" && item["Data"]["Amount"] != 0);
    if (bellhome_key) {
        toggle_ability(document.querySelector("img[alt='bellhome_key']"));
    }
    const dock_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Dock Key" && item["Data"]["Amount"] != 0);
    if (dock_key) {
        toggle_ability(document.querySelector("img[alt='dock_key']"));
    }
    const whiteward_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Ward Key" && item["Data"]["Amount"] != 0)
    if (whiteward_key) {
        toggle_ability(document.querySelector("img[alt='whiteward_key']"));
    }
    const surgeons_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Ward Boss Key" && item["Data"]["Amount"] != 0);
    if (surgeons_key) {
        toggle_ability(document.querySelector("img[alt='surgeons_key']"));
    }

    if (player_data["HasSlabKeyC"]) toggle_ability(document.querySelector("img[alt='key_indolent']"));
    if (player_data["HasSlabKeyB"]) toggle_ability(document.querySelector("img[alt='key_heretic']"));
    if (player_data["HasSlabKeyA"]) toggle_ability(document.querySelector("img[alt='key_apostate']"));

    const clover_heart = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Clover Heart" && item["Data"]["Amount"] != 0);
    if (clover_heart) toggle_ability(document.querySelector("img[alt='heart_prince']"));
    const coral_heart = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Coral Heart" && item["Data"]["Amount"] != 0);
    if (coral_heart) toggle_ability(document.querySelector("img[alt='heart_coral']"));
    const flower_heart = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Flower Heart" && item["Data"]["Amount"] != 0);
    if (flower_heart) toggle_ability(document.querySelector("img[alt='heart_flower']"));
    const hunter_heart = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Hunter Heart" && item["Data"]["Amount"] != 0);
    if (hunter_heart) toggle_ability(document.querySelector("img[alt='heart_ant']"));

    if (player_data["HasMelodyArchitect"]) toggle_ability(document.querySelector("img[alt='melody_architect']"));
    if (player_data["HasMelodyConductor"]) toggle_ability(document.querySelector("img[alt='melody_conductor']"));
    if (player_data["HasMelodyLibrarian"]) toggle_ability(document.querySelector("img[alt='melody_valutkeeper']"));

    const craw_summons = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Craw Summons" && item["Data"]["Amount"] != 0);
    if (craw_summons) toggle_ability(document.querySelector("img[alt='craw_summons']"));
    const everbloom = player_data["Collectables"]["savedData"].find(item => item["Name"] == "White Flower" && item["Data"]["Amount"] != 0);
    if (everbloom) toggle_ability(document.querySelector("img[alt='everbloom']"));
    const farsight = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Farsight" && item["Data"]["Amount"] != 0);
    if (farsight) toggle_ability(document.querySelector("img[alt='farsight']"));

    if (player_data["hasQuill"]) toggle_ability(document.querySelector("img[alt='quill']"));
}
function update_abilities() {
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
function update_bosses() {
    //#region Act1
    if (player_data["defeatedMossMother"]) toggle_ability(document.querySelector("img[alt='moss_mother']"));
    if (player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Mossbone Mother")["Record"]["Kills"] >= 3) toggle_ability(document.querySelector("img[alt='moss_mother2']"));
    if (player_data["skullKingDefeated"]) toggle_ability(document.querySelector("img[alt='skull_tyrant']"));
    if (player_data["skullKingKilled"]) toggle_ability(document.querySelector("img[alt='skull_tyrant2']"));
    if (player_data["defeatedBellBeast"]) toggle_ability(document.querySelector("img[alt='bell_beast']"));
    if (player_data["defeatedLace1"]) toggle_ability(document.querySelector("img[alt='lace']"));
    if (player_data["defeatedSongGolem"]) toggle_ability(document.querySelector("img[alt='fourth_chorus']"));
    if (player_data["defeatedBoneFlyerGiant"]) toggle_ability(document.querySelector("img[alt='savage_beastfly']"));
    if (player_data["defeatedBoneFlyerGiantGolemScene"]) toggle_ability(document.querySelector("img[alt='savage_beastfly2']"));
    if (player_data["defeatedVampireGnatBoss"]) toggle_ability(document.querySelector("img[alt='moorwing']"));
    if (player_data["spinnerDefeated"]) toggle_ability(document.querySelector("img[alt='widow']"));
    if (player_data["defeatedSplinterQueen"]) toggle_ability(document.querySelector("img[alt='sister_splinter']"));
    if (player_data["defeatedPhantom"]) toggle_ability(document.querySelector("img[alt='phantom']"));
    if (player_data["defeatedCoralDrillers"]) toggle_ability(document.querySelector("img[alt='conchflies']"));
    if (player_data["defeatedLastJudge"]) toggle_ability(document.querySelector("img[alt='last_judge']"));
    //#endregion
    //#region Act2
    if (player_data["defeatedDockForemen"]) toggle_ability(document.querySelector("img[alt='forebrothers']"));
    if (player_data["defeatedWispPyreEffigy"]) toggle_ability(document.querySelector("img[alt='father_of_the_flame']"));
    if (player_data["defeatedRoachkeeperChef"]) toggle_ability(document.querySelector("img[alt='lugoli']"));
    if (player_data["DefeatedSwampShaman"]) toggle_ability(document.querySelector("img[alt='groal']"));
    if (player_data["defeatedZapCoreEnemy"]) toggle_ability(document.querySelector("img[alt='voltwyrm']"));
    if (player_data["defeatedCoralDrillerSolo"]) toggle_ability(document.querySelector("img[alt='conchfly']"));
    if (player_data["defeatedFirstWeaver"]) toggle_ability(document.querySelector("img[alt='first_sinner']"));
    if (player_data["defeatedBroodMother"]) toggle_ability(document.querySelector("img[alt='broodmother']"));
    if (player_data["defeatedTrobbio"]) toggle_ability(document.querySelector("img[alt='trobbio']"));
    if (player_data["defeatedCogworkDancers"]) toggle_ability(document.querySelector("img[alt='cogwork_dancers']"));
    if (player_data["defeatedLaceTower"]) toggle_ability(document.querySelector("img[alt='lace2']"));
    if (player_data["wardBossDefeated"]) toggle_ability(document.querySelector("img[alt='unravelled']"));
    if (player_data["cog7_automaton_defeated"]) toggle_ability(document.querySelector("img[alt='sentinel']"));
    if (player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Garmond_Zaza") != null) toggle_ability(document.querySelector("img[alt='garmond_zaza']"));
    //#endregion
    //#region Act3/
    if (player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Giant Centipede") != null) toggle_ability(document.querySelector("img[alt='bell_eater']"));
    if (player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Mossbone Mother")["Record"]["Kills"] == 4) toggle_ability(document.querySelector("img[alt='moss_mother3']"));
    if (player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Mossbone Mother")["Record"]["Kills"] == 2) toggle_ability(document.querySelector("img[alt='moss_mother3']"));
    if (player_data["defeatedAntQueen"]) toggle_ability(document.querySelector("img[alt='karmelita']"));
    if (player_data["defeatedAntTrapper"]) toggle_ability(document.querySelector("img[alt='gurr']"));
    if (player_data["defeatedCrowCourt"]) toggle_ability(document.querySelector("img[alt='crawfather']"));
    if (player_data["defeatedSeth"]) toggle_ability(document.querySelector("img[alt='seth']"));
    if (player_data["defeatedFlowerQueen"]) toggle_ability(document.querySelector("img[alt='nyleth']"));
    if (player_data["defeatedCoralKing"]) toggle_ability(document.querySelector("img[alt='khann']"));
    if (player_data["defeatedGreyWarrior"]) toggle_ability(document.querySelector("img[alt='watcher_at_the_edge']"));
    if (player_data["defeatedTormentedTrobbio"]) toggle_ability(document.querySelector("img[alt='tormented_trobbio']"));
    if (player_data["defeatedWhiteCloverstag"]) toggle_ability(document.querySelector("img[alt='palestag']"));
    if (player_data["defeatedCloverDancers"]) toggle_ability(document.querySelector("img[alt='clover_dancers']"));
    if (player_data["defeatedSongChevalierBoss"]) toggle_ability(document.querySelector("img[alt='pinstress']"));
    if (player_data["BlueScientistDead"]) toggle_ability(document.querySelector("img[alt='zango']"));
    if (player_data["garmondBlackThreadDefeated"]) toggle_ability(document.querySelector("img[alt='lost_garmond']"));
    if (player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Lost Lace") != null) toggle_ability(document.querySelector("img[alt='lost_lace']"));
    if (player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Abyss Mass") != null) toggle_ability(document.querySelector("img[alt='summoned_saviour']"));
    //#endregion
}
function update_wishes() {
    document.querySelectorAll(".wish-bottom-text").forEach(obj => {
        obj = obj.parentNode.querySelector("img")

        state = 0;
        quest = get_quest(obj.alt);
        if (quest != null) {
            if (quest["Data"]["IsAccepted"]) state = 1;
            if (quest["Data"]["IsCompleted"]) state = 2;

            switch_wish_state(obj, state);
            return;
        }

        quest2 = get_quest(obj.alt + " Pre");
        if (quest2 != null) {
            if (quest2["Data"]["IsAccepted"]) state = 1;
            if (quest2["Data"]["IsCompleted"]) state = 2;
        }

        switch_wish_state(obj, state);
    });
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
    player_data["ShellShards"] = obj.value;
}
function on_rosaries_change(obj) {
    player_data["geo"] = obj.value;
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
    obj = obj.querySelector("img");
    key = obj.alt;

    if (key == "architect_key") {
        const architect_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Architect Key");
        toggle_ability(obj);
        architect_key["Data"]["Amount"] = architect_key["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "bellhome_key") {
        const bellhome_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Belltown House Key");
        toggle_ability(obj);
        bellhome_key["Data"]["Amount"] = bellhome_key["Data"]["Amount"] == 0 ? 1  : 0;
    }
    else if (key == "dock_key") {
        const dock_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Dock Key");
        toggle_ability(obj);
        dock_key["Data"]["Amount"] = dock_key["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "whiteward_key") {
        const whiteward_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Ward Key");
        toggle_ability(obj);
        whiteward_key["Data"]["Amount"] = whiteward_key["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "surgeons_key") {
        const surgeons_key = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Ward Boss Key");
        toggle_ability(obj);
        surgeons_key["Data"]["Amount"] = surgeons_key["Data"]["Amount"] == 0 ? 1 : 0;
    }

    else if (key == "key_apostate") {
        toggle_ability(obj);
        player_data["HasSlabKeyC"] = player_data["HasSlabKeyC"] == true ? false : true;
    }
    else if (key == "key_heretic") {
        toggle_ability(obj);
        player_data["HasSlabKeyB"] = player_data["HasSlabKeyB"] == true ? false : true;
    }
    else if (key == "key_indolent") {
        toggle_ability(obj);
        player_data["HasSlabKeyA"] = player_data["HasSlabKeyA"] == true ? false : true;
    }

    else if (key == "heart_ant") {
        const heart_hunter = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Hunter Heart");
        toggle_ability(obj);
        heart_hunter["Data"]["Amount"] = heart_hunter["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "heart_coral") {
        const heart_coral = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Coral Heart");
        toggle_ability(obj);
        heart_coral["Data"]["Amount"] = heart_coral["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "heart_flower") {
        const heart_flower = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Flower Heart");
        toggle_ability(obj);
        heart_flower["Data"]["Amount"] = heart_flower["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "heart_prince") {
        const heart_clover = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Clover Heart");
        toggle_ability(obj);
        heart_clover["Data"]["Amount"] = heart_clover["Data"]["Amount"] == 0 ? 1 : 0;
    }

    else if (key == "melody_architect") {
        toggle_ability(obj);
        player_data["HasMelodyArchitect"] = player_data["HasMelodyArchitect"] == true ? false : true;
    }
    else if (key == "melody_conductor") {
        toggle_ability(obj);
        player_data["HasMelodyConductor"] = player_data["HasMelodyConductor"] == true ? false : true;
    }
    else if (key == "melody_valutkeeper") {
        toggle_ability(obj);
        player_data["HasMelodyLibrarian"] = player_data["HasMelodyLibrarian"] == true ? false : true;
    }

    else if (key == "craw_summons") {
        const craw_summons = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Craw Summons");
        toggle_ability(obj);
        craw_summons["Data"]["Amount"] = craw_summons["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "everbloom") {
        const everbloom = player_data["Collectables"]["savedData"].find(item => item["Name"] == "White Flower");
        toggle_ability(obj);
        everbloom["Data"]["Amount"] = everbloom["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "farsight") {
        const farsight = player_data["Collectables"]["savedData"].find(item => item["Name"] == "Farsight");
        toggle_ability(obj);
        farsight["Data"]["Amount"] = farsight["Data"]["Amount"] == 0 ? 1 : 0;
    }
    else if (key == "quill") {
        player_data["QuillState"] += 1;
        if (player_data["QuillState"] == 4) {
            player_data["hasQuill"] = false;
            player_data["QuillState"] = 0;
            obj.src = "resources/items/quill1.png";
            toggle_ability(obj);
        }
        else {
            obj.src = "resources/items/quill" + player_data["QuillState"] + ".png";
        }
        if (player_data["QuillState"] == 1) {
            player_data["hasQuill"] = true;
            toggle_ability(obj);
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
function update_boss(obj) {
    obj = obj.querySelector("img");
    key = obj.alt;

    //#region Act1
    if (key == "moss_mother") {
        player_data["defeatedMossMother"] = player_data["defeatedMossMother"] == true ? false : true;
    }
    else if (key == "moss_mother2") {
        record = player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Mossbone Mother")["Record"]
        if (record["Kills"] == 4) {
            record["Kills"] = 2;
        }
        else if (record["Kills"] == 2) {
            record["Kills"] = 4;
        }
    }
    else if (key == "skull_tyrant") {
        player_data["skullKingDefeated"] = player_data["skullKingDefeated"] == true ? false : true;
    }
    else if (key == "skull_tyrant2") {
        player_data["skullKingKilled"] = player_data["skullKingKilled"] == true ? false : true;
    }
    else if (key == "bell_beast") {
        player_data["defeatedBellBeast"] = player_data["defeatedBellBeast"] == true ? false : true;
    }
    else if (key == "lace") {
        player_data["defeatedLace1"] = player_data["defeatedLace1"] == true ? false : true;
    }
    else if (key == "fourth_chorus") {
        player_data["defeatedSongGolem"] = player_data["defeatedSongGolem"] == true ? false : true;
    }
    else if (key == "savage_beastfly") {
        player_data["defeatedBoneFlyerGiant"] = player_data["defeatedBoneFlyerGiant"] == true ? false : true;
    }
    else if (key == "savage_beastfly2") {
        player_data["defeatedBoneFlyerGiantGolemScene"] = player_data["defeatedBoneFlyerGiantGolemScene"] == true ? false : true;
    }
    else if (key == "moorwing") {
        player_data["defeatedVampireGnatBoss"] = player_data["defeatedVampireGnatBoss"] == true ? false : true;
    }
    else if (key == "widow") {
        player_data["spinnerDefeated"] = player_data["spinnerDefeated"] == true ? false : true;
    }
    else if (key == "sister_splinter") {
        player_data["defeatedSplinterQueen"] = player_data["defeatedSplinterQueen"] == true ? false : true;
    }
    else if (key == "conchflies") {
        player_data["defeatedCoralDrillers"] = player_data["defeatedCoralDrillers"] == true ? false : true;
    }
    else if (key == "phantom") {
        player_data["defeatedPhantom"] = player_data["defeatedPhantom"] == true ? false : true;
    }
    else if (key == "last_judge") {
        player_data["defeatedLastJudge"] = player_data["defeatedLastJudge"] == true ? false : true;
    }
    //#endregion
    //#region Act2
    else if (key == "forebrothers") {
        player_data["defeatedDockForemen"] = player_data["defeatedDockForemen"] == true ? false : true;
    }
    else if (key == "father_of_the_flame") {
        player_data["defeatedWispPyreEffigy"] = player_data["defeatedWispPyreEffigy"] == true ? false : true;
    }
    else if (key == "lugoli") {
        player_data["defeatedRoachkeeperChef"] = player_data["defeatedRoachkeeperChef"] == true ? false : true;
    }
    else if (key == "groal") {
        player_data["DefeatedSwampShaman"] = player_data["DefeatedSwampShaman"] == true ? false : true;
    }
    else if (key == "voltwyrm") {
        player_data["defeatedZapCoreEnemy"] = player_data["defeatedZapCoreEnemy"] == true ? false : true;
    }
    else if (key == "conchfly") {
        player_data["defeatedCoralDrillerSolo"] = player_data["defeatedCoralDrillerSolo"] == true ? false : true;
    }
    else if (key == "first_sinner") {
        player_data["defeatedFirstWeaver"] = player_data["defeatedFirstWeaver"] == true ? false : true;
    }
    else if (key == "broodmother") {
        player_data["defeatedBroodMother"] = player_data["defeatedBroodMother"] == true ? false : true;
    }
    else if (key == "trobbio") {
        player_data["defeatedTrobbio"] = player_data["defeatedTrobbio"] == true ? false : true;
    }
    else if (key == "cogwork_dancers") {
        player_data["defeatedCogworkDancers"] = player_data["defeatedCogworkDancers"] == true ? false : true;
    }
    else if (key == "lace2") {
        player_data["defeatedLaceTower"] = player_data["defeatedLaceTower"] == true ? false : true;
    }
    else if (key == "unravelled") {
        player_data["wardBossDefeated"] = player_data["wardBossDefeated"] == true ? false : true;
    }
    else if (key == "sentinel") {
        player_data["cog7_automaton_defeated"] = player_data["cog7_automaton_defeated"] == true ? false : true;
    }
    else if (key == "garmond_zaza") {
        const entry = player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Garmond_Zaza");
        if (entry != null) {
            player_data["EnemyJournalKillData"]["list"].splice(player_data["EnemyJournalKillData"]["list"].indexOf(entry), 1);
        }
        else {
            const jsonEntry = {
                Name: "Garmond_Zaza",
                Record: {
                    Kills: 1,
                    HasBeenSeen: true
                },
            };
            player_data["EnemyJournalKillData"]["list"].push(jsonEntry);
        }
    }
    //#endregion
    //#region Act3
    else if (key == "bell_eater") {
        const entry = player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Giant Centipede");
        if (entry != null) {
            player_data["EnemyJournalKillData"]["list"].splice(player_data["EnemyJournalKillData"]["list"].indexOf(entry), 1);
        }
        else {
            const jsonEntry = {
                Name: "Giant Centipede",
                Record: {
                    Kills: 1,
                    HasBeenSeen: true
                },
            };
            player_data["EnemyJournalKillData"]["list"].push(jsonEntry);
        }
    }
    else if (key == "moss_mother3") {
        record = player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Mossbone Mother")["Record"]
        if (record["Kills"] == 2) {
            record["Kills"] = 1;
        }
        else if (record["Kills"] == 4) {
            record["Kills"] = 3;
        }
        else if (record["Kills"] == 1) {
            record["Kills"] = 2;
        }
        else if (record["Kills"] == 3) {
            record["Kills"] = 4;
        }
    }
    else if (key == "karmelita") {
        player_data["defeatedAntQueen"] = player_data["defeatedAntQueen"] == true ? false : true;
    }
    else if (key == "gurr") {
        player_data["defeatedAntTrapper"] = player_data["defeatedAntTrapper"] == true ? false : true;
    }
    else if (key == "crawfather") {
        player_data["defeatedCrowCourt"] = player_data["defeatedCrowCourt"] == true ? false : true;
    }
    else if (key == "seth") {
        player_data["defeatedSeth"] = player_data["defeatedSeth"] == true ? false : true;
    }
    else if (key == "nyleth") {
        player_data["defeatedFlowerQueen"] = player_data["defeatedFlowerQueen"] == true ? false : true;
    }
    else if (key == "khann") {
        player_data["defeatedCoralKing"] = player_data["defeatedCoralKing"] == true ? false : true;
    }
    else if (key == "watcher_at_the_edge") {
        player_data["defeatedGreyWarrior"] = player_data["defeatedGreyWarrior"] == true ? false : true;
    }
    else if (key == "palestag") {
        player_data["defeatedWhiteCloverstag"] = player_data["defeatedWhiteCloverstag"] == true ? false : true;
    }
    else if (key == "clover_dancers") {
        player_data["defeatedCloverDancers"] = player_data["defeatedCloverDancers"] == true ? false : true;
    }
    else if (key == "pinstress") {
        player_data["defeatedSongChevalierBoss"] = player_data["defeatedSongChevalierBoss"] == true ? false : true;
    }
    else if (key == "zango") {
        player_data["BlueScientistDead"] = player_data["BlueScientistDead"] == true ? false : true;
    }
    else if (key == "tormented_trobbio") {
        player_data["defeatedTormentedTrobbio"] = player_data["defeatedTormentedTrobbio"] == true ? false : true;
    }
    else if (key == "lost_garmond") {
        player_data["garmondBlackThreadDefeated"] = player_data["garmondBlackThreadDefeated"] == true ? false : true;
    }
    else if (key == "lost_lace") {
        const entry = player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Lost Lace");
        if (entry != null) {
            player_data["EnemyJournalKillData"]["list"].splice(player_data["EnemyJournalKillData"]["list"].indexOf(entry), 1);
        }
        else {
            const jsonEntry = {
                Name: "Lost Lace",
                Record: {
                    Kills: 1,
                    HasBeenSeen: true
                },
            };
            player_data["EnemyJournalKillData"]["list"].push(jsonEntry);
        }
    }
    else if (key == "summoned_saviour") {
        const entry = player_data["EnemyJournalKillData"]["list"].find(item => item["Name"] == "Abyss Mass");
        if (entry != null) {
            player_data["EnemyJournalKillData"]["list"].splice(player_data["EnemyJournalKillData"]["list"].indexOf(entry), 1);
        }
        else {
            const jsonEntry = {
                Name: "Abyss Mass",
                Record: {
                    Kills: 1,
                    HasBeenSeen: true
                },
            };
            player_data["EnemyJournalKillData"]["list"].push(jsonEntry);
        }
    }
    //#endregion

    console.log(player_data);
    toggle_ability(obj);
}
function update_wish(obj) {
    obj = obj.querySelector("img");
    key = obj.alt;

    questTemplate = {
        Name: "",
        Data: {
            HasBeenSeen: true,
            IsAccepted: true,
            CompletedCount: 0,
            IsCompleted: false,
            WasEverCompleted: false
        }
    };

    quest = get_quest(key);
    if (quest == null) {
        questTemplate["Name"] = key;
        player_data["QuestCompletionData"]["savedData"].push(questTemplate);
        switch_wish_state(obj);
        return;
    }
    else if (quest["Data"]["IsAccepted"] && !quest["Data"]["IsCompleted"]) {
        switch_wish_state(obj);
         quest["Data"]["IsCompleted"] = true;
         return;
    }
    else {
        delete_quest(quest);
    }
    delete_quest(get_quest(key + " Pre"));
    delete_quest(get_quest("Sprintmaster Pre"));
    delete_quest(get_quest("Mossberry Collection Pre"));

    switch_wish_state(obj);
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
        else if (reload_id == "bosses") update_bosses();
        else if (reload_id == "wishes") update_wishes();
        else if (reload_id == "collectables") {
            createMap();
        }
    });
}

function createMap() {
    map = L.map("map", {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 1
    });

    const bounds = [[0, 0], [4096, 5514]];
    L.imageOverlay("resources/collectables/map.png", bounds).addTo(map);
    map.fitBounds(bounds);

    map.on("click", e => console.log(e.latlng));

    const icon = L.divIcon({
        className: "marker grey",
        html: "<img class='dot' src='resources/collectables/mask_icon.png'>",
    });
    mask_shards.forEach(e => {
        const marker = L.marker(e[0], {icon}).addTo(map);
        marker.bindPopup(e[1]);

        marker.on("mouseover", () => {
            marker.openPopup();
        });
        marker.on("mouseout", () => {
            marker.closePopup();
        });
        marker.off("click")
        marker.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            marker.getElement().classList.toggle("grey");
        });
    });

    document.querySelector(".map-smaller-button").classList.toggle("hide");
}

function expand_map() {
    const map_div = document.getElementById("map");

    map_div.classList.add("expanded");

    setTimeout(() => {
        map.invalidateSize();
    }, 300);

    document.querySelector(".map-fullscreen-button").classList.toggle("hide");
    document.querySelector(".map-smaller-button").classList.toggle("hide");
}

function shrink_map() {
    const map_div = document.getElementById("map");

    map_div.classList.remove("expanded");

    setTimeout(() => {
        map.invalidateSize();
    }, 300);

    document.querySelector(".map-fullscreen-button").classList.toggle("hide");
    document.querySelector(".map-smaller-button").classList.toggle("hide");
}

function get_quest(name) {
    return player_data["QuestCompletionData"]["savedData"].find(item => item["Name"] == name);
}

function delete_quest(quest) {
    if (quest == null) return;

    quests = player_data["QuestCompletionData"]["savedData"];
    quests.splice(quests.indexOf(quest), 1);
}

function switch_wish_state(obj, state) {
    bottom_text = obj.parentNode.parentNode.querySelector(".wish-bottom-text");
    if (bottom_text.innerHTML == "Completed" || state == 0) {
        obj.style.webkitFilter = "grayscale(1)";
        obj.parentNode.parentNode.style.backgroundColor = "#101418";
        bottom_text.innerHTML = "Uncollected";
        return;
    }
    if (bottom_text.innerHTML == "Collected" || state == 2) {
        bottom_text.innerHTML = "Completed";
    }
    if (bottom_text.innerHTML == "Uncollected" || state == 1) {
        bottom_text.innerHTML = "Collected";
    }
    
    
    obj.style.webkitFilter = "grayscale(0)";
    obj.parentNode.parentNode.style.backgroundColor = "#474e55";
}

function calculate_completion_percentage() {
    percentage = 0;
    percentage += player_data["Tools"]["savedData"].filter(item => item["Data"]["IsHidden"] == false).length;
    player_data["ToolEquips"]["savedData"].forEach(element => {
        if (element["Name"] == "Hunter_v3") percentage -= 2;
        else if (element["Name"] == "Hunter_v2") percentage--;
        if (["Cloakless", "Cursed"].includes(element["Name"])) percentage--;

        percentage++;
    });
    
    percentage += player_data["nailUpgrades"];
    percentage += player_data["ToolKitUpgrades"];
    percentage += player_data["ToolPouchUpgrades"];
    percentage += player_data["silkRegenMax"];
    percentage += player_data["maxHealthBase"] - 5;
    percentage += player_data["silkMax"] - 9;
    percentage += player_data["hasNeedolin"] ? 1 : 0;
    percentage += player_data["hasDash"] ? 1 : 0;
    percentage += player_data["hasWalljump"] ? 1 : 0;
    percentage += player_data["hasHarpoonDash"] ? 1 : 0;
    percentage += player_data["hasSuperJump"] ? 1 : 0;
    percentage += player_data["hasChargeSlash"] ? 1 : 0;
    percentage += player_data["HasBoundCrestUpgrader"] ? 1 : 0;
    percentage += player_data["HasWhiteFlower"] ? 1 : 0;
    console.log(percentage);
}

switchTab(document.querySelector(".tab-button"), "misc/items");