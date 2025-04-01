import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardMedia,
  CardActions,
  Checkbox,
  CardContent,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const Dashboard = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [similarPhotos, setSimilarPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/photos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPhotos(response.data);
      } catch (err) {
        setError('Failed to fetch photos');
      }
    };

    fetchPhotos();
  }, []);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUploadDialogOpen(false);
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    }
  };

  const handleMatch = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('threshold', '0.8');

    try {
      const response = await axios.post('http://localhost:5000/api/find-similar', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSimilarPhotos(response.data.similar_photos);
      setSelectedPhotos(response.data.similar_photos.map(photo => photo.path));
      setMatchDialogOpen(false);
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Matching failed');
    }
  };

  const handlePhotoToggle = (path) => {
    setSelectedPhotos(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const handleDownload = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/download',
        { photo_paths: selectedPhotos },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'similar_photos.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.response?.data?.error || 'Download failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Dashboard
            </Typography>
            <Button variant="outlined" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}
          <Grid container spacing={3}>
            {photos.map((photo) => (
              <Grid item xs={12} sm={6} md={4} key={photo.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={photo.url}
                    alt={photo.description}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {photo.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Photo Management Dashboard
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => setUploadDialogOpen(true)}
              >
                Upload Photo
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={() => setMatchDialogOpen(true)}
              >
                Find Similar Photos
              </Button>
            </Grid>
          </Grid>

          {similarPhotos.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Similar Photos Found
              </Typography>
              <Grid container spacing={2}>
                {similarPhotos.map((photo) => (
                  <Grid item xs={12} sm={6} md={4} key={photo.path}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={`http://localhost:5000/uploads/${photo.filename}`}
                        alt={photo.filename}
                      />
                      <CardActions>
                        <Checkbox
                          checked={selectedPhotos.includes(photo.path)}
                          onChange={() => handlePhotoToggle(photo.path)}
                        />
                        <IconButton
                          onClick={() => handlePhotoToggle(photo.path)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownload}
                sx={{ mt: 2 }}
              >
                Download Selected Photos
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload Photo</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ marginTop: '1rem' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" color="primary">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Match Dialog */}
      <Dialog open={matchDialogOpen} onClose={() => setMatchDialogOpen(false)}>
        <DialogTitle>Find Similar Photos</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ marginTop: '1rem' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMatchDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMatch} variant="contained" color="primary">
            Find Similar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 