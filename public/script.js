const current = new Audio(); // Initialize an audio element
let Nasheeds; // Array to store the list of nasheeds
let currFolder; // Variable to store the current folder

// Function to convert seconds to mm:ss format
function secToMinSec(sec) {
  if (isNaN(sec) || sec < 0) return "00:00";
  const min = Math.floor(sec / 60);
  const remSec = Math.floor(sec % 60);
  const updatedMin = String(min).padStart(2, "0");
  const updatedSec = String(remSec).padStart(2, "0");
  return `${updatedMin}:${updatedSec}`;
}

async function getNasheeds(folder) {
  currFolder = folder;
  console.log(`Fetching nasheeds for folder: ${folder}`); // Debugging statement
  try {
    const response = await fetch(`/getNasheeds/${folder}`);
    if (!response.ok) {
      throw new Error(`Error fetching nasheeds: ${response.statusText}`);
    }
    const data = await response.json();
    Nasheeds = data.nasheeds;
    console.log(`Fetched nasheeds: ${Nasheeds}`); // Debugging statement

    const songUl = document.querySelector(".songlist ul");
    songUl.innerHTML = "";
    Nasheeds.forEach(fileName => {
      songUl.innerHTML +=
        `<li>
          <img src="img/music-note-svgrepo-com.svg" class="invert" alt="">
          <div class="info flex ">
            <div>${fileName}</div>
          </div>
          <div class="playnow flex">
            <span>Play Now</span>
            <img src="img/play-svgrepo-com.svg" class="invert" alt="">
          </div>
        </li>`;
    });

    document.querySelectorAll(".songlist li").forEach((e, index) => {
      e.addEventListener("click", () => {
        playMusic(Nasheeds[index]);
      });
    });
    return Nasheeds;
  } catch (error) {
    console.error('Error fetching nasheeds:', error);
    return [];
  }
}
/*
async function displayAlbums() {
  try {
    const response = await fetch(`/getAlbums`);
    const data = await response.json();
    const cardContainer = document.querySelector('.cardContainer');
    cardContainer.innerHTML = "";
    data.albums.forEach(album => {
      cardContainer.innerHTML += `
        <div data-folder="${album.folder}" class="card rounded">
          <div class="play">
            <svg width="16px" height="16px" viewBox="-0.5 0 8 8" version="1.1" xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink">
              <title>play [#1001]</title>
              <desc>Created with Sketch.</desc>
              <defs></defs>
              <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="Dribbble-Light-Preview" transform="translate(-427.000000, -3765.000000)" fill="#000000">
                  <g id="icons" transform="translate(56.000000, 160.000000)">
                    <polygon id="play-[#1001]" points="371 3605 371 3613 378 3609"></polygon>
                  </g>
                </g>
              </g>
            </svg>
          </div>
          <img class="rounded" src="${album.cover}" alt="">
          <div class="text">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
          </div>
        </div>`;
    });
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', async () => {
        Nasheeds = await getNasheeds(card.dataset.folder);
        if (Nasheeds.length > 0) {
          playMusic(Nasheeds[0]);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
  }
}

// Function to play a nasheed
const playMusic = (track, pause = false) => {
  const audioSrc = `/img/Nasheeds/${currFolder}/${track}`;
  console.log(`Attempting to play track: ${audioSrc}`); // Debugging statement
  current.src = audioSrc; // Set the source of the audio element
  current.load(); // Load the audio element

  current.addEventListener('canplaythrough', () => {
    console.log(`Audio can play through: ${audioSrc}`); // Debugging statement
    if (!pause) {
      current.play().then(() => {
        console.log('Audio is playing'); // Debugging statement
        document.getElementById("play").src = "img/pause.svg"; // Change the play button icon to pause
      }).catch(error => {
        console.error('Error playing audio:', error); // Debugging statement
      });
    }
  });

  current.addEventListener('error', (e) => {
    console.error('Error loading audio:', e); // Debugging statement
  });

  const songInfoElement = document.querySelector(".songinfo");
  const songTimeElement = document.querySelector(".songtime");

  if (songInfoElement) {
    songInfoElement.innerHTML = decodeURI(track); // Display the currently playing nasheed
  } else {
    console.error('.songinfo element not found'); // Debugging statement
  }

  if (songTimeElement) {
    songTimeElement.innerHTML = "00:00/00:00"; // Reset the song time display
  } else {
    console.error('.songtime element not found'); // Debugging statement
  }
};
*/
// Main function to initialize the application
async function main() {
  Nasheeds = await getNasheeds("Aqib-Farid"); // Fetch nasheeds for the default folder
/*  if (Nasheeds.length > 0) { // Ensure there are nasheeds to play
    playMusic(Nasheeds[0], true); // Play the first nasheed
  }
  displayAlbums(); // Display albums

  // Event listeners for player controls
  document.getElementById("play").addEventListener("click", () => {
    if (current.paused) {
      current.play(); // Play if paused
      document.getElementById("play").src = "img/pause.svg"; // Change play button icon to pause
    } else {
      current.pause(); // Pause if playing
      document.getElementById("play").src = "img/play-svgrepo-com.svg"; // Change pause button icon to play
    }
  });

  // Update song time display while playing
  current.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secToMinSec(current.currentTime)} / ${secToMinSec(current.duration)}`;
    document.querySelector(".circle").style.left = (current.currentTime / current.duration) * 100 + "%";
  });

  // Seek to a position when seekbar is clicked
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    current.currentTime = (current.duration * percent) / 100;
  });

  // Show sidebar when hamburger icon is clicked
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Close sidebar when close icon is clicked
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Play previous nasheed when previous button is clicked
  document.getElementById("prev").addEventListener("click", () => {
    let index = Nasheeds.indexOf(decodeURIComponent(current.src.split("/").slice(-1)[0]));
    if (index - 1 >= 0) playMusic(Nasheeds[index - 1]);
  });

  // Play next nasheed when next button is clicked
  document.getElementById("next").addEventListener("click", () => {
    let index = Nasheeds.indexOf(decodeURIComponent(current.src.split("/").slice(-1)[0]));
    if (index + 1 < Nasheeds.length) playMusic(Nasheeds[index + 1]);
  });

  // Change volume when volume range input is changed
  document.querySelector(".range input").addEventListener("change", (e) => {
    current.volume = e.target.value / 100;
    if (current.volume > 0) {
      document.querySelector('.volume>img').src = "img/volume.svg";
    }
    if (current.volume == 0) {
      document.querySelector('.volume>img').src = "img/mute.svg";
    }
  });

  // Mute/unmute volume when volume icon is clicked
  document.querySelector('.volume>img').addEventListener('click', e => {
    if (e.target.src.includes('volume.svg')) {
      e.target.src = "img/mute.svg";
      current.volume = 0;
      document.querySelector(".range input").value = 0;
    }
    else {
      e.target.src = "img/volume.svg";
      current.volume = 0.10;
      document.querySelector(".range input").value = 10;
    }
  });*/
}

// Call the main function to initialize the application
main();
