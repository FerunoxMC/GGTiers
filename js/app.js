// ============================================================
// GGTIERS - MAIN APPLICATION
// ============================================================

import {
    isAdminUsername,
    getRole
} from "./config.js";

import {
    restoreSession,
    getCurrentUser,
    isCurrentUserAdmin,
    login,
    signUp,
    logout
} from "./auth.js";

import {
    initializeLeaderboard,
    setGamemode,
    renderLeaderboard,
    refreshLeaderboard
} from "./leaderboard.js";

import {
    initializeAdmin
} from "./admin.js";

import {
    initializeSearch
} from "./search.js";


// ============================================================
// DOM HELPER
// ============================================================

function byId(id) {
    return document.getElementById(id);
}


// ============================================================
// AUTH STATE
// ============================================================

let authMode = "login";


// ============================================================
// AUTH MODAL
// ============================================================

function openAuth(mode) {
    authMode = mode;


    const overlay =
        byId("authOverlay");

    const title =
        byId("authTitle");

    const description =
        byId("authDescription");

    const submit =
        byId("authSubmitButton");

    const switchText =
        byId("authSwitchText");

    const switchButton =
        byId("authSwitchButton");

    const password =
        byId("authPassword");


    if (
        authMode ===
        "signup"
    ) {
        title.textContent =
            "Sign Up";


        description.textContent =
            "Create your GGTiers account.";


        submit.textContent =
            "Create Account";


        switchText.textContent =
            "Already have an account?";


        switchButton.textContent =
            "Login";


        password.autocomplete =
            "new-password";

    } else {
        title.textContent =
            "Login";


        description.textContent =
            "Log in to your GGTiers account.";


        submit.textContent =
            "Login";


        switchText.textContent =
            "Don't have an account?";


        switchButton.textContent =
            "Sign Up";


        password.autocomplete =
            "current-password";
    }


    byId(
        "authUsername"
    ).value = "";


    byId(
        "authPassword"
    ).value = "";


    showAuthError("");


    overlay.classList.remove(
        "hidden"
    );


    window.setTimeout(
        () => {
            byId(
                "authUsername"
            )?.focus();
        },
        50
    );
}


// ============================================================
// CLOSE AUTH
// ============================================================

function closeAuth() {
    byId(
        "authOverlay"
    )?.classList.add(
        "hidden"
    );


    showAuthError("");
}


// ============================================================
// AUTH ERROR
// ============================================================

function showAuthError(
    message
) {
    const error =
        byId(
            "authError"
        );


    if (!error) {
        return;
    }


    error.textContent =
        message;


    error.classList.toggle(
        "hidden",
        !message
    );
}


// ============================================================
// ACCOUNT UI
// ============================================================

function updateAccountUI() {
    const user =
        getCurrentUser();


    const loggedOutControls =
        byId(
            "loggedOutControls"
        );


    const loggedInControls =
        byId(
            "loggedInControls"
        );


    const currentUsername =
        byId(
            "currentUsername"
        );


    const currentRole =
        byId(
            "currentRole"
        );


    const adminButton =
        byId(
            "adminButton"
        );


    /*
     * No logged-in account.
     */
    if (!user) {
        loggedOutControls?.classList.remove(
            "hidden"
        );


        loggedInControls?.classList.add(
            "hidden"
        );


        /*
         * Nobody can edit while logged out.
         */
        renderLeaderboard(
            false
        );


        return;
    }


    /*
     * Logged in.
     */
    loggedOutControls?.classList.add(
        "hidden"
    );


    loggedInControls?.classList.remove(
        "hidden"
    );


    currentUsername.textContent =
        user.username;


    const role =
        getRole(
            user.username
        );


    currentRole.textContent =
        role;


    currentRole.className =
        `role-badge ${
            role === "Admin"
                ? "admin"
                : "viewer"
        }`;


    const admin =
        isAdminUsername(
            user.username
        );


    /*
     * Only FerunoxMC gets the
     * Admin button.
     */
    adminButton?.classList.toggle(
        "hidden",
        !admin
    );


    /*
     * Only FerunoxMC can edit
     * tiers directly.
     *
     * Viewers are read-only.
     */
    renderLeaderboard(
        admin
    );
}


// ============================================================
// ADMIN MODAL
// ============================================================

function openAdmin() {
    if (
        !isCurrentUserAdmin()
    ) {
        return;
    }


    byId(
        "adminOverlay"
    )?.classList.remove(
        "hidden"
    );
}


function closeAdmin() {
    byId(
        "adminOverlay"
    )?.classList.add(
        "hidden"
    );
}


// ============================================================
// AUTH SUBMISSION
// ============================================================

async function handleAuthSubmit(
    event
) {
    event.preventDefault();


    const username =
        byId(
            "authUsername"
        )
            .value
            .trim();


    const password =
        byId(
            "authPassword"
        ).value;


    showAuthError("");


    if (
        !username ||
        !password
    ) {
        showAuthError(
            "Enter a username and password."
        );

        return;
    }


    const submitButton =
        byId(
            "authSubmitButton"
        );


    const originalText =
        submitButton.textContent;


    submitButton.disabled =
        true;


    submitButton.textContent =
        "Please wait...";


    try {
        if (
            authMode ===
            "signup"
        ) {
            await signUp(
                username,
                password
            );
        } else {
            await login(
                username,
                password
            );
        }


        closeAuth();


        /*
         * Reload the SAME shared leaderboard.
         *
         * Logging into another account does
         * not create another leaderboard.
         */
        refreshLeaderboard(
            isCurrentUserAdmin()
        );


        updateAccountUI();

    } catch (error) {
        showAuthError(
            error?.message ||
            "Something went wrong."
        );

    } finally {
        submitButton.disabled =
            false;


        submitButton.textContent =
            originalText;
    }
}


