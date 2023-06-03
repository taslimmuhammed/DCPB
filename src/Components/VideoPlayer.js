import React from 'react';
import video from '../Assets/video1.mp4'
const VideoPlayer = () => {
    const handlePlay = () => {
        // Video is playing
        console.log('Video is playing!');
    };

    return (
        <div className='w-80 h-40 border-slate-500 border mt-2 mb-4'>
            <video controls autoPlay onPlay={handlePlay}> 
                <source src={video} type="video/mp4" />
                {/* Add more <source> elements for different video formats */}
            </video>
        </div>
    );
};

export default VideoPlayer;
