import { api } from '../script.js';

export const renderMoviePage = async (movieId) => {
    const movieList = document.getElementById('movie-list');
    const resultsHeader = document.getElementById('results-header');
    const searchInput = document.getElementById('search-input');

    movieList.innerHTML = '';
    resultsHeader.textContent = 'Loading...';

    searchInput.style.display = 'none'; 

    try {
        const movie = await api.fetchMovieDetails(movieId);

        movieList.innerHTML = `
            <div class="movie-details">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
                <p><strong>Rating:</strong> ${movie.vote_average}</p>
                <p>${movie.overview}</p>
                <h3>Genres:</h3>
                <ul>
                    ${movie.genres.map(genre => `<li>${genre.name}</li>`).join('')}
                </ul>
            </div>
        `;
        resultsHeader.textContent = movie.title;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        resultsHeader.textContent = 'Error loading movie';
    }
};