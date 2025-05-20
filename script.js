console.log("Lets write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}`);
  let response = await a.text();
  let element = document.createElement("div");
  element.innerHTML = response;
  let as = element.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Display the songs in the list
  let songList = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songList.innerHTML = "";
  for (const song of songs) {
    songList.innerHTML += `<li>
                <img class="invert" src="music.svg" alt="" />
                <div class="Info">
                  <div>${song.replaceAll(
                    "%20",
                    " "
                  )}</div> <!-- Fixed: Apply replaceAll to individual song -->
                  <div>Ishan</div>
                </div>
                <div class="playNow">
                  <span>Play Now</span>
                  <img class="invert" src="play.svg" alt="">
                </div></li>`;
  }
  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".Info").children[0].innerHTML);
      console.log(e.querySelector(".Info").children[0].innerHTML);
    });
  });

  return songs; // Add this return statement
}

const playMusic = (track, pause = false) => {
  currentSong.src = `${location.origin}/${currFolder}/` + track; // Ensure full path matches
  if (!pause) {
    currentSong
      .play()
      .catch((error) => console.error("Playback error:", error)); // Catch playback errors
    play.src = "pause.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
  let cardContainer = document.querySelector(".card-container");
  cardContainer.innerHTML = ""; // Clear existing content
  let a = await fetch(`http://127.0.0.1:3000/songs`);
  let response = await a.text();
  let element = document.createElement("div");
  element.innerHTML = response;
  let as = element.getElementsByTagName("a");
  let array = Array.from(as);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/")) {
      let folder = e.href.split("/").slice(-2)[0]; // Added 'let' here
      try {
        let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
        let response = await a.json();
        console.log(response);
        cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="100"
                    height="100"
                  >
                    <circle cx="12" cy="12" r="12" fill="#1ed760"/>
                    <polygon points="10,8 16,12 10,16" fill="#000"/>
                  </svg>
                </div>
              <img
                src="/songs/${folder}/cover.jpg"
                alt="${response.title}"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
      } catch (error) {
        console.error(`Error loading info for folder ${folder}:`, error);
      }
    }
  }
}

async function main() {
  // Get the list of all songs
  await getSongs("songs/cs");
  playMusic(songs[0], true);
  // Display all the albums on the page
  await displayAlbums();

  // Move the card click listeners here, after cards are created
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      const folder = item.currentTarget.dataset.folder;
      songs = await getSongs(`songs/${folder}`);
      // Play the first song of the new playlist
      playMusic(songs[0]);
    });
  });

  // Attach an event listener to the play, next and previous buttons
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });
  // Set the time of the song
  currentSong.addEventListener("timeupdate", () => {
    if (!isNaN(currentSong.duration)) {
      // Ensure duration is valid
      const format = (time) =>
        `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(
          Math.floor(time % 60)
        ).padStart(2, "0")}`;

      document.querySelector(".songtime").innerHTML = `${format(
        currentSong.currentTime
      )}/${format(currentSong.duration)}`;

      document.querySelector(".circle").style.left = `${
        (currentSong.currentTime / currentSong.duration) * 100
      }%`;
    }
  });
  // Add an event listener to seekbar
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    if (!isNaN(currentSong.duration)) {
      // Ensure duration is valid
      let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      document.querySelector(".circle").style.left = `${percent}%`;
      currentSong.currentTime = (currentSong.duration * percent) / 100;
    }
  });
  // Add an event listener for Hamburger icon
  document.querySelector("#Hamburgur").addEventListener("click", () => {
    document.querySelector(".sidebar").style.left = "0";
  });
  // Add an event listener for close icon
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".sidebar").style.left = "-200%";
  });
  // Add am event listener to previous and next buttons
  document.querySelector("#next").addEventListener("click", () => {
    // Get the current song name directly from the displayed song info
    let currentSongName = document.querySelector(".songInfo").innerHTML;
    let currentIndex = songs.indexOf(currentSongName);

    if (currentIndex < songs.length - 1) {
      playMusic(songs[currentIndex + 1]);
    } else {
      playMusic(songs[0]); // Loop back to the first song
    }
  });

  document.querySelector("#previous").addEventListener("click", () => {
    // Get the current song name directly from the displayed song info
    let currentSongName = document.querySelector(".songInfo").innerHTML;
    let currentIndex = songs.indexOf(currentSongName);

    if (currentIndex > 0) {
      playMusic(songs[currentIndex - 1]);
    } else {
      playMusic(songs[songs.length - 1]); // Loop back to the last song
    }
  });
  // Add an event listener to volume slider
  document.querySelector(".volume").addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
  });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    const volumeSlider = document.querySelector(".volume input");

    if (e.target.src.includes("volume.svg")) {
      // Store the current volume before muting
      e.target.dataset.previousVolume = volumeSlider.value;

      // Update icon and mute the audio
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;

      // Update slider to show 0
      volumeSlider.value = 0;
    } else {
      // Restore previous volume or default to 50
      const previousVolume = e.target.dataset.previousVolume || 50;

      // Update icon and restore volume
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = previousVolume / 100;

      // Update slider to show previous value
      volumeSlider.value = previousVolume;
    }
  });
}
main();
