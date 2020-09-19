import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import './App.css';
import { db, auth } from './firebase';
import { Post } from './Post';
import Modal from '@material-ui/core/Modal';
import { Backdrop, Button, CircularProgress, Input } from '@material-ui/core';
import { ImageUpload } from './ImageUpload';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: '70%',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/instagram-clone-rr.appspot.com/o/Logo%20instagramnt.jpeg?alt=media&token=8c9b063c-d44a-41b7-a3bf-6fce992a0d82';
  const classes = useStyles();
  const [posts, setPosts] = useState([]);
  const [showBackdrop, setShowBackdrop] = useState(true);
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // logged in
        console.log(authUser);
        setUser(authUser);
      } else {
        // logged out
        setUser(null);
      }
    })
    return () => {
      // se desubscribe para no llenar de listeners
      unsubscribe();
    }
  }, [user, username]);

  useEffect(() => {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      setShowBackdrop(false);
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data(),
      })));
    })
  }, [])

  const signUp = (event) => {
    event.preventDefault();
    setShowBackdrop(true);
    auth.createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
        })
      })
      .then(() => auth.signOut())
      .then(() => auth.signInWithEmailAndPassword(email, password))
      .then(() => setShowBackdrop(false))
      .catch(error => {
        setShowBackdrop(false);
        alert(error.message);
      });
    setOpen(false);
  }

  const signIn = (event) => {
    event.preventDefault();
    setShowBackdrop(true);
    auth.signInWithEmailAndPassword(email, password)
      .then(() => setShowBackdrop(false))
      .catch((error) => {
        setShowBackdrop(false);
        alert(error.message);
      });
    setOpenSignIn(false);
  }

  return (
    <div className="app">
      <Modal
        className='app__modal'
        open={open}
        onClose={() => setOpen(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className='app__signup'>
            <center>
              <img
                className='app__headerImage'
                src={logoUrl}
                alt=''
              />
            </center>
            <Input
              placeholder="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>
      <Modal
        className='app__modal'
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className='app__signup'>
            <center>
              <img
                className='app__headerImage'
                src={logoUrl}
                alt=''
              />
            </center>
            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" onClick={signIn}>Sign In</Button>
          </form>
        </div>
      </Modal>
      <div className='app__backdrop'>
        <Backdrop open={showBackdrop} >
          <CircularProgress />
        </Backdrop>
      </div>
      <div className='app__header'>
        <img
          className='app__headerImage'
          src={logoUrl}
          alt=''
        />
        {user?.displayName ?
          <ImageUpload username={user.displayName} /> :
          null}
        {user?.displayName ? (
          <Button onClick={() => auth.signOut()}>Logout</Button>
        ) : (
            <div className='app__loginContainer'>
              <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
              <Button onClick={() => setOpen(true)}>Sign Up</Button>
            </div>
          )
        }
      </div>

      <div className='app__posts'>
        {posts.map(({ id, post }) => (
          <Post
            key={id}
            postId={id}
            user={user}
            imageUrl={post.imageUrl}
            username={post.username}
            caption={post.caption}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
