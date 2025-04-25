import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Upload = () => {
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('video', video);
    formData.append('description', description);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/videos`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/');
    } catch (err) {
      alert('Upload failed');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Upload Video</h2>
      <form onSubmit={handleSubmit} className="max-w-md">
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full mb-2 p-2 border" />
        <input type="file" accept="video/*" onChange={e => setVideo(e.target.files[0])} className="w-full mb-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Upload</button>
      </form>
    </div>
  );
};

export default Upload;