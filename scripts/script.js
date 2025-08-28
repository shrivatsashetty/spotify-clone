
/* global variables */

let arrSongPaths = [];

let arrSongObjs = [];

let currentSong = new Audio();

let currentSongIndex = 0;

const btnPlayPauseSong = document.getElementById("btn-play-pause-song");

/* an asynchronous function that fetches the resources in the song file directory 
    and returns an array of song paths */
async function fetchSongPaths() {
    let arrSongPaths = [];

    let response = await fetch("http://127.0.0.1:3000/files/song-files/");  
    let strSongsDir = await response.text();

    /* parsing the html formatted string to an HTML document */ 
    const domParser = new DOMParser();
    const docSongsDir = domParser.parseFromString(strSongsDir, 'text/html');

    /* the songs will be stored in the td>a element of the doucument */
    let songPaths = docSongsDir.body.querySelector("tbody").getElementsByTagName("a");

    /* here we use a classical for loop 
     * in order to start the iteration from the element with index 1 */
    for (let i = 1; i < songPaths.length; i++) {
        const element = songPaths[i];
        arrSongPaths.push(element.href);
    }
    console.log(arrSongPaths);
    

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




/* a function to extract the name of the song given the path to the song file */
function getSongNameFromPath(songFilePath) {
    /* split the filepath based on the "/" as the delimiter  */
    let songName = songFilePath.split("/").at(-1);
    /* remove the extension ".mp3" */
    songName = songName.replace(".mp3", "");
    return songName;
}

/* a function to create song objects using the array of song paths */
function createSongObjs(arrSongPaths) {

    let songName;

    for (let i = 0; i < arrSongPaths.length; i++) {
        const songPath = arrSongPaths[i];
        
        songName = getSongNameFromPath(songPath);

        /* we push the individual song object into the songs object array */
        arrSongObjs.push(
            {
                songName: songName,
                songPath: songPath,
                songIndex: i,
            }
        );

    }
    console.log(arrSongObjs);
    
}


function playPauseCurrentSong() {
    if (currentSong.paused) {
        currentSong.play();
        btnPlayPauseSong.firstElementChild.src = "assets/icons/pause.svg"
    }
    else {
        currentSong.pause();
        btnPlayPauseSong.firstElementChild.src = "assets/icons/play.svg"
    }
}


function autoPlayNextSong() {

    /* first we need to update the index of the current song,
     * if we are in the last song of the queue then we need to come back to first song */
    if(currentSongIndex == arrSongPaths.length - 1) {
        currentSongIndex = 0;
    }

    currentSongIndex = currentSongIndex += 1;

    currentSong.src = arrSongPaths[currentSongIndex];
    playPauseCurrentSong();

}



document.addEventListener(
    "DOMContentLoaded",
    async () => {
        /* setting the global variables */

        arrSongPaths = await fetchSongPaths();

        currentSong.src = arrSongPaths[0];

        /* after the current song finshes playing, we need to autoplay the next song */
        currentSong.addEventListener(
            "ended",
            autoPlayNextSong
        );

        /* handling the event of play-pause button clicked */
        btnPlayPauseSong.addEventListener(
            "click",
            playPauseCurrentSong
        );

        /* intiate the creation of song object arrays */
        createSongObjs(arrSongPaths);
    }
);