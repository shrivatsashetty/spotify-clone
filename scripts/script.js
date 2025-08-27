
/* global variables */
let isSongPlaying = false;

let arrSongPaths = [];

let currentSong = new Audio();

let currentSongIndex = 0

const btnPlayPauseSong = document.getElementById("btn-play-pause-song");

async function fetchSongPaths() {
    let arrSongPaths = [];

    let response = await fetch("http://127.0.0.1:3000/files/song-files/");  
    let strSongsDir = await response.text();

    /* parsing the html formatted string to an HTML document */ 
    const domParser = new DOMParser();
    const docSongsDir = domParser.parseFromString(strSongsDir, 'text/html');

    /* the songs will be stored in the td>a element of the doucument */
    let songs = docSongsDir.body.querySelector("tbody").getElementsByTagName("a");

    /* here we use a classical for loop 
     * in order to start the iteration from the element with index 1 */
    for (let i = 1; i < songs.length; i++) {
        const element = songs[i];
        arrSongPaths.push(element.href);
    }

    /* this function returns a promise
     * this promise resolves if the array of song paths is not null
     * otherwise the promise is rejected */
    return new Promise(
        (resolve, reject) => {
            if(arrSongPaths) {
                resolve(arrSongPaths);
            }
            else {
                reject("Error, No Songs Found!!");
            }
        }
    );

}

document.addEventListener(
    "DOMContentLoaded",
    async () => {
       arrSongPaths = await fetchSongPaths();
       currentSong.src = arrSongPaths[0];
    }
);

currentSong.addEventListener(
    "ended",
    () => {
        if(currentSongIndex == arrSongPaths.length - 1) {
            currentSongIndex = 0;
        }

        currentSongIndex = currentSongIndex += 1;
    }
);

btnPlayPauseSong.addEventListener(
        "click",
        async () => {
            if (currentSong.paused) {
                console.log();
                currentSong.play();
                btnPlayPauseSong.firstElementChild.src = "assets/icons/pause.svg"
            }
            else {
                currentSong.pause();
                btnPlayPauseSong.firstElementChild.src = "assets/icons/play.svg"
            }
        }
    );