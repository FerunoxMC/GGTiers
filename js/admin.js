// ============================================================
// GGTIERS - ADMIN PANEL
// ============================================================

import {
    GAMEMODES,
    TIER_ORDER
} from "./config.js";

import {
    isCurrentUserAdmin
} from "./auth.js";

import {
    getPlayers,
    addOrUpdatePlayer,
    updatePlayerTier,
    removePlayer
} from "./leaderboard.js";


// ============================================================
// HELPER
// ============================================================

function byId(id) {
    return document.getElementById(id);
}


// ============================================================
// ERROR MESSAGE
// ============================================================

function setError(
    id,
    message = ""
) {
    const element =
        byId(id);


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.toggle(
        "hidden",
        !message
    );
}


// ============================================================
// FILL SELECT
// ============================================================

function fillSelect(
    select,
    values
) {
    if (!select) {
        return;
    }


    select.innerHTML =
        "";


    for (
        const value
        of values
    ) {
        const option =
            document.createElement(
                "option"
            );


        option.value =
            value;


        option.textContent =
            value;


        select.appendChild(
            option
        );
    }
}


// ============================================================
// PLAYER SELECTS
// ============================================================

export function refreshPlayerSelects() {
    const players =
        getPlayers();


    const sortedPlayers =
        [...players].sort(
            (a, b) =>
                a.username.localeCompare(
                    b.username,
                    undefined,
                    {
                        sensitivity:
                            "base"
                    }
                )
        );


    const selectIds = [
        "adminUpdatePlayer",
        "adminRemovePlayer"
    ];


    for (
        const id
        of selectIds
    ) {
        const select =
            byId(id);


        if (!select) {
            continue;
        }


        const previousValue =
            select.value;


        select.innerHTML =
            "";


        if (
            sortedPlayers.length ===
            0
        ) {
            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "No players available";


            option.disabled =
                true;


            option.selected =
                true;


            select.appendChild(
                option
            );


            continue;
        }


        for (
            const player
            of sortedPlayers
        ) {
            const option =
                document.createElement(
                    "option"
                );


            option.value =
                player.username;


            option.textContent =
                player.username;


            select.appendChild(
                option
            );
        }


        const previousStillExists =
            sortedPlayers.some(
                player =>
                    player.username ===
                    previousValue
            );


        if (
            previousStillExists
        ) {
            select.value =
                previousValue;
        }
    }
}


// ============================================================
// INITIALIZE
// ============================================================

export function initializeAdmin() {

    /*
     * Add form.
     */
    fillSelect(
        byId("adminAddGamemode"),
        GAMEMODES
    );


    fillSelect(
        byId("adminAddTier"),
        TIER_ORDER
    );


    /*
     * Update form.
     */
    fillSelect(
        byId("adminUpdateGamemode"),
        GAMEMODES
    );


    fillSelect(
        byId("adminUpdateTier"),
        TIER_ORDER
    );


    /*
     * Player lists.
     */
    refreshPlayerSelects();


    // ========================================================
    // ADD
    // ========================================================

    byId("adminAddForm")
        ?.addEventListener(
            "submit",
            event => {
                event.preventDefault();


                if (
                    !isCurrentUserAdmin()
                ) {
                    setError(
                        "adminAddError",
                        "You do not have permission to use the admin panel."
                    );

                    return;
                }


                setError(
                    "adminAddError"
                );


                try {
                    const username =
                        byId(
                            "adminAddUsername"
                        )
                            .value
                            .trim();


                    const gamemode =
                        byId(
                            "adminAddGamemode"
                        ).value;


                    const tier =
                        byId(
                            "adminAddTier"
                        ).value;


                    addOrUpdatePlayer(
                        username,
                        gamemode,
                        tier
                    );


                    byId(
                        "adminAddUsername"
                    ).value =
                        "";


                    refreshPlayerSelects();


                    alert(
                        `${username} was added/updated successfully.`
                    );

                } catch (error) {
                    setError(
                        "adminAddError",
                        error.message
                    );
                }
            }
        );


    // ========================================================
    // UPDATE
    // ========================================================

    byId("adminUpdateForm")
        ?.addEventListener(
            "submit",
            event => {
                event.preventDefault();


                if (
                    !isCurrentUserAdmin()
                ) {
                    setError(
                        "adminUpdateError",
                        "You do not have permission to use the admin panel."
                    );

                    return;
                }


                setError(
                    "adminUpdateError"
                );


                try {
                    const username =
                        byId(
                            "adminUpdatePlayer"
                        ).value;


                    const gamemode =
                        byId(
                            "adminUpdateGamemode"
                        ).value;


                    const tier =
                        byId(
                            "adminUpdateTier"
                        ).value;


                    updatePlayerTier(
                        username,
                        gamemode,
                        tier
                    );


                    refreshPlayerSelects();


                    alert(
                        `${username}'s ${gamemode} tier was updated to ${tier}.`
                    );

                } catch (error) {
                    setError(
                        "adminUpdateError",
                        error.message
                    );
                }
            }
        );


    // ========================================================
    // REMOVE
    // ========================================================

    byId("adminRemoveForm")
        ?.addEventListener(
            "submit",
            event => {
                event.preventDefault();


                if (
                    !isCurrentUserAdmin()
                ) {
                    setError(
                        "adminRemoveError",
                        "You do not have permission to use the admin panel."
                    );

                    return;
                }


                setError(
                    "adminRemoveError"
                );


                const username =
                    byId(
                        "adminRemovePlayer"
                    ).value;


                if (!username) {
                    setError(
                        "adminRemoveError",
                        "Select a player first."
                    );

                    return;
                }


                const confirmed =
                    window.confirm(
                        `Remove ${username} from the leaderboard?\n\nThis will permanently remove all of their tiers.`
                    );


                if (!confirmed) {
                    return;
                }


                try {
                    removePlayer(
                        username
                    );


                    refreshPlayerSelects();


                    alert(
                        `${username} was removed from the leaderboard.`
                    );

                } catch (error) {
                    setError(
                        "adminRemoveError",
                        error.message
                    );
                }
            }
        );


    // ========================================================
    // ADMIN ACTION TABS
    // ========================================================

    document
        .querySelectorAll(
            ".admin-tab"
        )
        .forEach(
            tab => {
                tab.addEventListener(
                    "click",
                    () => {
                        const action =
                            tab.dataset.adminAction;


                        document
                            .querySelectorAll(
                                ".admin-tab"
                            )
                            .forEach(
                                item => {
                                    item.classList.toggle(
                                        "active",
                                        item ===
                                            tab
                                    );
                                }
                            );


                        const panels = {
                            add:
                                byId(
                                    "adminAddPanel"
                                ),

                            update:
                                byId(
                                    "adminUpdatePanel"
                                ),

                            remove:
                                byId(
                                    "adminRemovePanel"
                                )
                        };


                        for (
                            const [
                                key,
                                panel
                            ]
                            of Object.entries(
                                panels
                            )
                        ) {
                            panel?.classList.toggle(
                                "hidden",
                                key !==
                                    action
                            );
                        }


                        refreshPlayerSelects();
                    }
                );
            }
        );


    // ========================================================
    // UPDATE PLAYER LIST WHEN LEADERBOARD CHANGES
    // ========================================================

    window.addEventListener(
        "ggtiers:leaderboard-changed",
        () => {
            refreshPlayerSelects();
        }
    );
}