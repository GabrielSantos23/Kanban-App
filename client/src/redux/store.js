import { configureStore } from '@reduxjs/toolkit';
import userSlice from './features/userSlice';
import boardSlice from './features/boardSlice';
import favouriteSlice from './features/favouriteSlice';
export const store = configureStore({
  reducer: {
    user: userSlice,
    board: boardSlice,
    favourites: favouriteSlice,
  },
});
