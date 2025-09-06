/* global variables */
const domParser = new DOMParser();

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
const lblCurrentSongDuration = document.querySelector(".media-state p.lbl-song-duration");

const seekBar = document.querySelector(".seekbar");
const seekBarThumb = document.querySelector(".seekbar .seekbar-thumb");

/* an asynchronous function that fetches the resources in the song file directory 
    and returns an array of song paths */
async function fetchSongPaths() {
    let arrSongPaths = [];

    let response = await fetch("http://127.0.0.1:3000/files/song-files/");
    let strSongsDir = await response.text();

    /* parsing the html formatted string to an HTML document */
    const docSongsDir = domParser.parseFromString(strSongsDir, "text/html");

    /* the songs will be stored in the td>a element of the doucument */
    let songPaths = docSongsDir.body
        .querySelector("tbody")
        .getElementsByTagName("a");

    /* here we use a classical for loop
     * in order to start the iteration from the element with index 1 */
    for (let i = 1; i < songPaths.length; i++) {
        const element = songPaths[i];
        arrSongPaths.push(element.href);
    }

    /* this function returns a promise
     * this promise resolves if the array of song paths is not null
     * otherwise the promise is rejected */
    return new Promise((resolve, reject) => {
        if (arrSongPaths) {
            resolve(arrSongPaths);
        } 
        else {
            reject("Error, No Songs Found!!");
        }
    });
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
function createSongObjs(arrSongPaths) {
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
        btnPlayPauseSong.firstElementChild.src = "assets/icons/pause.svg";
    } 
    else {
        currentSong.pause();
        btnPlayPauseSong.firstElementChild.src = "assets/icons/play.svg";
    }
}

/* a function to play any selected song from the array of songs
 * the same function can be reused for handling click of nextSong and previous song */
function updateCurrentSong(songIndex) {
    if (songIndex > arrSongPaths.length - 1) {
        indexCurrentSong = 0;
    } 
    else if (songIndex < 0) {
        indexCurrentSong = arrSongPaths.length - 1;
    } 
    else {
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

    lblCurrentSongDuration.innerText = `${totalSongTime} / ${elapsedTime}`;
}

function updateSeekbarProgress() {
    let percentageSongProgress =
        (currentSong.currentTime / currentSong.duration) * 100;

    seekBarThumb.style.left = `${percentageSongProgress}%`;
}

/* a function to mute or unmute the currentsong */
function muteUnmuteCurrentSong() {
    const imgBtnMuteUnmute = document.querySelector(".btn-volume img");

    if (currentSong.muted) {
        currentSong.muted = false;
        imgBtnMuteUnmute.src = "assets/icons/unmute-icon.svg";
    } 
    else {
        currentSong.muted = true;
        imgBtnMuteUnmute.src = "assets/icons/muted-icon.svg";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    /* setting the global variables */

    arrSongPaths = await fetchSongPaths();

    /* intializing the src attribute for the currentSong
     * at first it will be first song in the library */
    currentSong.src = arrSongPaths[indexCurrentSong];

    /* intiate the creation of song object arrays */
    createSongObjs(arrSongPaths);

    currentSongObj = arrSongObjs[indexCurrentSong];

    /* after the current song finshes playing, we need to autoplay the next song */
    currentSong.addEventListener("ended", () => {
        updateCurrentSong(indexCurrentSong + 1);
    });

    /* handling the event of play-pause button clicked */
    btnPlayPauseSong.addEventListener("click", playPauseCurrentSong);

    btnPlayNextSong.addEventListener("click", () => {
        updateCurrentSong(indexCurrentSong + 1);
    });

    btnPlayPreviousSong.addEventListener("click", () => {
        updateCurrentSong(indexCurrentSong - 1);
    });

    createSongsLibrary();

    /* set a flag if the media is ready for playback */
    currentSong.addEventListener("canplaythrough", () => {
        mediaReadyForPlayback = true;
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

    document
        .querySelector("#btn-toggle-sidebar")
        .addEventListener("click", () => {
            document.querySelector(".sidebar").style.transform =
                "translateX(0%)";
        });

    document
        .querySelector("#btn-close-sidebar")
        .addEventListener("click", () => {
            document.querySelector(".sidebar").style.transform =
                "translateX(-110%)";
        });

    document
        .querySelector("#input-media-volume")
        .addEventListener("change", (e) => {
            currentSong.volume = e.target.value / 100;
        });

    document
        .getElementById("btn-volume")
        .addEventListener("click", muteUnmuteCurrentSong);
});
