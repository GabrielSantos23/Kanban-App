import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import { Box, IconButton, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import boardApi from '../api/boardApi';
import EmojiPicker from '../components/common/EmojiPicker';
import Kanban from '../components/common/Kanban';
import Loader from '../components/common/Loader';
import LoadingText from '../components/common/LoadingText';
import { setBoards } from '../redux/features/boardSlice';
import { setFavouriteList } from '../redux/features/favouriteSlice';

let timer;
const timeout = 500;

const Board = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [icon, setIcon] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const boards = useSelector((state) => state.board.value);
  const favouriteList = useSelector((state) => state.favourites.value);
  const [isLoadingComponent, setIsLoadingComponent] = useState(true);

  useEffect(() => {
    const getBoard = async () => {
      try {
        const res = await boardApi.getOne(boardId);

        setTitle(res.title);
        setDescription(res.description);
        setSections(res.sections);
        setIsFavourite(res.favourite);
        setIcon(res.icon);
        setIsLoadingComponent(false);
      } catch (err) {
        alert(err);
        console.log(err);
      }
    };
    getBoard();
  }, [boardId]);

  const onIconChange = async (newIcon) => {
    let temp = [...boards];
    const index = temp.findIndex((e) => e._id === boardId);
    temp[index] = { ...temp[index], icon: newIcon };

    if (isFavourite) {
      let tempFavourite = [...favouriteList];
      const favouriteIndex = tempFavourite.findIndex((e) => e._id === boardId);
      tempFavourite[favouriteIndex] = {
        ...tempFavourite[favouriteIndex],
        icon: newIcon,
      };
      dispatch(setFavouriteList(tempFavourite));
    }
    setIcon(newIcon);
    dispatch(setBoards(temp));
    try {
      await boardApi.update(boardId, { icon: newIcon });
    } catch (err) {
      alert(err);
    }
  };

  const updateTitle = async (e) => {
    clearTimeout(timer);

    const newTitle = e.target.value;
    setTitle(newTitle);
    let temp = [...boards];
    const index = temp.findIndex((e) => e._id === boardId);
    temp[index] = { ...temp[index], title: newTitle };

    if (isFavourite) {
      let tempFavourite = [...favouriteList];
      const favouriteIndex = tempFavourite.findIndex((e) => e._id === boardId);
      tempFavourite[favouriteIndex] = {
        ...tempFavourite[favouriteIndex],
        title: newTitle,
      };
      dispatch(setFavouriteList(tempFavourite));
    }

    dispatch(setBoards(temp));
    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { title: newTitle });
      } catch (err) {
        alert(err);
      } finally {
      }
    });
  };
  const updateDescription = async (e) => {
    clearTimeout(timer);
    const newDescription = e.target.value;
    setDescription(newDescription);
    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { description: newDescription });
      } catch (err) {
        alert(err);
      }
    }, timeout);
  };

  const addFavourites = async () => {
    try {
      const board = await boardApi.update(boardId, { favourite: !isFavourite });
      let newFavouriteList = [...favouriteList];
      if (isFavourite) {
        newFavouriteList = newFavouriteList.filter((e) => e._id !== boardId);
      } else {
        newFavouriteList.unshift(board);
      }
      dispatch(setFavouriteList(newFavouriteList));
      setIsFavourite(!isFavourite);
    } catch (error) {
      alert(error);
    }
  };

  const deleteBoard = async () => {
    try {
      setIsLoading(true);
      await boardApi.delete(boardId);
      if (isFavourite) {
        const newFavouriteList = favouriteList.filter((e) => e._id !== boardId);
        dispatch(setFavouriteList(newFavouriteList));
      }

      const newList = boards.filter((e) => e._id !== boardId);
      setIsLoading(false);
      if (newList.length === 0) {
        navigate('/boards');
      } else {
        navigate(`/boards/${newList[0]._id}`);
      }
      dispatch(setBoards(newList));
    } catch (err) {
      alert(err);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <IconButton variant='outlined' onClick={addFavourites}>
          {isFavourite ? (
            <StarOutlinedIcon color='warning' />
          ) : (
            <StarBorderOutlinedIcon />
          )}
        </IconButton>
        <IconButton variant='outlined' color='error'>
          {isLoading ? (
            <Loader />
          ) : (
            <DeleteOutlinedIcon onClick={deleteBoard} />
          )}
        </IconButton>
      </Box>

      <Box sx={{ padding: '10px 50px' }}>
        <Box>
          {/* emoji picker */}
          {isLoadingComponent ? (
            <div style={{ fontSize: '46px' }}>📃</div>
          ) : (
            <EmojiPicker onChange={onIconChange} icon={icon} />
          )}
          <TextField
            value={isLoadingComponent ? 'Loading...' : title}
            placeholder='Untitled'
            onChange={updateTitle}
            variant='outlined'
            fullWidth
            sx={{
              '& .MuiOutlinedInput-input': { padding: 0 },
              '& .MuiOutlinedInput-notchedOutline': { border: 'unset ' },
              '& .MuiOutlinedInput-root': {
                fontSize: '2rem',
                fontWeight: '700',
              },
            }}
          />
          <TextField
            value={description}
            placeholder='Add a description'
            variant='outlined'
            onChange={updateDescription}
            multiline
            fullWidth
            sx={{
              '& .MuiOutlinedInput-input': { padding: 0 },
              '& .MuiOutlinedInput-notchedOutline': { border: 'unset ' },
              '& .MuiOutlinedInput-root': { fontSize: '0.8rem' },
            }}
          />
        </Box>
        <Box>
          <Kanban data={sections} boardId={boardId} />
        </Box>
      </Box>
    </>
  );
};

export default Board;
