
/* global variables */

let arrSongPaths = [];

let arrSongObjs = [];

let currentSong = new Audio();

let indexCurrentSong = 0;

/* the media control buttons i.e. Play, Pause, Next and Previous song buttons */
const btnPlayPauseSong = document.getElementById("btn-play-pause-song");
const btnPlayPreviousSong = document.getElementById("btn-play-previous-song");
const btnPlayNextSong = document.getElementById("btn-play-next-song");

const containerSongCards = document.querySelector(".container-song-cards");


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


/* a function to play or pause the current song */
function playPauseCurrentSong() {

    highlightCurrentSong();

    if (currentSong.paused) {
        currentSong.play();
        btnPlayPauseSong.firstElementChild.src = "assets/icons/pause.svg"
    }
    else {
        currentSong.pause();
        btnPlayPauseSong.firstElementChild.src = "assets/icons/play.svg"
    }
}

function highlightCurrentSong() {
    
    for (const card of containerSongCards.children) {
        let cardDesc = card.querySelector("p");

        if(cardDesc.classList.contains("highlighted-card")) {
            cardDesc.classList.remove("highlighted-card");
            break;
        }
    }

    containerSongCards.children[indexCurrentSong]
        .querySelector("p")
            .classList.add("highlighted-card");
}

/* a function to play any selected song from the array of songs
 * the same function can be reused for handling click of nextSong and previous song */
function playSelectedSong(songIndex) {
    if (songIndex > arrSongPaths.length -1) {
        indexCurrentSong = 0;
    }
    else if (songIndex < 0) {
        indexCurrentSong = arrSongPaths.length - 1;
    }
    else {
        indexCurrentSong = songIndex;
    }
    currentSong.src = arrSongPaths[indexCurrentSong];

    playPauseCurrentSong();
}


/* a function to create the songs library */
function createSongsLibrary() {
    
    for (const songObj of arrSongObjs) {
        let songCard = `
            <div class="card-song flexbox space-between rounded-corners pad-1 cursor-pointer"
                data-song-name="${songObj.songName}" data-song-path="${songObj.songPath}" data-song-index="${songObj.songIndex}"
                onclick="playSelectedSong(${songObj.songIndex})"
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
            </div>
            `

        /* updating the innerHTML of the card container by using the above crated element */
        containerSongCards.innerHTML = containerSongCards.innerHTML + songCard;
    }    
}



document.addEventListener(
    "DOMContentLoaded",
    async () => {
        /* setting the global variables */

        arrSongPaths = await fetchSongPaths();

        currentSong.src = arrSongPaths[0];

        /* intiate the creation of song object arrays */
        createSongObjs(arrSongPaths);

        /* after the current song finshes playing, we need to autoplay the next song */
        currentSong.addEventListener(
            "ended",
            () => {
                playSelectedSong(indexCurrentSong + 1);
            }
        );

        /* handling the event of play-pause button clicked */
        btnPlayPauseSong.addEventListener(
            "click",
            playPauseCurrentSong
        );

        btnPlayNextSong.addEventListener(
            "click",
            () => {
                playSelectedSong(indexCurrentSong + 1);
            }
        );

        btnPlayPreviousSong.addEventListener(
            "click",
            () => {
                playSelectedSong(indexCurrentSong -1);
            }
        );

        createSongsLibrary();

    }
);