// ============================================================
// GGTIERS - PLAYER SEARCH
// ============================================================

import {
    GAMEMODES,
    GAMEMODE_IMAGES,
    tierClass,
    MCHEADS_AVATAR,
    MCHEADS_FALLBACK
} from "./config.js";

import {
    findPlayer,
    getOverallPoints,
    getTierPoints
} from "./leaderboard.js";


// ============================================================
// HELPER
// ============================================================

function byId(id) {
    return document.getElementById(id);
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
        `search-stat-card-tier ${tierClass(tier)}`;


    element.textContent =
        tier;


    return element;
}


// ============================================================
// SHOW PLAYER
// ============================================================

function showPlayer(
    player
) {
    const content =
        byId(
            "playerSearchContent"
        );


    if (!content) {
        return;
    }


    content.innerHTML =
        "";


    // ========================================================
    // NO RESULT
    // ========================================================

    if (!player) {
        const noResult =
            document.createElement(
                "div"
            );


        noResult.className =
            "search-no-result";


        const icon =
            document.createElement(
                "div"
            );


        icon.className =
            "search-no-result-icon";


        icon.textContent =
            "🔎";


        const title =
            document.createElement(
                "h3"
            );


        title.textContent =
            "Player Not Found";


        const description =
            document.createElement(
                "p"
            );


        description.textContent =
            "No player matching that search was found on GGTiers.";


        noResult.appendChild(
            icon
        );


        noResult.appendChild(
            title
        );


        noResult.appendChild(
            description
        );


        content.appendChild(
            noResult
        );


        return;
    }


    // ========================================================
    // PLAYER HEADER
    // ========================================================

    const header =
        document.createElement(
            "div"
        );


    header.className =
        "search-player-header";


    const avatar =
        document.createElement(
            "img"
        );


    avatar.className =
        "search-player-avatar";


    avatar.src =
        player.avatarUrl ||
        MCHEADS_AVATAR(
            player.username
        );


    avatar.alt =
        `${player.username}'s Minecraft avatar`;


    avatar.addEventListener(
        "error",
        () => {
            if (
                avatar.src.endsWith(
                    MCHEADS_FALLBACK
                )
            ) {
                return;
            }


            avatar.src =
                MCHEADS_FALLBACK;
        }
    );


    const nameContainer =
        document.createElement(
            "div"
        );


    const name =
        document.createElement(
            "div"
        );


    name.className =
        "search-player-name";


    name.textContent =
        player.username;


    const overall =
        document.createElement(
            "div"
        );


    overall.className =
        "search-player-overall";


    overall.textContent =
        `${getOverallPoints(player)} Overall Points`;


    nameContainer.appendChild(
        name
    );


    nameContainer.appendChild(
        overall
    );


    header.appendChild(
        avatar
    );


    header.appendChild(
        nameContainer
    );


    // ========================================================
    // STAT GRID
    // ========================================================

    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "search-stats-grid";


    for (
        const gamemode
        of GAMEMODES
    ) {
        const tier =
            player.tiers[
                gamemode
            ] || "LT5";


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "search-stat-card";


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


        const info =
            document.createElement(
                "div"
            );


        info.className =
            "search-stat-card-info";


        const modeName =
            document.createElement(
                "div"
            );


        modeName.className =
            "search-stat-card-name";


        modeName.textContent =
            gamemode;


        const tierElement =
            createTierElement(
                tier
            );


        const points =
            document.createElement(
                "div"
            );


        points.className =
            "search-stat-card-points";


        points.textContent =
            `${getTierPoints(tier)} points`;


        info.appendChild(
            modeName
        );


        info.appendChild(
            tierElement
        );


        info.appendChild(
            points
        );


        card.appendChild(
            image
        );


        card.appendChild(
            info
        );


        grid.appendChild(
            card
        );
    }


    content.appendChild(
        header
    );


    content.appendChild(
        grid
    );
}


// ============================================================
// INITIALIZE SEARCH
// ============================================================

export function initializeSearch() {
    const input =
        byId(
            "playerSearchInput"
        );


    const button =
        byId(
            "playerSearchButton"
        );


    const overlay =
        byId(
            "playerSearchOverlay"
        );


    const closeButton =
        byId(
            "playerSearchCloseButton"
        );


    // ========================================================
    // SEARCH
    // ========================================================

    function performSearch() {
        const query =
            input?.value.trim();


        if (!query) {
            showPlayer(null);

            overlay?.classList.remove(
                "hidden"
            );

            return;
        }


        const player =
            findPlayer(query);


        showPlayer(
            player
        );


        overlay?.classList.remove(
            "hidden"
        );
    }


    button?.addEventListener(
        "click",
        performSearch
    );


    input?.addEventListener(
        "keydown",
        event => {
            if (
                event.key ===
                "Enter"
            ) {
                performSearch();
            }
        }
    );


    // ========================================================
    // CLOSE
    // ========================================================

    closeButton?.addEventListener(
        "click",
        () => {
            overlay?.classList.add(
                "hidden"
            );
        }
    );


    overlay?.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                overlay
            ) {
                overlay.classList.add(
                    "hidden"
                );
            }
        }
    );
}