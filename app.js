const apikey = "82cd210a";
 const watchlistGrid = document.getElementById("watchlist-grid");
    const watchlistCountTitle = document.getElementById("watchlist-count-title");
const  searchForm = document.getElementById("searchForm");
const  searchInput = document.getElementById("searchInput");
const  searchResultsSection = document.getElementById("search-results-section");
const searchDisplay = document.getElementById("search-display");
const  closeSearchBtn = document.getElementById("closeBtn");
const randomMovieBtn = document.getElementById("randomBtn");
const heroCard = document.getElementById("hero-card");

const  mobileSearchTrigger = document.getElementById("mobile-search-trigger");
const mobileSearchOverlay = document.getElementById("mobile-search-overlay");
const mobileSearchForm = document.getElementById("mobile-search-form");
const  mobileSearchInput = document.getElementById("mobileSearchInput");
const closeMobileSearch = document.getElementById("close-mobile-search");

const detailsSection = document.getElementById("details-section");
const   mainContent = document.getElementById("main-content");
const  movieDetailsContent = document.getElementById("movie-details-content");
const backToMainBtn = document.getElementById("back-to-main-btn");

const   defaultMovies = [];

function getWatchlist() {
    return JSON.parse(localStorage.getItem("watchlist")) || [];
}

function saveWatchlist(list) {
localStorage.setItem("watchlist", JSON.stringify(list));
    renderWatchlist();
}

async function initWatchlist() {
    let list = getWatchlist();
    if (list.length === 0) {
        for (const id of defaultMovies) {
            try {
                const res = await fetch(`https://www.omdbapi.com/?apikey=${apikey}&i=${id}&plot=short`);
                const data = await res.json();
                if (data.Response === "True") {
                    list.push(data);
                }
            } catch (err) {}
        }
        saveWatchlist(list);
    } else {
        renderWatchlist();
    }
}

function renderWatchlist() {
    const list = getWatchlist();
    if (!watchlistCountTitle) return;
    
    watchlistCountTitle.textContent = `Your Saved Titles (${list.length})`;
    watchlistGrid.innerHTML = "";

    if (list.length === 0) {
        watchlistGrid.innerHTML = `<div class="empty-state">No saved titles yet. Search and add some!</div>`;
        return;
    }

    list.forEach(movie => {
        const card = createMovieCard(movie, true);
        watchlistGrid.appendChild(card);
    });

    if (heroCard && heroCard.innerHTML.trim() === "") {
        displayRandomMovie();
    }
}

function createMovieCard(movie, isWatchlist) {
    const div = document.createElement('div');
    div.className = 'movie-card';
    
    const posterSrc = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Poster";
    const actionBtnHTML = isWatchlist 
        ? `<button class="remove-btn" onclick="event.stopPropagation(); removeFromWatchlist('${movie.imdbID}')"><span class="material-symbols-outlined">close</span></button>`
        : `<button class="add-btn" onclick="event.stopPropagation(); addToWatchlist('${movie.imdbID}')"><span class="material-symbols-outlined">add</span></button>`;

    const typeLabel = movie.Type ? movie.Type : (movie.Genre ? movie.Genre.split(',')[0] : 'Movie');
    const yearLabel = movie.Year;

    div.innerHTML = `
        <div class="card-image-wrap" onclick="showMovieDetails('${movie.imdbID}')">
            <img src="${posterSrc}" alt="${movie.Title.replace(/"/g, '&quot;')}">
            <div class="card-overlay"></div>
            ${actionBtnHTML}
        </div>
        <div class="card-title" onclick="showMovieDetails('${movie.imdbID}')">${movie.Title}</div>
        <div class="card-meta">
            <span>${typeLabel}</span>
            <span>•</span>
            <span>${yearLabel}</span>
        </div>
    `;
    return div;
}

window.addToWatchlist = async function(id) {
    let list = getWatchlist();
    if (list.find(m => m.imdbID === id)) return;

    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${apikey}&i=${id}&plot=short`);
        const data = await res.json();
        if (data.Response === "True") {
            list.push(data);
            saveWatchlist(list);
        }
    } catch (err) {}
};

window.removeFromWatchlist = function(id) {
     let list = getWatchlist();
    list = list.filter(m => m.imdbID !== id);
    saveWatchlist(list);
};

if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        performSearch(searchInput.value);
    });
}

if (mobileSearchForm) {
    mobileSearchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        performSearch(mobileSearchInput.value);
        hideMobileSearch();
    });
}

async function performSearch(query) {
    if (!query.trim()) return;
    
    searchResultsSection.style.display = "block";
    searchDisplay.innerHTML = "Searching...";

    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${apikey}&s=${query}`);
        const data = await res.json();
        
        searchDisplay.innerHTML = "";
        
        if (data.Response === "True") {
            const list = getWatchlist();
            data.Search.forEach(movie => {
                const isWatchlist = list.find(m => m.imdbID === movie.imdbID);
                const card = createMovieCard(movie, isWatchlist);
                searchDisplay.appendChild(card);
            });
        } else {
            searchDisplay.innerHTML = `<div class="empty-state">No results found for "${query}"</div>`;
        }
    } catch (err) {
        searchDisplay.innerHTML = `<div class="empty-state">Error fetching data</div>`;
    }
}

