import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/videos`)
      .then(res => {
        setVideos(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    if (localStorage.getItem('token')) {
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, []);

  // Like/Unlike logic
  const toggleLike = async (video) => {
    if (!user) return navigate('/login');
    const isLiked = video.likes.includes(user._id);
    try {
      await axios.post(`${API_URL}/videos/${video._id}/${isLiked ? 'unlike' : 'like'}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setVideos(videos => videos.map(v =>
        v._id === video._id
          ? { ...v, likes: isLiked ? v.likes.filter(id => id !== user._id) : [...v.likes, user._id] }
          : v
      ));
    } catch (e) {}
  };

  // Full page scroll per video like TikTok
document.body.classList.add('dark');
  const handleWheel = (e) => {
    if (e.deltaY > 0 && current < videos.length - 1) {
      setCurrent(idx => Math.min(idx + 1, videos.length - 1));
    } else if (e.deltaY < 0 && current > 0) {
      setCurrent(idx => Math.max(idx - 1, 0));
    }
  };

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
    // eslint-disable-next-line
  }, [current, videos.length]);

  useEffect(() => {
    // Auto play/pause videos
    videoRefs.current.forEach((ref, idx) => {
      if (ref) idx === current ? ref.play() : ref.pause();
    });
  }, [current, videos]);

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-white text-2xl">Loading…</div>
    );
  }

  return (
    <div className="bg-black min-h-screen w-full flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col items-center w-20 py-8 bg-zinc-900 border-r border-zinc-800 space-y-8">
        <Link to="/" className="text-white text-3xl font-black">🕺</Link>
        <Link to={user ? "/upload" : "/login"} className="hover:bg-zinc-800 p-3 rounded-full">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
        </Link>
        <Link to={user ? "#" : "/login"} className="hover:bg-zinc-800 p-3 rounded-full">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.21 0 4.304.536 6.121 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </Link>
        <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="hover:bg-zinc-800 p-3 rounded-full" title="Logout">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0V7a3 3 0 016 0v1"/></svg>
        </button>
      </aside>
      {/* Main feed */}
      <div className="flex-1 flex flex-col items-center justify-center relative h-screen overflow-hidden">
        {/* Animated logo & nav for mobile */}
        <nav className="md:hidden absolute top-0 w-full flex justify-between items-center p-4 z-10 bg-black bg-opacity-70">
          <Link to="/" className="text-white text-2xl font-extrabold drop-shadow logo">HypeSpace</Link>
          <div>
            <Link to={user ? '/upload' : '/login'} className="mr-4 ">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            </Link>
            <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-6 0V7a3 3 0 016 0v1"/></svg>
            </button>
          </div>
        </nav>
        {/* TikTok video feed */}
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          {videos.length === 0 ? (
            <div className="text-white text-2xl flex items-center justify-center h-full">No videos yet</div>
          ) : (
            videos.map((video, idx) => (
              <div key={video._id}
                className={
                  "absolute left-0 top-0 w-full h-full transition-opacity duration-300 flex flex-col items-center justify-center " +
                  (idx === current ? "opacity-100 pointer-events-auto z-20" : "opacity-0 pointer-events-none z-10")
                }
                style={{ background: '#000' }}
              >
                <video
                  ref={el => videoRefs.current[idx] = el}
                  src={`${API_URL}${video.videoUrl}`}
                  className="w-full h-screen object-contain md:object-cover"
                  controls={false}
                  loop
                  autoPlay={idx === current}
                  muted
                />
                {/* Overlay at bottom */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/60 to-black/0 p-6 md:p-12 flex flex-col md:flex-row md:justify-between md:items-end">
                  <div>
                    <p className="text-white text-xl font-semibold mb-2">@{video.user ? video.user.username : 'Unknown'}</p>
                    <p className="text-white text-lg mb-1">{video.description}</p>
                  </div>
                  <div className="flex flex-col items-center md:ml-8 mt-6 md:mt-0">
                    <button onClick={() => toggleLike(video)}
                      className={`transition-all duration-200 group focus:outline-none mb-2 ${user ? '' : 'cursor-pointer'}`}
                      disabled={!user}
                      title={user ? (video.likes.includes(user._id) ? 'Unlike' : 'Like') : 'Login to like'}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${video.likes.includes(user?._id) ? 'text-pink-500 scale-110 animate-pulse' : 'text-white'} group-active:scale-125`} fill={video.likes.includes(user?._id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={video.likes.includes(user?._id) ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.682l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                      </svg>
                    </button>
                    <span className="text-white text-lg font-bold drop-shadow-lg">{video.likes.length}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
