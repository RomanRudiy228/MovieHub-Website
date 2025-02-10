import { api } from '../script.js';

export const renderPopularPage = async () => {
    const movieList = document.getElementById('movie-list');
    const resultsHeader = document.getElementById('results-header');

    resultsHeader.textContent = 'Popular Movies';
    movieList.innerHTML = '';

    try {
        const movies = await api.fetchPopularMovies();
        movieList.innerHTML = ''; 
        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie-item');
            movieElement.dataset.movieId = movie.id;

            movieElement.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
                <h3>${movie.title}</h3>
            `;

            movieElement.addEventListener('click', () => {
                window.history.pushState(null, '', `/movies/${movie.id}`);
            });

            movieList.appendChild(movieElement);
        });
    } catch (error) {
        console.error('Error fetching popular movies:', error);
    }
};