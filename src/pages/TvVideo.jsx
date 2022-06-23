import React from 'react';
import Video from '../components/Video';

const TvVideo = () => {
  return (
    <div name='tv-video' className='w-full min-h-full overflow-visible bg-[#15274c] text-[#f5ead9] overflow-visible mt-10'>
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

            <div className='contentBody'>
                <Video 
                    url="https://www.youtube.com/embed/F71UCJ-nd2U"
                    description={<>The Thai National Cheerleading team is one the top teams in the world. They're self-taught,
                    and have a love for the sport that's absolutely contagious. The Cheer Ambassador, my directorial debut,
                    tells their story. It's an inspirational underdog story that had audiences cheering in festivals in over 10
                    countries. The film won multiple awards, was written up in the Wall Street Journal and had a USA premiere
                    at the San Francisco Asian American Film Festival.
                    </>}
                />
                <Video
                    url="https://www.youtube.com/embed/JZyTts39O84"
                    description={<>The magic of pop concerts is performance. It's not just what the artist does, 
                    it's the product of a massive team of dancers and choreographers coming together to help transport
                    and audience to another world. 
                    <p>In D-Dance Dreams I told the story of a group of backup dancers as they prepare for one of the year's biggest pop concerts. It's the story of a group of people who love their art, are willing to work tirelessly, and yet 
                    rarely get any credit as most people focus on the atists. </p></>}
                />
            </div>

            <div className='px-5 sm:px-0 mt-10 max-w-[1000px] w-full grid sm:grid-cols-2 gap-8'>
                <Video
                    url="https://www.youtube.com/embed/fAD9ezTVGVM"
                    description={<>
                    Soon after YouTube opened a Thailand office, I cofounded <a className='underline' target='_blank' href='https://youtube.com/picnicly'>Picnicly</a>, channel focused on telling upbeat and inspiring stories. We designed
                    the channel to be an oasis of positivity, an inclusive place that would entertain without alienating
                    any one group. <p>Our upbeat storytelling helped us build an audience over 650,000 subscribers
                    in a few years.</p></>}
                />                
                <Video
                    url="https://www.youtube.com/embed/g5cAohInNIc"
                    description={<>In 2018 our work with Picnicly was recognized by the <a className='underline' target='_blank' href='https://blog.youtube/creator-and-artist-stories/meet-2018-creators-for-change-global/'>YouTube Creators For Change program</a> for
                    our commitment to using YouTube to create socially-conscious LBGTQIA+ stories.<br/>
                    We received a cash grant we then used to launch a series of workshops to train a new generation of LBGTQIA+ YouTubers."</>}
                />
            </div>

            <div className='px-5 sm:px-0 mt-10 max-w-[1000px] w-full grid sm:grid-cols-2 gap-8'>
                <Video
                    url="https://player.vimeo.com/video/160713735?h=354e808d5d"
                    description={<>In working with coporate clients, I focused on projets where storytelling could be used to introduce a client's product,
                    and then bond with the viewer as we drew them in.<p>In this video produced for Lamont Design, we start with the story of the designer,
                    expand it to share his relationship with Thailand and finally we intoduce his product. A stunning table that mixes contempory
                    design with traditional Thai craftsmanship.</p> </>}
                />                
                <div>
                    <Video
                        url="https://www.youtube.com/embed/eFUn07piFdI"
                        description={<>Before Thailand had miles of malls and movieplexes, traveling troups would crisscross the country with a portable screen and projector. In village after village they would setup camp, show the latest films and then narrate them in real-time for a captive audience. <p>I directed this short doc to tell the story of one of the last few remaining narrators and his humble museum dedicated to a dying craft.</p></>}
                    />
                        
                </div>
            </div>

        </div>
    </div>
  )
}

export default TvVideo