// ============================================================
// GGTIERS - LEADERBOARD
// ============================================================

import {
    GAMEMODES,
    GAMEMODE_IMAGES,
    TIER_ORDER,
    TIER_POINTS,
    MCHEADS_AVATAR,
    MCHEADS_FALLBACK,
    tierClass
} from "./config.js";

import {
    loadSharedLeaderboard,
    saveSharedLeaderboard,
    normalizePlayer
} from "./storage.js";


// ============================================================
// STATE
// ============================================================

let players = [];

let currentGamemode = "Overall";


// ============================================================
// DOM
// ============================================================

const leaderboardElement =
    document.getElementById(
        "leaderboard"
    );

const emptyLeaderboardElement =
    document.getElementById(
        "emptyLeaderboard"
    );

const leaderboardTitle =
    document.getElementById(
        "leaderboardTitle"
    );

const leaderboardDescription =
    document.getElementById(
        "leaderboardDescription"
    );

const leaderboardCount =
    document.getElementById(
        "leaderboardCount"
    );


// ============================================================
// INITIALIZATION
// ============================================================

export function initializeLeaderboard() {
    players =
        loadSharedLeaderboard();

    renderLeaderboard(false);
}


// ============================================================
// PLAYERS
// ============================================================

export function getPlayers() {
    return players;
}


export function setPlayers(
    nextPlayers,
    persist = true
) {
    players =
        Array.isArray(nextPlayers)
            ? nextPlayers
            : [];


    if (persist) {
        players =
            saveSharedLeaderboard(
                players
            );
    }


    renderLeaderboard(false);
}


// ============================================================
// CURRENT GAME MODE
// ============================================================

export function getCurrentGamemode() {
    return currentGamemode;
}


export function setGamemode(gamemode) {
    if (
        gamemode !== "Overall" &&
        !GAMEMODES.includes(gamemode)
    ) {
        return;
    }


    currentGamemode =
        gamemode;


    updateActiveGamemodeTab();

    /*
     * app.js will re-render with the
     * correct editing permissions.
     */
    window.dispatchEvent(
        new CustomEvent(
            "ggtiers:gamemode-changed"
        )
    );
}


// ============================================================
// FIND PLAYER
// ============================================================

export function findPlayer(username) {
    const query =
        String(
            username || ""
        )
            .trim()
            .toLowerCase();


    if (!query) {
        return null;
    }


    /*
     * Exact match first.
     */
    const exact =
        players.find(
            player =>
                player.username
                    .toLowerCase() ===
                query
        );


    if (exact) {
        return exact;
    }


    /*
     * Then partial match.
     */
    return (
        players.find(
            player =>
                player.username
                    .toLowerCase()
                    .includes(query)
        ) || null
    );
}


export function getPlayer(username) {
    return findPlayer(username);
}


// ============================================================
// ADD / SET PLAYER TIER
// ============================================================

export function addOrUpdatePlayer(
    username,
    gamemode,
    tier
) {
    username =
        String(
            username || ""
        ).trim();


    if (!username) {
        throw new Error(
            "Player username is required."
        );
    }


    if (
        !/^[A-Za-z0-9_]{3,16}$/.test(
            username
        )
    ) {
        throw new Error(
            "Player username must be 3-16 characters and use only letters, numbers, or underscores."
        );
    }


    if (
        !GAMEMODES.includes(
            gamemode
        )
    ) {
        throw new Error(
            "Invalid gamemode."
        );
    }


    if (
        !TIER_ORDER.includes(tier)
    ) {
        throw new Error(
            "Invalid tier."
        );
    }


    let player =
        players.find(
            item =>
                item.username
                    .toLowerCase() ===
                username.toLowerCase()
        );


    /*
     * If the player does not exist,
     * create them with LT5 in every mode.
     */
    if (!player) {
        player =
            normalizePlayer({
                username,
                avatarUrl:
                    MCHEADS_AVATAR(
                        username
                    )
            });

        players.push(player);
    }


    player.tiers[gamemode] =
        tier;


    players =
        saveSharedLeaderboard(
            players
        );


    window.dispatchEvent(
        new CustomEvent(
            "ggtiers:leaderboard-changed"
        )
    );


    return player;
}


