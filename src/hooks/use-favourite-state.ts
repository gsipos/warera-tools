import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type FavouriteType = 'country' | 'user'

interface Favourite {
  type: FavouriteType
  id: string
}

interface FavouriteState {
  favourites: Favourite[]
}

interface FavouriteActions {
  addFavourite: (favourite: Favourite) => void
  removeFavourite: (id: string) => void
  isFavourite: (id: string) => boolean
}

export type FavouriteStateStore = FavouriteState & FavouriteActions

const initialFavouriteState: FavouriteState = {
  favourites: [],
}

export const useFavouriteState = create<FavouriteStateStore>()(
  persist(
    (set, get) => ({
      ...initialFavouriteState,

      addFavourite: (favourite: Favourite) => {
        if (get().isFavourite(favourite.id)) return
        set((state) => ({
          favourites: [...state.favourites, favourite],
        }))
      },

      removeFavourite: (id: string) => {
        set((state) => ({
          favourites: state.favourites.filter((f) => f.id !== id),
        }))
      },

      isFavourite: (id: string) => {
        return get().favourites.some((f) => f.id === id)
      },
    }),
    {
      name: 'wt-favourite-state',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
