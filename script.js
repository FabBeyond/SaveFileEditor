const AES_KEY = "UKu52ePUBwetZ9wNX88o54dnfKRu0T1l";
let player_data;
let scene_data;
let map;
const misc_tab_contaner = document.querySelector(".misc-container-content");

const mask_shards = [
    {map_location: [1136.7087319396874, 1351.9879915330132], label: "Bought from Plebb", key: "", type: ""},
    {map_location: [2302.271150742097, 902.5156720670847], label: "Bought from Grindle", key: "", type: ""},
    {map_location: [1306.2001889689382, 856.0069201335178], label: "Wormways Entrance", key: "Crawl_02", type: "sceneData"},
    {map_location: [1160.1811739695288, 2653.974354799316], label: "Marrow/Deep Docks Arena", key: "Dock_08", type: "sceneData"},
    {map_location: [1107.6759379551986, 3961.4910445330943], label: "Above Seamstress", key: "Bone_East_20", type: "sceneData"},
    {map_location: [1787.4411637337112, 1914.9275421314012], label: "Shellwood Center", key: "Shellwood_14", type: "sceneData"},
    {map_location: [1000.1690484626589, 1856.940364731743], label: "Wavenest Atla Platforming", key: "Weave_05b", type: "sceneData"},
    {map_location: [3049.4714775008856, 3429.128633070097], label: "Bought from Jubilana", key: "", type: ""},
    {map_location: [2993.9314161726106, 2556.732961329846], label: "After Cogwork Core Arena", key: "Song_09", type: "sceneData"},
    {map_location: [2845.4593519940163, 3519.1331108035497], label: "After Moving Puzzle", key: "Library_05", type: "sceneData"},
    {map_location: [1620.192334947443, 2341.057192868192], label: "Savage Beastfly 2 Wish", key: "", type: ""},
    {map_location: [1030.4541159796856, 4524.198241471953], label: "Skull Cave", key: "Bone_East_LavaChallenge", type: "sceneData"},
    {map_location: [2901.580607062714, 366.03663600097696], label: "Mount Fay", key: "Peak_04c", type: "sceneData"},
    {map_location: [3165.481693219036, 1619.1507100066403], label: "The Slab", key: "Slab_17", type: "sceneData"},
    {map_location: [2625.709696468643, 4628.57551086868], label: "After Slubberlug Room", key: "Shadow_13", type: "sceneData"},
    {map_location: [2077.469797201449, 3304.1752759721053], label: "East Wisp Thicket", key: "Wisp_07", type: "sceneData"},
    {map_location: [1988.7387701271605, 707.0177074004722], label: "Blasted Steps", key: "Coral_19b", type: "sceneData"},
    {map_location: [3147.4764379355142, 1071.1025808027355], label: "Brightvein", key: "Peak_06", type: "sceneData"},
    {map_location: [1384.5278657648305, 4844.124780051003], label: "Sprintmaster Reward", key: "", type: ""},
    {map_location: [1622.2164481713319, 2324.092811202475], label: "Dark Hearts Wish", key: "", type: ""},
    {map_location: [1645.722924294319, 2335.5974924692664], label: "Hidden Hunter Wish", key: "", type: ""},
];
const fleas = [
    { label: "", key: "", type: "pd_bool", map_location: [1466.930782826843, 1853.9751290953118] },
    { label: "", key: "", type: "pd_bool", map_location: [1094.947288899025, 2660.4543425620677] },
    { label: "", key: "", type: "pd_bool", map_location: [1277.8632761274873, 2859.8796569127985] },
    { label: "", key: "", type: "pd_bool", map_location: [991.9005644563543, 3616.8157656737753] },
    { label: "", key: "", type: "pd_bool", map_location: [1388.898682935173, 2611.9444233742743] },
    { label: "", key: "", type: "pd_bool", map_location: [1203.9044985460973, 3677.885783469965] },
    { label: "", key: "", type: "pd_bool", map_location: [1313.8856833342836, 4107.823059194212] },
    { label: "", key: "", type: "pd_bool", map_location: [1395.8660128855693, 995.875718411763] },
    { label: "", key: "", type: "pd_bool", map_location: [1808.8757625862363, 4330.835166438136] },
    { label: "", key: "", type: "pd_bool", map_location: [1876.8920120873481, 2865.8954109169413] },
    { label: "", key: "", type: "pd_bool", map_location: [1882.8872227607048, 3482.927940018088] },
    { label: "", key: "", type: "pd_bool", map_location: [1922.9541022863332, 2314.9668874172185] },
    { label: "", key: "", type: "pd_bool", map_location: [1700.9920748047207, 1703.0561601073605] },
    { label: "", key: "", type: "pd_bool", map_location: [2401.83984263641, 979.8875339148699] },
    { label: "", key: "", type: "pd_bool", map_location: [2280.9506813387306, 4266.867403798466] },
    { label: "", key: "", type: "pd_bool", map_location: [2205.89457779805, 2309.9044548822826] },
    { label: "", key: "", type: "pd_bool", map_location: [2231.8901305661666, 2601.8618607229337] },
    { label: "", key: "", type: "pd_bool", map_location: [2929.855921090142, 2337.9502581906236] },
    { label: "", key: "", type: "pd_bool", map_location: [3034.8379611152286, 2446.934358316072] },
    { label: "", key: "", type: "pd_bool", map_location: [3389.854210616341, 3081.8678414096917] },
    { label: "", key: "", type: "pd_bool", map_location: [2936.889275329266, 1432.0106485398373] },
    { label: "", key: "", type: "pd_bool", map_location: [2765.952591367809, 1509.0030632785833] },
    { label: "", key: "", type: "pd_bool", map_location: [3118.8846570500027, 807.02873647052] },
    { label: "", key: "", type: "pd_bool", map_location: [2481.925879468613, 1065.023193394988] },
    { label: "", key: "", type: "pd_bool", map_location: [3224.4462626147442, 4185.927794147679] },
    { label: "", key: "", type: "pd_bool", map_location: [3094.913906152004, 3701.926043702774] },
    { label: "", key: "", type: "pd_bool", map_location: [2935.941102685444, 3350.9772442162384] }
];