// ============================================================
// UPDATE PLAYER TIER
// ============================================================

export function updatePlayerTier(
    username,
    gamemode,
    tier
) {
    const player =
        players.find(
            item =>
                item.username
                    .toLowerCase() ===
                String(
                    username
                ).toLowerCase()
        );


    if (!player) {
        throw new Error(
            "Player not found."
        );
    }


    if (
        !GAMEMODES.includes(
            gamemode
        )
    ) {
        throw new Error(
            "Invalid gamemode."
        );
    }


    if (
        !TIER_ORDER.includes(
            tier
        )
    ) {
        throw new Error(
            "Invalid tier."
        );
    }


    player.tiers[gamemode] =
        tier;


    players =
        saveSharedLeaderboard(
            players
        );


    window.dispatchEvent(
        new CustomEvent(
            "ggtiers:leaderboard-changed"
        )
    );


    return player;
}


// ============================================================
// REMOVE PLAYER
// ============================================================

export function removePlayer(
    username
) {
    const query =
        String(
            username || ""
        )
            .trim()
            .toLowerCase();


    const index =
        players.findIndex(
            player =>
                player.username
                    .toLowerCase() ===
                query
        );


    if (index === -1) {
        throw new Error(
            "Player not found."
        );
    }


    const removed =
        players.splice(
            index,
            1
        )[0];


    players =
        saveSharedLeaderboard(
            players
        );


    window.dispatchEvent(
        new CustomEvent(
            "ggtiers:leaderboard-changed"
        )
    );


    return removed;
}


// ============================================================
// CHANGE TIER BY ONE LEVEL
// ============================================================

export function cycleTier(
    username,
    gamemode,
    direction
) {
    const player =
        players.find(
            item =>
                item.username
                    .toLowerCase() ===
                String(
                    username
                ).toLowerCase()
        );


    if (!player) {
        return;
    }


    const currentTier =
        player.tiers[gamemode] ||
        "LT5";


    const currentIndex =
        TIER_ORDER.indexOf(
            currentTier
        );


    if (currentIndex === -1) {
        return;
    }


    const nextIndex =
        Math.max(
            0,
            Math.min(
                TIER_ORDER.length - 1,
                currentIndex + direction
            )
        );


    if (
        nextIndex ===
        currentIndex
    ) {
        return;
    }


    player.tiers[gamemode] =
        TIER_ORDER[nextIndex];


    players =
        saveSharedLeaderboard(
            players
        );


    window.dispatchEvent(
        new CustomEvent(
            "ggtiers:leaderboard-changed"
        )
    );
}


// ============================================================
// TIER POINTS
// ============================================================

export function getTierPoints(
    tier
) {
    return (
        TIER_POINTS[tier] ||
        0
    );
}


// ============================================================
// OVERALL POINTS
// ============================================================

export function getOverallPoints(
    player
) {
    return GAMEMODES.reduce(
        (
            total,
            gamemode
        ) =>
            total +
            getTierPoints(
                player.tiers[
                    gamemode
                ]
            ),
        0
    );
}


// ============================================================
// SORT PLAYERS
// ============================================================

