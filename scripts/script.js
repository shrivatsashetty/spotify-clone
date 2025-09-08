/* global variables */
const domParser = new DOMParser();

let arrPlaylistPaths = [];

let arrPlaylistObjs = [];

let arrSongPaths = [];

let arrSongObjs = [];

let currentSong = new Audio();

let currentSongObj;

/* the index of the currently playing song in the queue
 * at the beging it will be set to 0 i.e. first song in the queue */
let indexCurrentSong = 0;

let mediaReadyForPlayback = false;

/* the media control buttons i.e. Play, Pause, Next and Previous song buttons */
const btnPlayPauseSong = document.getElementById("btn-play-pause-song");
const btnPlayPreviousSong = document.getElementById("btn-play-previous-song");
const btnPlayNextSong = document.getElementById("btn-play-next-song");

const containerSongCards = document.querySelector("ul.container-song-cards");
const lblCurrentSongName = document.querySelector(".media-state p.media-label");
const lblCurrentSongDuration = document.querySelector(
    ".media-state p.lbl-song-duration"
);

const seekBar = document.querySelector(".seekbar");
const seekBarThumb = document.querySelector(".seekbar .seekbar-thumb");

async function fetchDirectoryContents(directoryPath) {
    let arrContentPaths = [];

    let response = await fetch(directoryPath);
    let strDirContentHTML = await response.text();

    /* parsing the html formatted string to an HTML document */
    const docDirContents = domParser.parseFromString(
        strDirContentHTML,
        "text/html"
    );

    /* the songs will be stored in the td>a element of the doucument */
    let contentPaths = docDirContents.body
        .querySelector("tbody")
        .getElementsByTagName("a");

    /* here we use a classical for loop
     * in order to start the iteration from the element with index 1 */
    for (let i = 1; i < contentPaths.length; i++) {
        const element = contentPaths[i];
        arrContentPaths.push(element.href);
    }

    /* this function returns a promise
     * this promise resolves if the array of song paths is not null
     * otherwise the promise is rejected */
    return new Promise((resolve, reject) => {
        if (arrContentPaths) {
            resolve(arrContentPaths);
        } else {
            reject("Error, No Content Found!!");
        }
    });
}

async function fetchPlaylistsPaths() {
    arrPlaylistPaths = await fetchDirectoryContents("assets/songs/");
}

async function createArrPlaylistObjs() {
    for (const playlistPath of arrPlaylistPaths) {
        let response = await fetch(`${playlistPath}/info.json`);
        let data = await response.json();
        data.playlistPath = playlistPath;
        arrPlaylistObjs.push(data);
    }
}

function createPlaylistCards() {
    const containerPlaylists = document.querySelector(
        ".container-playlists .container-cards"
    );

    for (const playlistObj of arrPlaylistObjs) {
        let strPlaylistCard = `
            <div
                class="card card-playlist flexbox flex-dir-col rounded-corners cursor-pointer"
            >
                <img
                    class="card-img rounded-corners"
                    src="${playlistObj.playlistPath}/cover.jpeg"
                    alt="Song Thumbnail"
                />

                <h3 class="card-heading txt-size-base">
                    ${playlistObj.playlistName}
                </h3>

                <p class="card-desc">${playlistObj.playlistDesc}</p>

                <button
                    type="button"
                    class="btn-rounded btn-play btn-spotify-play border-none cursor-pointer flexbox justify-content-center align-items-center"
                >
                    <img
                        id="img-btn-play"
                        class=""
                        src="assets/icons/btn-play.svg"
                        alt="Play Button"
                    />
                </button>
            </div>
            `;
        /* converting the above HTML formatted string to a HTML document and then an HTML element*/
        let docPlaylistCard = domParser.parseFromString(
            strPlaylistCard,
            "text/html"
        );

        let playlistCard = docPlaylistCard.body.querySelector(".card-playlist");

        /* get the play button inside the playlist card
         * this button will start the first song in the playlist when clicked */
        let btnStartPlaylist = playlistCard.querySelector(".btn-play");

        /* adding an event listner to each playlist card
         * will fetch the song from the playlist and update the songs library */
        playlistCard.addEventListener("click", async () => {
            await updateSongsFromPlaylist(playlistObj);
        });

        /* will first update the songs library from the respective playlist
         * then start the first song in the playlist */
        btnStartPlaylist.addEventListener("click", async (e) => {
            e.stopPropagation();
            await updateSongsFromPlaylist(playlistObj);
            playPauseCurrentSong();
        });

        containerPlaylists.appendChild(playlistCard);
    }
}

/* an asynchronous function that fetches the resources in the song file directory 
    and returns an array of song paths */
