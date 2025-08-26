
async function fetchSongs() {
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

    console.log(arrSongPaths);
    
}

fetchSongs();