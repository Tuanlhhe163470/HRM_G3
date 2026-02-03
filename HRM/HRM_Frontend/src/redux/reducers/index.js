import pokemonReducer from "../slices/PokemonSlice"
import appGlobalReducer from "../slices/appGlobalSlide"
import authReducer from "../slices/AuthSlice"

const rootReducer = {
  pokemon: pokemonReducer,
  appGlobal: appGlobalReducer,
  auth: authReducer,
}

export default rootReducer