export function getSortedPlayers() {
    const sorted =
        [...players];


    /*
     * Overall:
     * highest total points first.
     */
    if (
        currentGamemode ===
        "Overall"
    ) {
        sorted.sort(
            (a, b) => {
                const difference =
                    getOverallPoints(b) -
                    getOverallPoints(a);


                if (
                    difference !== 0
                ) {
                    return difference;
                }


                return a.username.localeCompare(
                    b.username,
                    undefined,
                    {
                        sensitivity:
                            "base"
                    }
                );
            }
        );


        return sorted;
    }


    /*
     * Individual gamemode:
     * highest tier points first.
     */
    sorted.sort(
        (a, b) => {
            const difference =
                getTierPoints(
                    b.tiers[
                        currentGamemode
                    ]
                ) -
                getTierPoints(
                    a.tiers[
                        currentGamemode
                    ]
                );


            if (
                difference !== 0
            ) {
                return difference;
            }


            return a.username.localeCompare(
                b.username,
                undefined,
                {
                    sensitivity:
                        "base"
                }
            );
        }
    );


    return sorted;
}


// ============================================================
// ACTIVE TAB
// ============================================================

function updateActiveGamemodeTab() {
    document
        .querySelectorAll(
            ".gamemode-tab"
        )
        .forEach(tab => {
            tab.classList.toggle(
                "active",
                tab.dataset.gamemode ===
                    currentGamemode
            );
        });
}


// ============================================================
// PLAYER AVATAR
// ============================================================

function createAvatar(player) {
    const image =
        document.createElement(
            "img"
        );


    image.className =
        "player-avatar";


    image.src =
        player.avatarUrl ||
        MCHEADS_AVATAR(
            player.username
        );


    image.alt =
        `${player.username}'s Minecraft avatar`;


    image.loading = "lazy";


    image.addEventListener(
        "error",
        () => {
            if (
                image.src.endsWith(
                    MCHEADS_FALLBACK
                )
            ) {
                return;
            }


            image.src =
                MCHEADS_FALLBACK;
        }
    );


    return image;
}


// ============================================================
// TIER ELEMENT
// ============================================================

function createTierElement(
    tier
) {
    const element =
        document.createElement(
            "span"
        );


    element.className =
        `tier-text ${tierClass(tier)}`;


    element.textContent =
        tier;


    return element;
}


// ============================================================
// OVERALL STAT
// ============================================================

function createOverallStat(
    player,
    gamemode,
    editable
) {
    const stat =
        document.createElement(
            "div"
        );


    stat.className =
        "gamemode-stat";


    if (editable) {
        stat.classList.add(
            "editable"
        );
    }


    stat.dataset.gamemode =
        gamemode;


    stat.title = editable
        ? `${gamemode}: ${player.tiers[gamemode]} — Left click: upgrade | Right click: downgrade`
        : `${gamemode}: ${player.tiers[gamemode]}`;


    const image =
        document.createElement(
            "img"
        );


    image.src =
        GAMEMODE_IMAGES[
            gamemode
        ];


    image.alt =
        gamemode;


    image.draggable = false;


    stat.appendChild(image);


    stat.appendChild(
        createTierElement(
            player.tiers[gamemode]
        )
    );


    if (editable) {
        stat.addEventListener(
            "click",
            () => {
                cycleTier(
                    player.username,
                    gamemode,
                    1
                );
            }
        );


        stat.addEventListener(
            "contextmenu",
            event => {
                event.preventDefault();

                cycleTier(
                    player.username,
                    gamemode,
                    -1
                );
            }
        );
    }


    return stat;
}


// ============================================================
// INDIVIDUAL MODE STAT
// ============================================================

function createSingleModeStat(
    player,
    gamemode,
    editable
) {
    const stat =
        document.createElement(
            "div"
        );


    stat.className =
        "single-mode-stat";


    if (editable) {
        stat.classList.add(
            "editable"
        );
    }


    stat.dataset.gamemode =
        gamemode;


    const tier =
        player.tiers[
            gamemode
        ] || "LT5";


    stat.classList.add(
        tierClass(tier)
    );


    stat.textContent =
        tier;


    stat.title = editable
        ? "Left click: upgrade | Right click: downgrade"
        : `${gamemode}: ${tier}`;


    if (editable) {
        stat.addEventListener(
            "click",
            () => {
                cycleTier(
                    player.username,
                    gamemode,
                    1
                );
            }
        );


        stat.addEventListener(
            "contextmenu",
            event => {
                event.preventDefault();

                cycleTier(
                    player.username,
                    gamemode,
                    -1
                );
            }
        );
    }


    return stat;
}


