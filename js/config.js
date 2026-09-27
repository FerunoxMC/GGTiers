// ============================================================
// GGTIERS - CONFIGURATION
// ============================================================

export const ADMIN_USERNAME = "FerunoxMC";


// ============================================================
// LOCAL STORAGE KEYS
// ============================================================

export const STORAGE_KEYS = {
    ACCOUNTS: "ggtiers_accounts_v1",
    CURRENT_USER: "ggtiers_current_user",
    SHARED_LEADERBOARD: "ggtiers_shared_leaderboard_v1",

    // Old storage key used by previous versions.
    LEGACY_PLAYERS: "ggtiers_players"
};


// ============================================================
// GAME MODES
// ============================================================

export const GAMEMODES = [
    "Sword",
    "Axe",
    "Mace",
    "Vanilla",
    "UHC",
    "D-SMP",
    "SMP",
    "Pot",
    "Netherite Pot",
    "Spear Mace"
];


// ============================================================
// GAME MODE IMAGES
// ============================================================

export const GAMEMODE_IMAGES = {
    Sword: "gamemodes/Sword.png",
    Axe: "gamemodes/Axe.png",
    Mace: "gamemodes/Mace.png",
    Vanilla: "gamemodes/Vanilla.png",
    UHC: "gamemodes/UHC.png",
    "D-SMP": "gamemodes/D-SMP.png",
    SMP: "gamemodes/SMP.png",
    Pot: "gamemodes/Pot.png",
    "Netherite Pot": "gamemodes/Netherite Pot.png",
    "Spear Mace": "gamemodes/Spear Mace.png"
};


// ============================================================
// TIER ORDER
// ============================================================

export const TIER_ORDER = [
    "LT5",
    "MT5",
    "HT5",

    "LT4",
    "MT4",
    "HT4",

    "LT3",
    "MT3",
    "HT3",

    "LT2",
    "MT2",
    "HT2",

    "LT1",
    "MT1",
    "HT1"
];


// ============================================================
// TIER POINT VALUES
// ============================================================

export const TIER_POINTS = {
    LT5: 1,
    MT5: 2,
    HT5: 3,

    LT4: 5,
    MT4: 6,
    HT4: 8,

    LT3: 10,
    MT3: 12,
    HT3: 15,

    LT2: 25,
    MT2: 30,
    HT2: 35,

    LT1: 45,
    MT1: 55,
    HT1: 60
};


// ============================================================
// MINECRAFT HEADS
// ============================================================

export const MCHEADS_AVATAR = username =>
    `https://mc-heads.net/avatar/${encodeURIComponent(username)}/48`;

export const MCHEADS_FALLBACK =
    "https://mc-heads.net/avatar/MHF_Steve/48";


// ============================================================
// TIER CSS CLASS
// ============================================================

export function tierClass(tier) {
    return `tier-${String(tier).toLowerCase()}`;
}


// ============================================================
// ADMIN CHECK
// ============================================================

export function isAdminUsername(username) {
    return (
        String(username || "")
            .trim()
            .toLowerCase() === ADMIN_USERNAME.toLowerCase()
    );
}


// ============================================================
// ROLE
// ============================================================

export function getRole(username) {
    return isAdminUsername(username)
        ? "Admin"
        : "Viewer";
}