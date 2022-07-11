import React from 'react';
import Video from '../components/Video';

/**
 * 
 * @returns A styled grid of some TV / video production jobs I've worked on
 */
const TvVideo = () => {
  return (
    <div name='tv-video' className='mt-40 w-full h-full overflow-visible bg-[#15274c] text-[#f5ead9]'>
        <div className='flex flex-col justify-center items-center w-full h-full'>
            <div className='max-w-[1000px] w-full grid grid-cols-1 gap-8'>
                <div className='text-left pb-8 pl-4'>
                    <p className='text-4xl font-bold inline border-b-4 border-[#f36c3d]'>tv / video ...</p>
                    <p className='text-2xl my-5 px-4'>
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
                    description={<>The Thai National Cheerleading team is one of the top teams in the world. 
                    They're self-taught and have a love for the sport that's absolutely contagious. 
                    The Cheer Ambassadors, my directorial debut, tells their story. It's an inspirational underdog 
                    story that had audiences cheering in festivals in over 10 countries. The film won multiple awards, 
                    was written up in the Wall Street Journal, and had a USA premiere at the San Francisco Asian American Film Festival.
                    </>}
                />
                <Video
                    url="https://www.youtube.com/embed/JZyTts39O84"
                    description={<>The magic of pop concerts is performance. It's not just what the artist does, 
                    it's the product of a massive team of dancers and choreographers coming together to help transport 
                    the audience to another world. In D-Dance Dreams, I told the story of a group of backup dancers 
                    as they prepare for one of the year's biggest pop concerts. It's about a group of people who love their art, 
                    are willing to work tirelessly, and yet rarely get any credit as most people focus on the artists.</>}
                />

                <Video
                    url="https://www.youtube.com/embed/fAD9ezTVGVM"
                    description={<>Soon after YouTube opened a Thailand office, I cofounded <a className='underline' target='_blank' rel='noreferrer' href='https://youtube.com/picnicly'>Picnicly,</a> 
                    &nbsp;a channel focused on telling upbeat and inspiring stories. We designed the channel to be an oasis of positivity, 
                    an inclusive place that would entertain without alienating anyone. 
                    Our upbeat storytelling helped us build an audience over 650,000 subscribers in a few years.
                    </>}
                />                
                <Video
                    url="https://www.youtube.com/embed/g5cAohInNIc"
                    description={<>In 2018, our work with Picnicly was recognized by the <a className='underline' target='_blank' rel='noreferrer' href='https://blog.youtube/creator-and-artist-stories/meet-2018-creators-for-change-global/'>YouTube Creators for Change program</a> 
                    &nbsp;for our commitment to using YouTube to create socially-conscious LBGTQIA+ stories. 
                    We received a cash grant that we used to launch a series of workshops to train a new generation of LBGTQIA+ YouTubers.
                    </>}
                />

                <Video
                    url="https://player.vimeo.com/video/160713735?h=354e808d5d"
                    description={<>In working with corporate clients, I focus on projects where storytelling can be used to introduce 
                    a client's product, and then bond with the viewer as we drew them in. In this video produced for Lamont Design, 
                    we start with the story of the designer, expand it to share his relationship with Thailand, and finally we introduce his product. 
                    A stunning table that mixes contemporary design with traditional Thai craftsmanship.</>}
                />                
            
                <Video
                    url="https://www.youtube.com/embed/eFUn07piFdI"
                    description={<>Before Thailand had miles of malls and megaplexes, traveling troupes would crisscross the country with a portable screen 
                    and projector. In village after village, they would set up camp, show the latest films, 
                    and narrate them in real-time for a captive audience. I directed this short doc to tell the story of one of the 
                    few remaining narrators and his humble museum dedicated to a dying craft.</>}
                />
            </div>

        </div>
    </div>
  )
}

export default TvVideo