// ============================================================
// GGTIERS - AUTHENTICATION
// ============================================================

import {
    getRole,
    isAdminUsername
} from "./config.js";

import {
    loadAccounts,
    saveAccounts,
    saveCurrentUsername,
    clearCurrentUsername,
    loadCurrentUsername
} from "./storage.js";


// ============================================================
// CURRENT USER
// ============================================================

let currentUser = null;


// ============================================================
// USERNAME NORMALIZATION
// ============================================================

function normalizeUsername(username) {
    return String(
        username || ""
    ).trim();
}


// ============================================================
// USERNAME VALIDATION
// ============================================================

export function validateUsername(username) {
    const value =
        normalizeUsername(username);

    return /^[A-Za-z0-9_]{3,16}$/.test(
        value
    );
}


// ============================================================
// PASSWORD HASHING
// ============================================================

async function hashPassword(password) {
    const value =
        String(password || "");


    /*
     * Use SHA-256 when Web Crypto is available.
     */
    if (
        window.crypto &&
        window.crypto.subtle
    ) {
        const data =
            new TextEncoder().encode(value);

        const hash =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );

        return [...new Uint8Array(hash)]
            .map(
                byte =>
                    byte
                        .toString(16)
                        .padStart(2, "0")
            )
            .join("");
    }


    /*
     * Fallback for simple local prototypes.
     *
     * This is NOT suitable for a real public
     * authentication system.
     */
    let hash = 2166136261;

    for (
        let i = 0;
        i < value.length;
        i++
    ) {
        hash ^= value.charCodeAt(i);

        hash = Math.imul(
            hash,
            16777619
        );
    }

    return (
        "fallback_" +
        (hash >>> 0).toString(16)
    );
}


// ============================================================
// CURRENT USER
// ============================================================

export function getCurrentUser() {
    return currentUser;
}


export function getCurrentRole() {
    if (!currentUser) {
        return null;
    }

    return getRole(
        currentUser.username
    );
}


export function isCurrentUserAdmin() {
    return Boolean(
        currentUser &&
        isAdminUsername(
            currentUser.username
        )
    );
}


// ============================================================
// SIGN UP
// ============================================================

export async function signUp(
    username,
    password
) {
    username =
        normalizeUsername(username);

    if (!validateUsername(username)) {
        throw new Error(
            "Username must be 3-16 characters and use only letters, numbers, or underscores."
        );
    }


    if (
        String(password || "")
            .length < 4
    ) {
        throw new Error(
            "Password must be at least 4 characters."
        );
    }


    const accounts =
        loadAccounts();


    /*
     * Account names are case-insensitive.
     */
    const alreadyExists =
        accounts.some(
            account =>
                String(
                    account.username
                ).toLowerCase() ===
                username.toLowerCase()
        );


    if (alreadyExists) {
        throw new Error(
            "That username is already registered."
        );
    }


    const passwordHash =
        await hashPassword(
            password
        );


    /*
     * Nobody can select Admin during signup.
     *
     * FerunoxMC receives Admin status
     * automatically through getRole().
     */
    const account = {
        username,
        passwordHash,
        role: "Viewer"
    };


    accounts.push(account);

    saveAccounts(accounts);


    currentUser = {
        username:
            account.username,

        role:
            getRole(
                account.username
            )
    };


    saveCurrentUsername(
        account.username
    );


    return currentUser;
}


// ============================================================
// LOGIN
// ============================================================

export async function login(
    username,
    password
) {
    username =
        normalizeUsername(username);


    const accounts =
        loadAccounts();


    const account =
        accounts.find(
            item =>
                String(
                    item.username
                ).toLowerCase() ===
                username.toLowerCase()
        );


    if (!account) {
        throw new Error(
            "Incorrect username or password."
        );
    }


    const passwordHash =
        await hashPassword(
            password
        );


    if (
        passwordHash !==
        account.passwordHash
    ) {
        throw new Error(
            "Incorrect username or password."
        );
    }


    currentUser = {
        username:
            account.username,

        role:
            getRole(
                account.username
            )
    };


    saveCurrentUsername(
        account.username
    );


    return currentUser;
}


// ============================================================
// LOGOUT
// ============================================================

export function logout() {
    currentUser = null;

    clearCurrentUsername();
}


// ============================================================
// RESTORE SESSION
// ============================================================

export function restoreSession() {
    const username =
        loadCurrentUsername();


    if (!username) {
        currentUser = null;

        return null;
    }


    const accounts =
        loadAccounts();


    const account =
        accounts.find(
            item =>
                String(
                    item.username
                ).toLowerCase() ===
                username.toLowerCase()
        );


    if (!account) {
        clearCurrentUsername();

        currentUser = null;

        return null;
    }


    currentUser = {
        username:
            account.username,

        role:
            getRole(
                account.username
            )
    };


    return currentUser;
}