async function updateSongPathsFromPlaylist(playlist) {
    let dirContents = await fetchDirectoryContents(playlist.playlistPath);

    /* filter only the song files i.e. the files ending with .mp3 from the directory contents */
    arrSongPaths = dirContents.filter((path) => path.endsWith(".mp3"));
}

/* a function to extract the name of the song given the path to the song file */
function getSongNameFromPath(songFilePath) {
    /* split the filepath based on the "/" as the delimiter  */
    let songName = songFilePath.split("/").at(-1);
    /* remove the extension ".mp3" */
    songName = songName.replace(".mp3", "");

    songName = songName.replaceAll("_", " ");

    return songName;
}

/* a function to create song objects using the array of song paths */
function createArrSongObjs(arrSongPaths) {
    /* clear any item in the array that already exist */
    arrSongObjs = [];

    let songName;

    for (let i = 0; i < arrSongPaths.length; i++) {
        const songPath = arrSongPaths[i];

        songName = getSongNameFromPath(songPath);

        /* we push the individual song object into the songs object array */
        arrSongObjs.push({
            songName: songName,
            songPath: songPath,
            songIndex: i,
        });
    }
}

/* a function to play or pause the current song */
function playPauseCurrentSong() {
    highlightCurrentSong();
    updateCurrentSongLabel();

    if (currentSong.paused) {
        currentSong.play();
    } else {
        currentSong.pause();
    }
}

/* a function to play any selected song from the array of songs
 * the same function can be reused for handling click of nextSong and previous song */
function updateCurrentSong(songIndex) {
    if (songIndex > arrSongPaths.length - 1) {
        indexCurrentSong = 0;
    } else if (songIndex < 0) {
        indexCurrentSong = arrSongPaths.length - 1;
    } else {
        indexCurrentSong = songIndex;
    }

    /* update the src attribute of the current Audio element
     * i.e. currentSong */
    currentSong.src = arrSongPaths[indexCurrentSong];

    /* also update the current song object */
    currentSongObj = arrSongObjs[indexCurrentSong];

    playPauseCurrentSong();
}

/* this function updates the name of the currently playing song label
 * in the media controls */
function updateCurrentSongLabel() {
    lblCurrentSongName.innerText = currentSongObj.songName;
}

function highlightCurrentSong() {
    for (const card of containerSongCards.children) {
        let cardDesc = card.querySelector("p");

        if (cardDesc.classList.contains("highlighted-card")) {
            cardDesc.classList.remove("highlighted-card");
            break;
        }
    }

    containerSongCards.children[indexCurrentSong]
        .querySelector("p")
        .classList.add("highlighted-card");
}

/* a function to create the songs library */
function createSongsLibrary() {
    /* first empty the existing contents of the 
    sidebar */
    containerSongCards.innerHTML = "";

    for (const songObj of arrSongObjs) {
        let strSongCardHTML = `
            <li class="card-song flexbox space-between rounded-corners pad-1 cursor-pointer"
                data-song-name="${songObj.songName}" data-song-path="${songObj.songPath}" data-song-index="${songObj.songIndex}"
            >

                <div class="song-label flexbox">
                    <img 
                        class="invert"
                        src="assets/icons/song.svg" alt="Song Icon"
                    >

                    <div class="song-info flexbox flex-dir-col justify-content-center">
                        <p>
                            ${songObj.songName}
                        </p>
                    </div>

                </div>

                <img class="invert" 
                    src="assets/icons/tripple-dots-vertical.svg" alt="Options Icon"
                >
            </li>
            `;

        /* converting the above HTML formatted string to a HTML document and then an HTML element*/
        let songCard = domParser.parseFromString(strSongCardHTML, "text/html");
        songCard = songCard.querySelector("li");

        /* adding an event listner to each song */
        songCard.addEventListener("click", () => {
            updateCurrentSong(songObj.songIndex);
        });

        containerSongCards.appendChild(songCard);
    }
}

/* a function that takes time in seconds
 * and converts to the format MM:SS */
function convertTimeFormatToMMSS(timeInSeconds) {
    let strMinutes = Math.floor(timeInSeconds / 60)
        .toString()
        .padStart(2, "0");
    let strSeconds = Math.floor(timeInSeconds % 60)
        .toString()
        .padStart(2, "0");

    return `${strMinutes}:${strSeconds}`;
}

function updateSongDurationLabel() {
    let totalSongTime = convertTimeFormatToMMSS(currentSong.duration);
    let elapsedTime = convertTimeFormatToMMSS(currentSong.currentTime);

    lblCurrentSongDuration.innerText = `${elapsedTime} / ${totalSongTime}`;
}

