let zIndex = 100;
let dragging = null;

function updateClock() {
  let d = new Date();
  let time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let date = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  document.getElementById('time').innerText = time;
  document.getElementById('date').innerText = date;
}
updateClock();
setInterval(updateClock, 1000);

function openWindow(id) {
  let win = document.getElementById(id);
  win.style.display = 'flex';
  win.style.zIndex = ++zIndex;
}

function closeWindow(id) {
  document.getElementById(id).style.display = 'none';
}
const audio = document.getElementById("audio-track");
  const playBtn = document.getElementById("play-btn");
  const playIcon = document.getElementById("play-icon");

  const playSvg = '<path d="M8 5v14l11-7z"/>';
  const pauseSvg = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playIcon.innerHTML = pauseSvg;
    } else {
      audio.pause();
      playIcon.innerHTML = playSvg;
    }
  });

  audio.addEventListener("ended", () => {
    playIcon.innerHTML = playSvg;
  });
function getWeather(lat, lon, label) {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("temp").innerText = Math.round(data.current_weather.temperature) + "°C";
        document.getElementById("status").innerText = label;
      })
      .catch(() => {
        document.getElementById("status").innerText = "Error";
      });
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => getWeather(pos.coords.latitude, pos.coords.longitude, "My Location"),
      () => getWeather(51.5074, -0.1278, "London (Default)")
    );
  } else {
    getWeather(51.5074, -0.1278, "London (Default)");
  }
document.querySelectorAll('.window').forEach(win => {
  let header = win.querySelector('.winheader');
  
  header.onmousedown = (e) => {
    dragging = { win, x: e.clientX - win.offsetLeft, y: e.clientY - win.offsetTop };
    win.style.zIndex = ++zIndex;
  };
});

document.onmousemove = (e) => {
  if (dragging) {
    dragging.win.style.left = (e.clientX - dragging.x) + 'px';
    dragging.win.style.top = (e.clientY - dragging.y) + 'px';
  }
};

document.onmouseup = () => dragging = null;

function addNote(e) {
  if (e.key === 'Enter' && e.target.value.trim()) {
    let item = document.createElement('div');
    item.className = 'noteitem';
    item.innerText = e.target.value;
    document.getElementById('noteslist').appendChild(item);
    e.target.value = '';
  }
}

let calcDisplay = document.getElementById('calcdisplay');
let current = '';

function calcInput(val) {
  if (calcDisplay.value === '0' || calcDisplay.value === 'Error') {
    current = '';
  }
  current += val;
  calcDisplay.value = current;
}

function calcClear() {
  current = '';
  calcDisplay.value = '0';
}

function calcEquals() {
  try {
    current = eval(current).toString();
    calcDisplay.value = current;
  } catch {
    calcDisplay.value = 'Error';
    current = '';
  }
}
let currentDate = new Date();

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const monthNames = ["January", "February", "March", "April", "May", "June",  "July", "August", "September", "October", "November", "December"];

    document.getElementById("month-year-display").innerText = `${monthNames[month]} ${year}`;

    const daysContainer = document.getElementById("days-container");
    daysContainer.innerHTML = "";
    for (let i = 0; i < firstDay; i++) {
      const emptyDiv = document.createElement("div");
      emptyDiv.classList.add("empty");
      daysContainer.appendChild(emptyDiv);
    }
    const today = new Date();
    for (let day = 1; day <= lastDate; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.innerText = day;
      if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayDiv.classList.add("today");
      }
      daysContainer.appendChild(dayDiv);
    }
  }
  document.getElementById("prev-btn").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("next-btn").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });
  renderCalendar();
async function searchWiki() {
  let query = document.getElementById('wikiinput').value.trim();
  let resultsContainer = document.getElementById('wikiresults');
  if (!query) return;

  resultsContainer.innerHTML = 'Searching...';

  try {
    let res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=5&srsearch=${encodeURIComponent(query)}`);
    let data = await res.json();
    resultsContainer.innerHTML = '';

    data.query.search.forEach(item => {
      let div = document.createElement('div');
      div.className = 'wikiitem';
      div.innerHTML = `
        <a href="https://en.wikipedia.org/?curid=${item.pageid}" target="_blank">${item.title}</a>
        <p>${item.snippet}...</p>
      `;
      resultsContainer.appendChild(div);
    });
  } catch {
    resultsContainer.innerHTML = 'Failed to load results.';
  }
}