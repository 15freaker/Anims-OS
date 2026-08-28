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