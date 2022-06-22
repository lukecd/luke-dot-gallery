import React from 'react'

const TvVideo = () => {
  return (
    <div name='tv-video' className='w-full min-h-full bg-[#15274c] text-[#f5ead9] overflow-visible mt-10'>
        <div className='flex flex-col justify-center items-center w-full h-full'>
            <div className='max-w-[1000px] w-full grid sm:grid-cols-2 gap-8'>
                <div className='text-left pb-8 pl-4'>
                    <p className='text-4xl font-bold inline border-b-4 border-[#f36c3d]'>tv / video ...</p>
                    <p className='text-2xl'>
                        I've worked as a director, a producer, an editor and on-camera talent.
                        Here's some of the cooler stuff ...
                    </p>
                </div>
                <div>
                </div>
            </div>

            <div className='px-5 sm:px-0 max-w-[1000px] w-full grid sm:grid-cols-2 gap-8 '>
                <div className=''>
                    <div class="aspect-w-16 aspect-h-9">
                        <iframe src="https://www.youtube.com/embed/F71UCJ-nd2U" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                    <p className='mt-5 leading-7'>I directed The Cheer Ambassadors, an inspirational documentary film about the Thai National Cheerleading team and their unconventional path to glory. We showed in over 10 countries and won multiple awards.</p>
                    
                </div>
                <div>
                    <div class="aspect-w-16 aspect-h-9">
                        <iframe src="https://www.youtube.com/embed/JZyTts39O84" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                    <p className='mt-5 leading-7'>I directed D-Dance Dreams, a docu-series made for Thai TV that tells the story of a group of backup dancers as they prepare for one of the year's biggest pop concerts.</p>
                </div>
            </div>

            <div className='px-5 sm:px-0 mt-10 max-w-[1000px] w-full grid sm:grid-cols-2 gap-8'>
                <div>
                    <div class="aspect-w-16 aspect-h-9">
                        <iframe src="https://www.youtube.com/embed/fAD9ezTVGVM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                    <p className='mt-5 leading-7'>I cofounded a <a className="underline" target="_blank" href='https://youtube.com/picnicly'>Picnicly</a>, YouTube channel focused on telling upbeat and inspiring stories around topics like travel, culture and social issues. We grew the channel to over 650,000 subscribers.</p>
                    
                </div>
                <div>
                    <div class="aspect-w-16 aspect-h-9">
                        <iframe src="https://www.youtube.com/embed/g5cAohInNIc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                    <p className='mt-5 leading-7'>In 2018 our work with Picnicly was recognized by the <a className="underline" target="_blank" href="https://blog.youtube/creator-and-artist-stories/meet-2018-creators-for-change-global/">YouTube Creators For Change program</a> for
                    our commitment to using YouTube to create socially-conscious LBGTQIA+ stories.</p>
                    <p className='mt-5 leading-7'>We received a cash grant we then used to launch a series of workshops to train a new generation of LBGTQIA+ YouTubers.</p>
                    
                </div>
            </div>

            <div className='px-5 sm:px-0 mt-10 max-w-[1000px] w-full grid sm:grid-cols-2 gap-8'>
                <div>
                    <div class="aspect-w-16 aspect-h-9">
                        <iframe src="https://player.vimeo.com/video/160713735?h=354e808d5d" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                    <p className='mt-5 leading-7'>I developed video content for corporate clients interested in using storytelling to present their products.</p>
                    
                </div>
                <div>
                    
                </div>
            </div>

        </div>
    </div>
  )
}

export default TvVideo