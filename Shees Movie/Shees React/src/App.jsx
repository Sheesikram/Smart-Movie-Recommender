import React, { useEffect, useState } from 'react'
import { Search } from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import {  getTrendingMovies,updateSearchCount } from './appwrite';



//curl req

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'appllication/json',
    Authorization: `Bearer ${API_KEY}`

  }
}
export const App = () => {
  const [SearchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [IsLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);
  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearchTerm(SearchTerm), 500, [SearchTerm])




  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error("Failed to fetch movies");

      }
      const data = await response.json();
      //console.log(data); now se to user
      if (data.Response === 'False') {
        setErrorMessage(data.error || 'Fetch Failed');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);


      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    }
    catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("error fetching movies");
    }
    finally {
      setIsLoading(false);
    }
  }
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }



  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm])

//ye ek dafa chalay ga
  useEffect(()=>{
    loadTrendingMovies();
  },[])
  return (
    <main>
      <div className='pattern' />
      <div className='wrapper'>

        <header>
          <img src='./hero-img.png' alt="hero bg" />
          <h1>Find <span className='text-gradient'>Movies </span> you will Enjoy Without the Hassle</h1>
          <Search SearchTerm={SearchTerm} setSearchTerm={setSearchTerm} />

        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 className='mt-[30px]'>All Movies</h2>
          {IsLoading ? (<Spinner />) : errorMessage ? (<p className='text-red-500'>{errorMessage}</p>) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}




        </section>

      </div>

    </main>

  )
}
export default App