// ============================================================
// LOGOUT
// ============================================================

function handleLogout() {
    logout();


    closeAdmin();


    updateAccountUI();
}


// ============================================================
// GAME MODE TABS
// ============================================================

function initializeGamemodeTabs() {
    document
        .querySelectorAll(
            ".gamemode-tab"
        )
        .forEach(
            tab => {
                tab.addEventListener(
                    "click",
                    () => {
                        setGamemode(
                            tab.dataset.gamemode
                        );
                    }
                );
            }
        );
}


// ============================================================
// COPY SERVER IP
// ============================================================

async function copyServerIp() {
    const input =
        byId(
            "serverIp"
        );


    const status =
        byId(
            "copyIpStatus"
        );


    const value =
        input?.value ||
        "play.vantamc.com";


    /*
     * Modern clipboard API.
     */
    try {
        await navigator.clipboard.writeText(
            value
        );

    } catch {
        /*
         * Older-browser fallback.
         */
        input?.focus();
        input?.select();


        try {
            document.execCommand(
                "copy"
            );
        } catch {
            // Nothing else to do.
        }


        input?.blur();
    }


    if (status) {
        status.textContent =
            "Copied!";


        window.setTimeout(
            () => {
                status.textContent =
                    "";
            },
            1800
        );
    }
}


// ============================================================
// DISCORD BUTTON
// ============================================================

function initializeDiscordButton() {
    /*
     * Intentionally empty for now.
     *
     * The Discord button will eventually
     * link to the GGTiers Discord server.
     */
    byId(
        "discordButton"
    )?.addEventListener(
        "click",
        () => {
            // Discord link coming later.
        }
    );
}


// ============================================================
// MODALS
// ============================================================

function initializeModals() {

    /*
     * Auth close.
     */
    byId(
        "authCloseButton"
    )?.addEventListener(
        "click",
        closeAuth
    );


    /*
     * Admin close.
     */
    byId(
        "adminCloseButton"
    )?.addEventListener(
        "click",
        closeAdmin
    );


    /*
     * Clicking outside the auth modal
     * closes it.
     */
    byId(
        "authOverlay"
    )?.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                event.currentTarget
            ) {
                closeAuth();
            }
        }
    );


    /*
     * Clicking outside the admin modal
     * closes it.
     */
    byId(
        "adminOverlay"
    )?.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                event.currentTarget
            ) {
                closeAdmin();
            }
        }
    );


    /*
     * Escape closes open modals.
     */
    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            closeAuth();
            closeAdmin();


            byId(
                "playerSearchOverlay"
            )?.classList.add(
                "hidden"
            );
        }
    );
}


// ============================================================
// ACCOUNT BUTTONS
// ============================================================

function initializeAccountButtons() {

    /*
     * Login.
     */
    byId(
        "loginButton"
    )?.addEventListener(
        "click",
        () => {
            openAuth(
                "login"
            );
        }
    );


    /*
     * Signup.
     */
    byId(
        "signupButton"
    )?.addEventListener(
        "click",
        () => {
            openAuth(
                "signup"
            );
        }
    );


    /*
     * Logout.
     */
    byId(
        "logoutButton"
    )?.addEventListener(
        "click",
        handleLogout
    );


    /*
     * Admin.
     */
    byId(
        "adminButton"
    )?.addEventListener(
        "click",
        openAdmin
    );


    /*
     * Login <-> Signup switch.
     */
    byId(
        "authSwitchButton"
    )?.addEventListener(
        "click",
        () => {
            openAuth(
                authMode ===
                    "login"
                    ? "signup"
                    : "login"
            );
        }
    );


    /*
     * Auth form.
     */
    byId(
        "authForm"
    )?.addEventListener(
        "submit",
        handleAuthSubmit
    );
}


// ============================================================
// SHARED LEADERBOARD EVENTS
// ============================================================

function initializeLeaderboardEvents() {

    /*
     * This event fires when another browser tab
     * changes the shared localStorage leaderboard.
     */
    window.addEventListener(
        "storage",
        event => {
            if (
                event.key ===
                "ggtiers_shared_leaderboard_v1"
            ) {
                refreshLeaderboard(
                    isCurrentUserAdmin()
                );
            }
        }
    );


    /*
     * Internal GGTiers event.
     */
    window.addEventListener(
        "ggtiers:leaderboard-changed",
        () => {
            refreshLeaderboard(
                isCurrentUserAdmin()
            );
        }
    );


    /*
     * Gamemode changed.
     */
    window.addEventListener(
        "ggtiers:gamemode-changed",
        () => {
            renderLeaderboard(
                isCurrentUserAdmin()
            );
        }
    );
}


// ============================================================
// INITIALIZATION
// ============================================================

function initialize() {

    /*
     * Restore whoever was previously logged in.
     */
    restoreSession();


    /*
     * Load the SINGLE shared leaderboard.
     */
    initializeLeaderboard();


    /*
     * Game mode tabs.
     */
    initializeGamemodeTabs();


    /*
     * Admin system.
     */
    initializeAdmin();


    /*
     * Player search.
     */
    initializeSearch();


    /*
     * Authentication buttons/forms.
     */
    initializeAccountButtons();


    /*
     * Modal behavior.
     */
    initializeModals();


    /*
     * Discord.
     */
    initializeDiscordButton();


    /*
     * Copy IP.
     */
    byId(
        "copyIpButton"
    )?.addEventListener(
        "click",
        copyServerIp
    );


    /*
     * Shared leaderboard updates.
     */
    initializeLeaderboardEvents();


    /*
     * Finally update the account UI.
     */
    updateAccountUI();
}


// ============================================================
// START APPLICATION
// ============================================================

initialize();