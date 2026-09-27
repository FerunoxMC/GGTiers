// ============================================================
// GGTIERS - STORAGE
// ============================================================

import {
    STORAGE_KEYS,
    GAMEMODES,
    TIER_ORDER,
    MCHEADS_AVATAR
} from "./config.js";


// ============================================================
// INTERNAL JSON HELPERS
// ============================================================

function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);

        if (!raw) {
            return fallback;
        }

        const parsed = JSON.parse(raw);

        return parsed ?? fallback;
    } catch (error) {
        console.warn(
            `GGTiers: Could not read localStorage key "${key}".`,
            error
        );

        return fallback;
    }
}


function writeJSON(key, value) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}


// ============================================================
// ACCOUNTS
// ============================================================

export function loadAccounts() {
    const accounts = readJSON(
        STORAGE_KEYS.ACCOUNTS,
        []
    );

    return Array.isArray(accounts)
        ? accounts
        : [];
}


export function saveAccounts(accounts) {
    writeJSON(
        STORAGE_KEYS.ACCOUNTS,
        accounts
    );
}


// ============================================================
// CURRENT USER
// ============================================================

export function loadCurrentUsername() {
    return (
        localStorage.getItem(
            STORAGE_KEYS.CURRENT_USER
        ) || ""
    );
}


export function saveCurrentUsername(username) {
    localStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        username
    );
}


export function clearCurrentUsername() {
    localStorage.removeItem(
        STORAGE_KEYS.CURRENT_USER
    );
}


// ============================================================
// DEFAULT TIERS
// ============================================================

function createDefaultTiers() {
    const tiers = {};

    for (const gamemode of GAMEMODES) {
        tiers[gamemode] = "LT5";
    }

    return tiers;
}


// ============================================================
// NORMALIZE PLAYER
// ============================================================

export function normalizePlayer(player) {
    const username = String(
        player?.username || ""
    ).trim();

    if (!username) {
        return null;
    }

    const tiers = createDefaultTiers();

    if (
        player?.tiers &&
        typeof player.tiers === "object"
    ) {
        for (const gamemode of GAMEMODES) {
            const tier = player.tiers[gamemode];

            if (TIER_ORDER.includes(tier)) {
                tiers[gamemode] = tier;
            }
        }
    }

    return {
        username,

        avatarUrl:
            player?.avatarUrl ||
            MCHEADS_AVATAR(username),

        tiers
    };
}


// ============================================================
// NORMALIZE PLAYERS
// ============================================================

export function normalizePlayers(players) {
    if (!Array.isArray(players)) {
        return [];
    }

    const normalizedPlayers = [];
    const seen = new Set();

    for (const player of players) {
        const normalized = normalizePlayer(player);

        if (!normalized) {
            continue;
        }

        const usernameKey =
            normalized.username.toLowerCase();

        if (seen.has(usernameKey)) {
            continue;
        }

        seen.add(usernameKey);

        normalizedPlayers.push(normalized);
    }

    return normalizedPlayers;
}


// ============================================================
// LEGACY LEADERBOARD MIGRATION
// ============================================================

function migrateLegacyLeaderboard() {
    const existing =
        readJSON(
            STORAGE_KEYS.SHARED_LEADERBOARD,
            null
        );

    /*
     * If the new shared leaderboard already exists,
     * use it.
     */
    if (Array.isArray(existing)) {
        return normalizePlayers(existing);
    }


    /*
     * First check the old global player storage.
     */
    const legacyPlayers =
        readJSON(
            STORAGE_KEYS.LEGACY_PLAYERS,
            []
        );

    if (
        Array.isArray(legacyPlayers) &&
        legacyPlayers.length > 0
    ) {
        const normalized =
            normalizePlayers(legacyPlayers);

        saveSharedLeaderboard(normalized);

        return normalized;
    }


    /*
     * Finally check the previous account-based
     * player storage.
     *
     * This prevents existing player data from
     * disappearing when switching to the shared
     * leaderboard system.
     */
    const accounts = loadAccounts();

    for (const account of accounts) {
        if (
            Array.isArray(account?.players) &&
            account.players.length > 0
        ) {
            const normalized =
                normalizePlayers(
                    account.players
                );

            saveSharedLeaderboard(normalized);

            return normalized;
        }
    }


    /*
     * Nothing existed.
     *
     * Create an empty shared leaderboard.
     */
    saveSharedLeaderboard([]);

    return [];
}


// ============================================================
// SHARED LEADERBOARD
// ============================================================

export function loadSharedLeaderboard() {
    return migrateLegacyLeaderboard();
}


export function saveSharedLeaderboard(players) {
    const normalized =
        normalizePlayers(players);

    writeJSON(
        STORAGE_KEYS.SHARED_LEADERBOARD,
        normalized
    );

    return normalized;
}