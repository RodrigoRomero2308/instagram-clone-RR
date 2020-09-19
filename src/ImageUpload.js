import { Button, CircularProgress, IconButton, Modal } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react'
import { storage, db } from "./firebase";
import firebase from 'firebase';
import './ImageUpload.css'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';

export const ImageUpload = ({ username }) => {
    function getModalStyle() {
        const top = 50;
        const left = 50;

        return {
            top: `${top}%`,
            left: `${left}%`,
            transform: `translate(-${top}%, -${left}%)`,
            display: 'flex',
            flexDirection: 'column'
        };
    }
    const [modalStyle] = React.useState(getModalStyle);
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

    const classes = useStyles();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [caption, setCaption] = useState('');
    const [progress, setProgress] = useState(0);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
        }
    }

    const handleUpload = () => {
        setUploadingImage(true);
        const uploadTask = storage.ref(`images/${fileToUpload.name}`).put(fileToUpload);
        uploadTask.on('state_changed',
            (snapshot) => {
                // progress
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setProgress(progress);
            },
            (error) => {
                console.log(error);
                alert(error.message);
                setProgress(0);
                setCaption('');
                setFileToUpload(null);
                setUploadingImage(false);
            },
            () => {
                storage.ref('images')
                    .child(fileToUpload.name)
                    .getDownloadURL()
                    .then(url => {
                        db.collection('posts').add({
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            caption,
                            imageUrl: url,
                            username: username
                        });

                        setProgress(0);
                        setCaption('');
                        setFileToUpload(null);
                        setUploadingImage(false);
                        setShowUploadModal(false);
                    })
            })
    }

    return (
        <div className='imageUpload'>
            <Modal
                className='imageUpload__modal'
                open={showUploadModal}
                onClose={() => setShowUploadModal(false)}
            >
                <div style={modalStyle} className={classes.paper}>
                    <progress className="imageUpload__progress" value={progress} max={100} />
                    <input type='text' className='imageUpload__input' placeholder='Enter a caption...' value={caption} onChange={(event) => setCaption(event.target.value)} />
                    <input type='file' className='imageUpload__input' onChange={handleChange} />
                    <Button className='imageUpload__uploadButton' disabled={uploadingImage || !caption || !fileToUpload} onClick={handleUpload}>
                        {uploadingImage ?
                            <CircularProgress /> :
                            'Upload'}
                    </Button>
                </div>
            </Modal>
            <IconButton size='small' onClick={() => setShowUploadModal(true)}>
                <AddAPhotoIcon />
            </IconButton>
        </div>
    )
}
