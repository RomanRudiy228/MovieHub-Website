import { router } from './routes/router.js';

document.addEventListener('DOMContentLoaded', () => {
    router.route();
}); 

class Api {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.themoviedb.org/3';
    }

    async fetchMoviesBySearchText(searchText, page = 1) {
        const response = await fetch(`${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(searchText)}&page=${page}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }

    async fetchPopularMovies(page = 1) {
        const response = await fetch(`${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=en-US&page=${page}`);
        const data = await response.json();
        return data.results;
    }

    async fetchMovieDetails(movieId) {
        const response = await fetch(`${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }
}

const apiKey = '3a1edb0bd06587b687a5198102ba0214';
const api = new Api(apiKey);
const searchInput = document.getElementById('search-input');
const searchIcon = document.getElementById('search-boxicon');
const movieList = document.getElementById('movie-list');
const resultsHeader = document.getElementById('results-header');
const loadMoreButton = document.getElementById('load-more-button');
const popularMoviesButton = document.getElementById('popular-movies-btn');
const bookmarksButton = document.getElementById('bookmarks-btn');
const backButton = document.getElementById('back-btn');
const searchBoxicon = document.getElementById('search-boxicon');

let currentPage = 1;
let currentQuery = '';
let totalResults = 0;

function hideSearchBoxicon() {
    if (searchBoxicon) {
        searchBoxicon.style.display = 'none'; 
    }
}

searchInput.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        currentQuery = searchInput.value;
        currentPage = 1;
        resultsHeader.textContent = '';
        movieList.innerHTML = '';
        try {
            const data = await api.fetchMoviesBySearchText(currentQuery, currentPage);
            totalResults = data.total_results;
            resultsHeader.textContent = `Results (${totalResults})`;
            renderMovies(data.results);
            toggleLoadMoreButton(data.total_pages);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
        searchInput.value = '';
    }
});

searchIcon.addEventListener('click', async (event) => {
    currentQuery = searchInput.value;
    currentPage = 1;
    resultsHeader.textContent = '';
    movieList.innerHTML = '';
    try {
        const data = await api.fetchMoviesBySearchText(currentQuery, currentPage);
        totalResults = data.total_results;
        resultsHeader.textContent = `Results (${totalResults})`;
        renderMovies(data.results);
        toggleLoadMoreButton(data.total_pages);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
    searchInput.value = '';
});

popularMoviesButton.addEventListener('click', async () => {
    currentPage = 1;
    resultsHeader.textContent = '🔥HOTEST MOVIES🔥';
    movieList.innerHTML = '';
    try {
        const movies = await api.fetchPopularMovies(currentPage);
        renderMovies(movies);
        toggleLoadMoreButton(1); 
    } catch (error) {
        console.error('Error fetching popular movies:', error);
    }
});

function hideLoadMoreButton() {
    loadMoreButton.style.display = 'none';
}

function hideButtonsInMoviesDet() {
    bookmarksButton.style.display = 'none';
    popularMoviesButton.style.display = 'none';
}

function toggleBackButton() {
    if (window.location.pathname.includes('/movies/')) { 
        backButton.style.display = 'block'; 
    } else {
        backButton.style.display = 'none';  
    }
}

toggleBackButton();

backButton.addEventListener('click', () => {
    window.history.pushState(null, '', '/'); 
    location.reload();
    router.route();  
});

function renderMovies(movies) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || {};
    
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-item');

        const moviePoster = document.createElement('img');
        moviePoster.src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'placeholder.jpg';
        moviePoster.alt = movie.original_title;

        const movieTitle = document.createElement('div');
        movieTitle.classList.add('movie-title');
        movieTitle.textContent = movie.title;

        const favoriteIcon = document.createElement('i');
        favoriteIcon.classList.add('fas', 'fa-heart', 'favorite-icon');

        if (favorites[movie.id]) {
            favoriteIcon.classList.add('active');
        }

        favoriteIcon.addEventListener('click', (event) => {
            event.stopPropagation();  
            toggleSaveMovie(movie, favoriteIcon);
        });

        movieElement.appendChild(moviePoster);
        movieElement.appendChild(movieTitle);
        movieElement.appendChild(favoriteIcon);

        movieElement.addEventListener('click', () => {
            window.history.pushState(null, '', `/movies/${movie.id}`);
            hideLoadMoreButton(); 
            hideButtonsInMoviesDet(); 
            toggleBackButton();
            hideSearchBoxicon();
            router.route();  
        });

        movieList.appendChild(movieElement);
    });
}

loadMoreButton.addEventListener('click', async () => {
    try {
        currentPage++;
        const data = await api.fetchMoviesBySearchText(currentQuery, currentPage);
        renderMovies(data.results);
        toggleLoadMoreButton(data.total_pages);
    } catch (error) {
        console.error('Error fetching more movies:', error);
    }
});

function toggleLoadMoreButton(totalPages) {
    loadMoreButton.style.display = totalPages > currentPage ? 'block' : 'none';
}

async function showPopularMovies() {
    const movies = await api.fetchPopularMovies(currentPage);
    renderMovies(movies);
}

showPopularMovies();

bookmarksButton.addEventListener('click', () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
    movieList.innerHTML = ''; 
    resultsHeader.textContent = 'Bookmarked Movies';
    renderMovies(Object.values(favorites)); 
});

function loadBookmarkedMovies() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
    const bookmarkedMovies = Object.values(favorites);
    movieList.innerHTML = ''; 
    renderMovies(bookmarkedMovies); 
}

function toggleSaveMovie(movie, favoriteIcon) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || {};

    if (favorites[movie.id]) {
        delete favorites[movie.id];
        favoriteIcon.classList.remove('active');
    } else {
        favorites[movie.id] = movie;
        favoriteIcon.classList.add('active');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));

    if (resultsHeader.textContent === 'Bookmarked Movies') {
        loadBookmarkedMovies();
    }
}

document.getElementById('bookmarks-btn').addEventListener('click', loadBookmarkedMovies);

window.addEventListener('DOMContentLoaded', () => {
    const fadeInElements = document.querySelectorAll('.fade-in');
    fadeInElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`; 
    });
});

export { api };