if (closeSearchBtn) {
    closeSearchBtn.addEventListener("click", () => {
        searchResultsSection.style.display = "none";
        searchInput.value = "";
    });
}

if (randomMovieBtn) {
    randomMovieBtn.addEventListener("click", displayRandomMovie);
}

function displayRandomMovie() {
    const list = getWatchlist();
    if (list.length === 0) {
        heroCard.innerHTML = `<div style="padding: 2rem; color: #a3a3a3; font-style: italic;">Add movies to your watchlist to enable Random Movie Night.</div>`;
        return;
    }
    
    const randomIdx = Math.floor(Math.random() * list.length);
    const movie = list[randomIdx];
    
    const   posterSrc = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/1200x600?text=No+Poster";
    const  plot = movie.Plot && movie.Plot !== "N/A" ? movie.Plot : "No plot available.";
    const rating = movie.imdbRating && movie.imdbRating !== "N/A" ? movie.imdbRating : "--";
    
    let genreBadge = "Movie";
    if (movie.Genre && movie.Genre !== "N/A") {
        genreBadge = movie.Genre.split(",")[0].trim();
    }
    
    heroCard.innerHTML = `
        <img src="${posterSrc}" alt="${movie.Title.replace(/"/g, '&quot;')}" class="hero-poster" onclick="showMovieDetails('${movie.imdbID}')" style="cursor:pointer;">
        <div class="hero-gradient"></div>
        <div class="hero-content">
            <div>
            <div class="hero-badge-row" style="margin-bottom: 1rem;">
                <span class="badge">${genreBadge}</span>
                <span class="rating">
                    <span class="material-symbols-outlined">star</span>
                    ${rating}
                </span>
            </div>
            <h3 class="hero-title" style="margin-bottom: 1rem; cursor:pointer;" onclick="showMovieDetails('${movie.imdbID}')">${movie.Title}</h3>
            <p class="hero-desc" style="margin-bottom: 1.5rem;">${plot}</p>
            <div class="hero-actions">
                <button class="play-btn">
                    <span class="material-symbols-outlined">play_arrow</span>
                    Watch Now
                </button>
                <button class="details-btn" onclick="showMovieDetails('${movie.imdbID}')">
                    Details
                </button>
                </div>
            </div>
        </div>
    `;
}

if (mobileSearchTrigger) {
    mobileSearchTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        mobileSearchOverlay.classList.add("active");
        mobileSearchInput.focus();
    });
}

if (closeMobileSearch) {
    closeMobileSearch.addEventListener("click", () => {
        hideMobileSearch();
    });
}

function hideMobileSearch() {
    mobileSearchOverlay.classList.remove("active");
    mobileSearchInput.value = "";
}

window.showMovieDetails = async function(id) {
    mainContent.style.display = "none";
    detailsSection.style.display = "block";
    movieDetailsContent.innerHTML = "<p>Loading details...</p>";
    window.scrollTo(0, 0);

    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${apikey}&i=${id}&plot=full`);
        const movie = await res.json();
        
        if (movie.Response === "True") {
            const posterSrc = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/400x600?text=No+Poster";
            
            let actorsList = "";
            if (movie.Actors && movie.Actors !== "N/A") {
                const actors = movie.Actors.split(", ");
                actorsList = `<ul class="actors-list">${actors.map(a => `<li>${a}</li>`).join('')}</ul>`;
            } else {
                actorsList = `<p>No actors listed.</p>`;
            }

            movieDetailsContent.innerHTML = `
                <div class="details-layout">
                    <div class="details-poster">
                        <img src="${posterSrc}" alt="${movie.Title.replace(/"/g, '&quot;')}">
                    </div>
                    <div class="details-info">
                        <h1 class="details-title">${movie.Title} <span class="details-year">(${movie.Year})</span></h1>
                        <div class="details-meta">
                            <span class="badge">${movie.Rated}</span>
                            <span>${movie.Runtime}</span>
                            <span>${movie.Genre}</span>
                        </div>
                        
                        <div class="details-block">
                            <h3>Plot summary</h3>
                            <p>${movie.Plot}</p>
                        </div>
                        
                        <div class="details-grid">
                            <div class="details-block">
                                <h3>Cast</h3>
                                ${actorsList}
                            </div>
                            <div class="details-block">
                                <h3>Information</h3>
                                <p><strong>Language:</strong> ${movie.Language}</p>
                                <p><strong>Director:</strong> ${movie.Director}</p>
                                <p><strong>Box Office:</strong> ${movie.BoxOffice || 'N/A'}</p>
                                <p><strong>Awards:</strong> ${movie.Awards}</p>
                                <p><strong>IMDb Rating:</strong> <span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;color:#e9c176;">star</span> ${movie.imdbRating}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (err) {
        movieDetailsContent.innerHTML = "<p>Error loading movie details.</p>";
    }
};

if (backToMainBtn) {
    backToMainBtn.addEventListener("click", () => {
        detailsSection.style.display = "none";
        mainContent.style.display = "block";
        window.scrollTo(0, 0);
    });
}

initWatchlist();