const STORAGE = {
  favourites: "roavena-favourites",
  trips: "roavena-trips"
};

const places = {
  amalfi: { name: "Amalfi Coast", country: "Italy" },
  banff: { name: "Banff", country: "Canada" },
  kyoto: { name: "Kyoto", country: "Japan" },
  ladakh: { name: "Ladakh", country: "India" }
};

const searchInput = document.querySelector("#searchInput");
const cards = document.querySelectorAll(".destination-card");
const filterButtons = document.querySelectorAll(".filter");
const emptyMessage = document.querySelector("#emptyMessage");

const favouritesList = document.querySelector("#favouritesList");
const tripsList = document.querySelector("#tripsList");
const favCount = document.querySelector("#favCount");

const tripForm = document.querySelector("#tripForm");
const formMessage = document.querySelector("#formMessage");

const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");

let activeCategory = "all";

// Read saved data from localStorage.
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

// Save data in the browser.
function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    alert("Could not save data in this browser.");
    return false;
  }
}

// Safely display user-entered text in HTML.
function safeText(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

// Search destinations and apply category filters.
function filterDestinations() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCards = 0;

  cards.forEach(card => {
    const categories = card.dataset.category.split(" ");
    const searchableText =
      card.dataset.name + " " +
      card.querySelector("h3").textContent;

    const matchesSearch = searchableText
      .toLowerCase()
      .includes(query);

    const matchesCategory =
      activeCategory === "all" ||
      categories.includes(activeCategory);

    const visible = matchesSearch && matchesCategory;

    card.hidden = !visible;

    if (visible) {
      visibleCards++;
    }
  });

  emptyMessage.hidden = visibleCards !== 0;
}

searchInput.addEventListener("input", filterDestinations);

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;

    filterButtons.forEach(item => {
      item.classList.toggle("active", item === button);
    });

    filterDestinations();
  });
});

// Save or remove a favourite destination.
if (saveData(STORAGE.favourites, updated)) {
  renderFavourites();
}

  favCount.textContent = favourites.length;

  document.querySelectorAll(".heart").forEach(button => {
    const saved = favourites.includes(button.dataset.id);

    button.textContent = saved ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(saved));
  });

  if (favourites.length === 0) {
    favouritesList.innerHTML =
      '<p class="muted saved-empty">Your favourite destinations will appear here.</p>';
    return;
  }

  favouritesList.innerHTML = favourites
    .filter(id => places[id])
    .map(id => `
      <article class="saved-item">
        <div>
          <strong>${safeText(places[id].name)}</strong>
          <small>${safeText(places[id].country)}</small>
        </div>
        <button class="remove-button"
          data-remove-favourite="${id}">Remove</button>
      </article>
    `).join("");
}

document.querySelectorAll(".heart").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    const favourites = getData(STORAGE.favourites);

    const updated = favourites.includes(id)
      ? favourites.filter(item => item !== id)
      : [...favourites, id];

    if (saveData(STORAGE.fAVOURITES || STORAGE.favourites, updated)) {
      renderFavourites();
    }
  });
});

// Remove a favourite from the saved list.
favouritesList.addEventListener("click", event => {
  const button = event.target.closest("[data-remove-favourite]");

  if (!button) return;

  const updated = getData(STORAGE.favourites)
    .filter(id => id !== button.dataset.removeFavourite);

  if (saveData(STORAGE.favourites, updated)) {
    renderFavourites();
  }
});

// Create a new trip draft.
tripForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.querySelector("#tripName").value.trim();
  const destination =
    document.querySelector("#tripDestination").value;

  if (!name || !destination) {
    formMessage.textContent = "Please complete both fields.";
    return;
  }

  const trips = getData(STORAGE.trips);

  trips.unshift({
    id: Date.now().toString(),
    name,
    destination
  });

  if (!saveData(STORAGE.trips, trips)) return;

  renderTrips();
  tripForm.reset();

  formMessage.textContent = "Your trip draft has been saved.";
});

// Display saved trip drafts.
function renderTrips() {
  const trips = getData(STORAGE.trips);

  if (trips.length === 0) {
    tripsList.innerHTML =
      '<p class="muted saved-empty">Your trip drafts will appear here.</p>';
    return;
  }

  tripsList.innerHTML = trips.map(trip => `
    <article class="saved-item">
      <div>
        <strong>${safeText(trip.name)}</strong>
        <small>${safeText(trip.destination)} · Draft</small>
      </div>
      <button class="remove-button"
        data-remove-trip="${trip.id}">Delete</button>
    </article>
  `).join("");
}

// Delete a trip draft.
tripsList.addEventListener("click", event => {
  const button = event.target.closest("[data-remove-trip]");

  if (!button) return;

  const updated = getData(STORAGE.trips)
    .filter(trip => trip.id !== button.dataset.removeTrip);

  if (saveData(STORAGE.trips, updated)) {
    renderTrips();
  }
});

// Mobile navigation.
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Restore saved information when the page loads.
renderFavourites();
renderTrips();
filterDestinations();