// ============================================================
// PLAYER ROW
// ============================================================

function renderPlayer(
    player,
    placement,
    editable
) {
    const row =
        document.createElement(
            "article"
        );


    row.className =
        "player-row";


    if (placement === 1) {
        row.classList.add(
            "placement-first"
        );
    }


    if (placement === 2) {
        row.classList.add(
            "placement-second"
        );
    }


    if (placement === 3) {
        row.classList.add(
            "placement-third"
        );
    }


    /*
     * Player information.
     */
    const information =
        document.createElement(
            "div"
        );


    information.className =
        "player-information";


    const placementElement =
        document.createElement(
            "div"
        );


    placementElement.className =
        "player-placement";


    placementElement.textContent =
        `#${placement}`;


    const avatar =
        createAvatar(player);


    const nameContainer =
        document.createElement(
            "div"
        );


    nameContainer.className =
        "player-name-container";


    const name =
        document.createElement(
            "div"
        );


    name.className =
        "player-name";


    name.textContent =
        player.username;


    const points =
        document.createElement(
            "div"
        );


    points.className =
        "player-points";


    if (
        currentGamemode ===
        "Overall"
    ) {
        points.textContent =
            `${getOverallPoints(player)} points`;
    } else {
        points.textContent =
            `${getTierPoints(
                player.tiers[
                    currentGamemode
                ]
            )} points`;
    }


    nameContainer.appendChild(
        name
    );


    nameContainer.appendChild(
        points
    );


    information.appendChild(
        placementElement
    );


    information.appendChild(
        avatar
    );


    information.appendChild(
        nameContainer
    );


    /*
     * Player stats.
     */
    const stats =
        document.createElement(
            "div"
        );


    stats.className =
        "player-stats";


    if (
        currentGamemode ===
        "Overall"
    ) {
        for (
            const gamemode
            of GAMEMODES
        ) {
            stats.appendChild(
                createOverallStat(
                    player,
                    gamemode,
                    editable
                )
            );
        }
    } else {
        stats.appendChild(
            createSingleModeStat(
                player,
                currentGamemode,
                editable
            )
        );
    }


    row.appendChild(
        information
    );


    row.appendChild(
        stats
    );


    return row;
}


// ============================================================
// RENDER LEADERBOARD
// ============================================================

export function renderLeaderboard(
    editable = false
) {
    if (!leaderboardElement) {
        return;
    }


    leaderboardElement.innerHTML =
        "";


    const sortedPlayers =
        getSortedPlayers();


    if (leaderboardTitle) {
        leaderboardTitle.textContent =
            currentGamemode;
    }


    if (leaderboardDescription) {
        leaderboardDescription.textContent =
            currentGamemode ===
            "Overall"
                ? "Overall Minecraft PvP rankings"
                : `${currentGamemode} Minecraft PvP rankings`;
    }


    if (leaderboardCount) {
        leaderboardCount.textContent =
            `${sortedPlayers.length} ${
                sortedPlayers.length === 1
                    ? "Player"
                    : "Players"
            }`;
    }


    if (emptyLeaderboardElement) {
        emptyLeaderboardElement.classList.toggle(
            "hidden",
            sortedPlayers.length !== 0
        );
    }


    if (
        sortedPlayers.length === 0
    ) {
        return;
    }


    sortedPlayers.forEach(
        (player, index) => {
            leaderboardElement.appendChild(
                renderPlayer(
                    player,
                    index + 1,
                    editable
                )
            );
        }
    );
}


// ============================================================
// REFRESH FROM STORAGE
// ============================================================

export function refreshLeaderboard(
    editable = false
) {
    players =
        loadSharedLeaderboard();

    renderLeaderboard(
        editable
    );
}