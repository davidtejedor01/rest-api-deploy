import z from 'zod'

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().min(1900).max(2026),
  director: z.string({
    invalid_type_error: "Movie director must be a string",
    required_error: "Movie director is required",
  }),
  duration: z.number().int().positive(),
  poster: z.string().url(),
  genre: z.array(
    z.enum([
      "Action",
      "Adventure",
      "Comedy",
      "Crime",
      "Horror",
      "Thriller",
      "Drama",
      "Sci-Fi",
      "Biography",
      "Romance",
      "Fantasy",
    ])
  ),
  rate: z.number().min(0).max(10).default(5),
});

export function validateMovie(object) {
  return movieSchema.safeParse(object);
}
export function validatePartial(object) {
  return movieSchema.partial().safeParse(object);
}

