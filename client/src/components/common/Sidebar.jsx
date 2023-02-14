import { useSelector, useDispatch } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  ListItemButton,
} from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import assets from './../../assets/index';
import { useNavigate, useParams, Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import boardApi from './../../api/boardApi';
import { setBoards } from '../../redux/features/boardSlice';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import FavouriteList from './FavouriteList';

const Sidebar = () => {
  const user = useSelector((state) => state.user.value);
  const navigate = useNavigate();
  const sidebarWidth = 250;
  const dispatch = useDispatch();
  const boards = useSelector((state) => state.board.value);
  const { boardId } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const getBoards = async () => {
      try {
        const res = await boardApi.getAll();
        dispatch(setBoards(res));
      } catch (err) {
        alert(err);
      }
    };
    getBoards();
  }, [dispatch]);

  useEffect(() => {
    const activeItem = boards.findIndex((e) => e._id === boardId);
    if (boards.length > 0 && boardId === undefined) {
      navigate(`/boards/${boards[0]._id}`);
    }
    setActiveIndex(activeItem);
  }, [boards, boardId, navigate]);

  const matches = useMediaQuery('(max-width: 1200px)');
  const [open, setOpen] = React.useState(!matches);
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const onDragEnd = async ({ source, destination }) => {
    const newList = [...boards];
    const [removed] = newList.splice(source.index, 1);
    newList.splice(destination.index, 0, removed);

    const activeItem = newList.findIndex((e) => e._id === boardId);
    setActiveIndex(activeItem);
    dispatch(setBoards(newList));

    try {
      await boardApi.updatePosition({ boards: newList });
    } catch (err) {
      alert(err);
    }
  };

  const addBoard = async () => {
    try {
      const res = await boardApi.create();
      const newList = [res, ...boards];
      dispatch(setBoards(newList));
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      {matches && (
        <IconButton
          sx={{
            borderRadius: 0,
            height: '100%',
          }}
          onClick={() => setOpen(true)}
        >
          <Typography variant='body2'>
            <MenuIcon />
          </Typography>
        </IconButton>
      )}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        variant={matches ? 'temporary' : 'permanent'}
        sx={{
          width: sidebarWidth,
        }}
      >
        <List
          disablePadding
          sx={{
            width: sidebarWidth,
            height: '100%',
            backgroundColor: assets.color.secondary,
          }}
        >
          <ListItem>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant='body2' fontWeight='700'>
                {user.username}
              </Typography>
              <IconButton onClick={logout}>
                <LogoutOutlinedIcon fontSize='small' />
              </IconButton>
            </Box>
          </ListItem>
          <Box sx={{ paddingTop: '10px' }} />
          <FavouriteList />

          <Box sx={{ paddingTop: '10px' }} />
          <ListItem>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant='body2' fontWeight='700'>
                Private
              </Typography>
              <IconButton onClick={addBoard}>
                <AddBoxOutlinedIcon fontSize='small' />
              </IconButton>
            </Box>
          </ListItem>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              key={'list-board-droppable'}
              droppableId={'list-board-droppable'}
            >
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {boards.map((item, index) => (
                    <Draggable
                      key={item._id}
                      draggableId={item._id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <ListItemButton
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          selected={index === activeIndex}
                          component={Link}
                          to={`/boards/${item._id}`}
                          sx={{
                            pl: '20px',
                            cursor: snapshot.isDragging
                              ? 'grab'
                              : 'pointer!important',
                          }}
                        >
                          <Typography
                            variant='body2'
                            fontWeight='700'
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.icon} {item.title}
                          </Typography>
                        </ListItemButton>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