function updateSeekbarProgress() {
    let percentageSongProgress =
        (currentSong.currentTime / currentSong.duration) * 100;

    seekBarThumb.style.left = `${percentageSongProgress}%`;
}

function updateBtnPlayPauseSong() {
    if (currentSong.paused) {
        btnPlayPauseSong.firstElementChild.src = "assets/icons/play.svg";
    } else {
        btnPlayPauseSong.firstElementChild.src = "assets/icons/pause.svg";
    }
}

/* a function to mute or unmute the currentsong */
function muteUnmuteCurrentSong() {
    const imgBtnMuteUnmute = document.querySelector(".btn-volume img");

    if (currentSong.muted) {
        currentSong.muted = false;
        imgBtnMuteUnmute.src = "assets/icons/unmute-icon.svg";
    } else {
        currentSong.muted = true;
        imgBtnMuteUnmute.src = "assets/icons/muted-icon.svg";
    }
}

async function preparePlaylists() {
    await fetchPlaylistsPaths();

    await createArrPlaylistObjs();

    createPlaylistCards();
}

async function updateSongsFromPlaylist(playList) {
    await updateSongPathsFromPlaylist(playList);

    /* when the songs are ready, 
     setting the default index of currentSong to 0 i.e. first song */
    indexCurrentSong = 0;

    /* intializing the src attribute for the currentSong
     * at first it will be first song in the library */
    currentSong.src = arrSongPaths[indexCurrentSong];

    /* intiate the creation of song object arrays */
    createArrSongObjs(arrSongPaths);

    currentSongObj = arrSongObjs[indexCurrentSong];

    /* update the Songs Library in the sidebar */
    createSongsLibrary();
}


function assignEventListners() {
    /* handling the event of play-pause button clicked */
    btnPlayPauseSong.addEventListener("click", playPauseCurrentSong);

    /* play Next song */
    btnPlayNextSong.addEventListener("click", () => {
        updateCurrentSong(indexCurrentSong + 1);
    });

    /* play previous song */
    btnPlayPreviousSong.addEventListener("click", () => {
        updateCurrentSong(indexCurrentSong - 1);
    });

    /* after the current song finshes playing, we need to autoplay the next song */
    currentSong.addEventListener("ended", () => {
        updateCurrentSong(indexCurrentSong + 1);
    });

    /* event handler to update the play-pause button when the song is paused */
    currentSong.addEventListener("pause", updateBtnPlayPauseSong);

    /* event handler to update the play-pause button when the song is paused */
    currentSong.addEventListener("play", updateBtnPlayPauseSong);

    /* set a flag if the media is ready for playback
     * also update the label of the current song since it's triggered when song changes */
    currentSong.addEventListener("canplaythrough", () => {
        mediaReadyForPlayback = true;

        updateCurrentSongLabel();
        updateSongDurationLabel();
        updateSeekbarProgress();
        updateBtnPlayPauseSong();
    });

    /* as the song's time elapses, update the time label */
    currentSong.addEventListener("timeupdate", () => {
        if (mediaReadyForPlayback && !Number.isNaN(currentSong.duration)) {
            updateSongDurationLabel();
            updateSeekbarProgress();
        }
    });

    /* Seek song functionality */
    seekBar.addEventListener("click", (e) => {
        let seekBarProgress =
            (e.offsetX / e.currentTarget.getBoundingClientRect().width) * 100;
        seekBarThumb.style.left = `${seekBarProgress}%`;
        currentSong.currentTime =
            currentSong.duration * (seekBarProgress / 100);
    });

    /* an event listner to unhide the sidebar in mobile devices */
    document
        .querySelector("#btn-toggle-sidebar")
        .addEventListener("click", () => {
            document.querySelector(".sidebar").style.transform =
                "translateX(0%)";
        });

    /* a function to hide the sidebar when the close button in the sidebar is clicked */
    document
        .querySelector("#btn-close-sidebar")
        .addEventListener("click", () => {
            document.querySelector(".sidebar").style.transform =
                "translateX(-110%)";
        });

    /* an event listner function to change the media volume when the volume slider is changed */
    document
        .querySelector("#input-media-volume")
        .addEventListener("change", (e) => {
            currentSong.volume = e.target.value / 100;
        });

    /* a handler function to mute-unmute the current song */
    document
        .getElementById("btn-volume")
        .addEventListener("click", muteUnmuteCurrentSong);
}



document.addEventListener("DOMContentLoaded", async () => {
    await preparePlaylists();

    await updateSongsFromPlaylist(arrPlaylistObjs[0]);

    assignEventListners();

});