const abilities = [
    { key: "hasDash", type: "pd_bool", label: "Swift Step", img: "resources/abilities/swift_step.png" },
    { key: "hasBrolly", type: "pd_bool", label: "Drifter's Cloak", img: "resources/abilities/drifters_cloak.png" },
    { key: "hasWalljump", type: "pd_bool", label: "Cling Grip", img: "resources/abilities/cling_grip.png" },
    { key: "hasNeedolin", type: "pd_bool", label: "Needolin", img: "resources/abilities/needolin.png" },
    { key: "hasChargeSlash", type: "pd_bool", label: "Needle Strike", img: "resources/abilities/needle_strike.png" },
    { key: "hasHarpoonDash", type: "pd_bool", label: "Clawline", img: "resources/abilities/clawline.png" },
    { key: "UnlockedFastTravelTeleport", type: "pd_bool", label: "Beastling's Call", img: "resources/abilities/beastling_call.png" },
    { key: "hasNeedolinMemoryPowerup", type: "pd_bool", label: "Elegy of the Deep", img: "resources/abilities/elegy.png" },
    { key: "hasSuperJump", type: "pd_bool", label: "Silksoar", img: "resources/abilities/silksoar.png" },
    { key: "HasBoundCrestUpgrader", type: "pd_bool", label: "Sylphsong", img: "resources/abilities/sylphsong.png" }
];
const items = [
    { key: "Architect Key", type: "collectable", label: "Architect Key", img: "resources/items/architect_key.png" },
    { key: "Belltown House Key", type: "collectable", label: "Bellhome Key", img: "resources/items/bellhome_key.png" },
    { key: "Dock Key", type: "collectable", label: "Diving Bell Key", img: "resources/items/dock_key.png" },
    { key: "Ward Key", type: "collectable", label: "White Key", img: "resources/items/whiteward_key.png" },
    { key: "Ward Boss Key", type: "collectable", label: "Surgeons Key", img: "resources/items/surgeons_key.png" },
    { key: "HasSlabKeyA", type: "pd_bool", label: "Apostate Key", img: "resources/items/key_apostate.png" },
    { key: "HasSlabKeyB", type: "pd_bool", label: "Heretic Key", img: "resources/items/key_heretic.png" },
    { key: "HasSlabKeyC", type: "pd_bool", label: "Indolent Key", img: "resources/items/key_indolent.png" },
    { key: "Clover Heart", type: "collectable", label: "Conjoined Heart", img: "resources/items/heart_ant.png" },
    { key: "Coral Heart", type: "collectable", label: "Encrusted Heart", img: "resources/items/heart_coral.png" },
    { key: "Flower Heart", type: "collectable", label: "Pollen Heart", img: "resources/items/heart_flower.png" },
    { key: "Hunter Heart", type: "collectable", label: "Hunter's Heart", img: "resources/items/heart_prince.png" },
    { key: "HasMelodyArchitect", type: "pd_bool", label: "Arcitect's Melody", img: "resources/items/melody_architect.png" },
    { key: "HasMelodyConductor", type: "pd_bool", label: "Conductor's Melody", img: "resources/items/melody_conductor.png" },
    { key: "HasMelodyLibrarian", type: "pd_bool", label: "Librarian's Melody", img: "resources/items/melody_valutkeeper.png" },
    { key: "Craw Summons", type: "collectable", label: "Craw Summons", img: "resources/items/craw_summons.png" },
    { key: "White Flower", type: "collectable", label: "Everbloom", img: "resources/items/everbloom.png" },
    { key: "Farsight", type: "collectable", label: "Farsight", img: "resources/items/farsight.png" },
    { key: "quill", type: "custom", label: "Quill", img: "resources/items/quill1.png" }
];
const bosses = [
    { key: "defeatedMossMother", type: "pd_bool", label: "Moss Mother", img: "resources/bosses/act1/moss_mother.png" },
    { key: "moss_mother2", type: "custom", label: "Moss Mother 2", img: "resources/bosses/act1/moss_mother2.png" },
    { key: "skullKingDefeated", type: "pd_bool", label: "Skull Tyrant", img: "resources/bosses/act1/skull_tyrant.png" },
    { key: "skullKingKilled", type: "pd_bool", label: "Skull Tyrant 2", img: "resources/bosses/act1/skull_tyrant.png" },
    { key: "defeatedBellBeast", type: "pd_bool", label: "Bell Beast", img: "resources/bosses/act1/bell_beast.png" },
    { key: "defeatedLace1", type: "pd_bool", label: "Lace", img: "resources/bosses/act1/lace.png" },
    { key: "defeatedSongGolem", type: "pd_bool", label: "Fourth Chorus", img: "resources/bosses/act1/fourth_chorus.png" },
    { key: "defeatedBoneFlyerGiant", type: "pd_bool", label: "Savage Beastfly", img: "resources/bosses/act1/savage_beastfly.png" },
    { key: "defeatedBoneFlyerGiantGolemScene", type: "pd_bool", label: "Savage Beastfly 2", img: "resources/bosses/act1/savage_beastfly.png" },
    { key: "defeatedVampireGnatBoss", type: "pd_bool", label: "Moorwing", img: "resources/bosses/act1/moorwing.png" },
    { key: "spinnerDefeated", type: "pd_bool", label: "Widow", img: "resources/bosses/act1/widow.png" },
    { key: "defeatedSplinterQueen", type: "pd_bool", label: "Sister Splinter", img: "resources/bosses/act1/sister_splinter.png" },
    { key: "defeatedPhantom", type: "pd_bool", label: "Phantom", img: "resources/bosses/act1/phantom.png" },
    { key: "defeatedCoralDrillers", type: "pd_bool", label: "Conchflies", img: "resources/bosses/act1/conchfly.png" },
    { key: "defeatedLastJudge", type: "pd_bool", label: "Last Judge", img: "resources/bosses/act1/last_judge.png" },

    { key: "defeatedDockForemen", type: "pd_bool", label: "Forebrothers", img: "resources/bosses/act2/forebrothers.png" },
    { key: "defeatedWispPyreEffigy", type: "pd_bool", label: "Father of the Flame", img: "resources/bosses/act2/father_of_the_flame.png" },
    { key: "defeatedRoachkeeperChef", type: "pd_bool", label: "Lugoli", img: "resources/bosses/act2/lugoli.png" },
    { key: "DefeatedSwampShaman", type: "pd_bool", label: "Groal", img: "resources/bosses/act2/groal.png" },
    { key: "defeatedZapCoreEnemy", type: "pd_bool", label: "Voltwyrm", img: "resources/bosses/act2/voltwyrm.png" },
    { key: "defeatedCoralDrillerSolo", type: "pd_bool", label: "Conchfly", img: "resources/bosses/act1/conchfly.png" },
    { key: "defeatedFirstWeaver", type: "pd_bool", label: "First Sinner", img: "resources/bosses/act2/first_sinner.png" },
    { key: "defeatedBroodMother", type: "pd_bool", label: "Broodmother", img: "resources/bosses/act2/broodmother.png" },
    { key: "defeatedTrobbio", type: "pd_bool", label: "Trobbio", img: "resources/bosses/act2/trobbio.png" },
    { key: "defeatedCogworkDancers", type: "pd_bool", label: "Cogwork Dancers", img: "resources/bosses/act2/cogwork_dancers.png" },
    { key: "defeatedLaceTower", type: "pd_bool", label: "Lace 2", img: "resources/bosses/act1/lace.png" },
    { key: "wardBossDefeated", type: "pd_bool", label: "The Unravelled", img: "resources/bosses/act2/unravelled.png" },
    { key: "cog7_automaton_defeated", type: "pd_bool", label: "Second Sentinel", img: "resources/bosses/act2/sentinel.png" },
    { key: "Abyss Mass", type: "journal", label: "Summoned Saviour", img: "resources/bosses/act2/summoned_saviour.png" },

    { key: "Giant Centipede", type: "journal", label: "Bell Eater", img: "resources/bosses/act3/bell_eater.png" },
    { key: "moss_mother3", type: "custom", label: "Moss Mother 3", img: "resources/bosses/act1/moss_mother.png" },
    { key: "defeatedAntQueen", type: "pd_bool", label: "Karmelita", img: "resources/bosses/act3/karmelita.png" },
    { key: "defeatedAntTrapper", type: "pd_bool", label: "Gurr", img: "resources/bosses/act3/gurr.png" },
    { key: "defeatedCrowCourt", type: "pd_bool", label: "Crawfather", img: "resources/bosses/act3/crawfather.png" },
    { key: "defeatedSeth", type: "pd_bool", label: "Seth", img: "resources/bosses/act3/seth.png" },
    { key: "defeatedFlowerQueen", type: "pd_bool", label: "Nyleth", img: "resources/bosses/act3/nyleth.png" },
    { key: "defeatedCoralKing", type: "pd_bool", label: "Crust King Khann", img: "resources/bosses/act3/khann.png" },
    { key: "defeatedGreyWarrior", type: "pd_bool", label: "Watcher at the Edge", img: "resources/bosses/act3/watcher_at_the_edge.png" },
    { key: "defeatedTormentedTrobbio", type: "pd_bool", label: "Tormented Trobbio", img: "resources/bosses/act3/tormented_trobbio.png" },
    { key: "defeatedWhiteCloverstag", type: "pd_bool", label: "Cloverstag", img: "resources/bosses/act3/palestag.png" },
    { key: "defeatedCloverDancers", type: "pd_bool", label: "Clover Dancers", img: "resources/bosses/act3/clover_dancers.png" },
    { key: "defeatedSongChevalierBoss", type: "pd_bool", label: "Pinstress", img: "resources/bosses/act3/pinstress.png" },
    { key: "BlueScientistDead", type: "pd_bool", label: "Plasmified Zango", img: "resources/bosses/act3/zango.png" },
    { key: "garmondBlackThreadDefeated", type: "pd_bool", label: "Lost Garmond", img: "resources/bosses/act3/lost_garmond.png" },
    { key: "Lost Lace", type: "journal", label: "Lost Lace", img: "resources/bosses/act3/lost_lace.png" }
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
function create_base_ui(tab) {
    const ui_template = `
    <div class="boss-img">
        <img src="">
    </div>
    <p></p>`;

    const div = document.createElement("div");
    div.classList.add("ability-container");
    misc_tab_contaner.appendChild(div);

    tab.forEach(item => {
        const button = document.createElement("button");
        button.classList.add("ability");
        button.addEventListener("click", () => update_value(item, button));
        button.innerHTML = ui_template;
        button.querySelector("img").src = item["img"];
        button.querySelector("p").innerHTML = item["label"];

        div.appendChild(button);
    });
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
function update_value(details, obj) {
    if (details["type"] == "pd_bool") {
        player_data[details["key"]] = !player_data[details["key"]];
    }
    else if (details["type"] == "collectable") {
        const collectable_data = {
            Name: details["key"],
            Data: {
                Amount: 1,
                IsSeenMask: 1,
                AmountWhileHidden: 0
            }
        };

        update_list(player_data["Collectables"]["savedData"], details, collectable_data);
    }
    else if (details["type"] == "journal") {
        const journal_data = {
            Name: details["key"],
            Record: {
                Kills: 1,
                HasBeenSeen: 1
            }
        };

        update_list(player_data["EnemyJournalKillData"]["list"], details, journal_data);
    }
    else if (details["type"] == "sceneData") {
        
    }
    console.log(player_data);
    if (details["type"] != "custom") {
        toggle_ui(obj.querySelector("img"));
        return;
    }


}

function update_list(list, details, new_value) {
    const item = list.find(item => item["Name"] == details["key"]);
    if (item != null) {
        list.splice(list.indexOf(item), 1);
    }
    else {
        list.push(new_value);
    }
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

function toggle_ui(obj) {
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

function switchTab(btn, reload_id) {
    // document.querySelector(".misc-container-content").innerHTML = "";

    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("tab-button-selected"));
    btn.classList.add("tab-button-selected");

    const underline = document.querySelector(".tab-underline");
    underline.style.left = btn.offsetLeft + "px";
    underline.style.width = btn.offsetWidth + "px";

    if (reload_id == "items") create_base_ui(items);
    else if (reload_id == "abilities") create_base_ui(abilities);
    else if (reload_id == "bosses") create_base_ui(bosses);
    else if (reload_id == "wishes") update_wishes();
    else if (reload_id == "collectables") {
        createMap();
    }
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

    create_markers(mask_shards, "resources/collectables/mask_icon.png");
    create_markers(fleas, "resources/collectables/flea_icon.png");

    document.querySelector(".map-smaller-button").classList.toggle("hide");
}

function create_markers(list, icon_path) {
    const icon = L.divIcon({
        className: "marker grey",
        html: `<img class='dot' src='${icon_path}'>`,
    });
    list.forEach(e => {
        const marker = L.marker(e["map_location"], {icon}).addTo(map);
        marker.bindPopup(e["label"], {
            closeButton: false
        });

        marker.on("mouseover", () => {
            marker.openPopup();
        });
        marker.on("mouseout", () => {
            marker.closePopup();
        });
        marker.off("click")
        marker.on("click", (e2) => {
            L.DomEvent.stopPropagation(e2);
            marker.getElement().classList.toggle("grey");
            update_value(e);
        });
    });
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

function toggle_bool(bool, key) {
    bool[key] = !bool[key];
}

function update_mask_shard(popup, amount) {
    // player_data["heartPieces"] += amount;
    // if (player_data["heartPieces"] == 4) {
    //     player_data["maxHealth"] += 1;
    //     player_data["heartPieces"] = 0;
    // }
    // else if (player_data["heartPieces"] == -1) {
    //     player_data["maxHealth"] -= 1;
    //     player_data["heartPieces"] = 3;
    // }

    // if (player_data["maxHealth"] == 0) {
    //     player_data["maxHealth"] = 1;
    //     player_data["heartPieces"] = 0;
    // }
    // if (player_data["maxHealth"] == 10 && player_data["heartPieces"] > 0) {
    //     player_data["maxHealth"] = 10;
    //     player_data["heartPieces"] = 0;
    // }

    id = popup.getContent();
    heart_pieces = scene_data["persistentBools"]["serializedList"].filter(item => item["ID"] == "Heart Piece");

    if (id == "Above Seamtress") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Bone_East_20"), "Value");
    if (id == "Marrow/Deep Docks Arena") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Dock_08"), "Value");
    if (id == "Shellwood Center") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Shellwood_14"), "Value");
    if (id == "Wormways Entrance") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Crawl_02"), "Value");
    if (id == "Wavenest Atla Platforming") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Weave_05b"), "Value");
    if (id == "After Cogwork Core Arena") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Song_09"), "Value");
    if (id == "Mount Fay") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Peak_04c"), "Value");
    if (id == "Skull Cave") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Bone_East_LavaChallenge"), "Value");
    if (id == "After Moving Puzzle") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Library_05"), "Value");
    if (id == "After Slubberlug Room") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Shadow_13"), "Value");
    if (id == "The Slab") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Slab_17"), "Value");
    if (id == "East Wisp Thicket") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Wisp_07"), "Value");
    if (id == "Brightvein") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Peak_06"), "Value");
    if (id == "Blasted Steps") toggle_bool(heart_pieces.find(item => item["SceneName"] == "Coral_19b"), "Value");

    // update_masks();
}

switchTab(document.querySelector(".tab-button"), "collectables");