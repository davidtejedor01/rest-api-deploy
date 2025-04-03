const express = require("express");
const movies = require("./movies.json");
const crypto = require("node:crypto");
const { validateMovie, validatePartial } = require("./schemas/movies");

const app = express();
app.disable("x-powered-by");

app.use(express.json());
const ACCEPTED_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:5001",
  "http://movies.com",
];

app.get("/movies", (req, res) => {
  const origin = req.header("origin");
  if (ACCEPTED_ORIGINS.includes(origin || !origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  const { genre } = req.query;
  if (genre) {
    // const filterMovies=movies.filter(movie=>movie.genre.includes(genre))
    const filterMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    res.json(filterMovies);
  }
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params; //recuperando parametro id
  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);

  res.status(404).json({ message: "Movie not founded" });
});

app.post("/movies", (req, res) => {
  console.log("Request body:", req.body);
  const result = validateMovie(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.format() });
  }
  //en base de datos
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };
  // ESTO NO SERÍA REST PORQUE ESTAMOS GUARDANDO EL ESTADO EN MEMORIA
  movies.push(newMovie);
  res.status(201).json(newMovie); //actualizar la cache del cliente
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartial(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.format() });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1)
    return res.status(404).json({ message: "Movie not founded" });

  const updateMovie = {
    //actualizando pelicula con:
    ...movies[movieIndex], //las propiedades de la pelicula existente
    ...result.data, //las nuevas propiedades de la pelicula
  };

  movies[movieIndex] = updateMovie; //Reemplaza la película en la posición movieIndex con el nuevo objeto updateMovie

  return res.json(updateMovie);
});

app.delete("/movies/:id", (req, res) => {
  const origin = req.header("origin");
  if (ACCEPTED_ORIGINS.includes(origin || !origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  movies.splice(movieIndex, 1);
  return res.json({ message: "Movie deleted" });
});

app.options("/movies/:id", (req, res) => {
  const origin = req.header("origin");
  if (ACCEPTED_ORIGINS.includes(origin || !origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATH,DELETE");
  }
  res.send(200);
});

const PORT = process.env.PORT ?? 5001;

app.listen(PORT, () => {
  console.log("Open: http://localhost:5001");
});
