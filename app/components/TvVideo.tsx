"use client";

import React from "react";
import Video from "../components/Video";

/**
 * @returns A styled section highlighting TV / video production jobs
 */
const TvVideo: React.FC = () => {
	return (
		<div id="tv-video" className="contentContainer min-h-screen bg-[#15274c] text-[#f5ead9] mt-[150px]">
			<div className="flex flex-col justify-center items-center w-full h-full">
				<div className="flex flex-col w-full justify-center items-center">
					<div className="w-5/6 text-start">
						<p className="text-4xl font-bold inline border-[#f36c3d] border-b-4">tv / video ...</p>
					</div>
					<div className="flex flex-col pl-10 w-full md:w-5/6">
						<p className="text-xl my-5 px-4">
							I&apos;ve worked as a director, a producer, an editor, and on-camera talent. Here&apos;s some of the
							cooler stuff ...
						</p>
						<div className="flex flex-row w-full justify-between gap-5">
							<div className="mt-8 w-1/2">
								<Video
									url="https://www.youtube.com/embed/F71UCJ-nd2U"
									description={
										<>
											The Thai National Cheerleading team is one of the top teams in the world. They&apos;re self-taught
											and have a love for the sport that&apos;s absolutely contagious. The Cheer Ambassadors, my
											directorial debut, tells their story. It&apos;s an inspirational underdog story that had audiences
											cheering in festivals in over 10 countries. The film won multiple awards, was written up in the
											Wall Street Journal, and had a USA premiere at the San Francisco Asian American Film Festival.
										</>
									}
								/>
							</div>
							<div className="mt-8 w-1/2">
								<Video
									url="https://www.youtube.com/embed/JZyTts39O84"
									description={
										<>
											The magic of pop concerts is performance. It&apos;s not just what the artist does, it&apos;s the
											product of a massive team of dancers and choreographers coming together to help transport the
											audience to another world. In D-Dance Dreams, I told the story of a group of backup dancers as
											they prepare for one of the year&apos;s biggest pop concerts. It&apos;s about a group of people
											who love their art, are willing to work tirelessly, and yet rarely get any credit as most people
											focus on the artists.
										</>
									}
								/>
							</div>
						</div>
						<div className="flex flex-row w-full justify-between gap-5">
							<div className="mt-8 w-1/2">
								<Video
									url="https://www.youtube.com/embed/fAD9ezTVGVM"
									description={
										<>
											Soon after YouTube opened a Thailand office, I cofounded{" "}
											<a className="underline" target="_blank" rel="noreferrer" href="https://youtube.com/picnicly">
												Picnicly,
											</a>
											&nbsp;a channel focused on telling upbeat and inspiring stories. We designed the channel to be an
											oasis of positivity, an inclusive place that would entertain without alienating anyone. Our upbeat
											storytelling helped us build an audience over 650,000 subscribers in a few years.
										</>
									}
								/>
							</div>
							<div className="mt-8 w-1/2">
								<Video
									url="https://player.vimeo.com/video/160713735?h=354e808d5d"
									description={
										<>
											In working with corporate clients, I focus on projects where storytelling can be used to introduce
											a client&apos;s product, and then bond with the viewer as we drew them in. In this video produced
											for Lamont Design, we start with the story of the designer, expand it to share his relationship
											with Thailand, and finally we introduce his product. A stunning table that mixes contemporary
											design with traditional Thai craftsmanship.
										</>
									}
								/>
							</div>
						</div>
						<div className="flex flex-row w-full justify-between gap-5">
							<div className="mt-8 w-1/2">
								<Video
									url="https://www.youtube.com/embed/eFUn07piFdI"
									description={
										<>
											Before Thailand had miles of malls and megaplexes, traveling troupes would crisscross the country
											with a portable screen and projector. In village after village, they would set up camp, show the
											latest films, and narrate them in real-time for a captive audience. I directed this short doc to
											tell the story of one of the few remaining narrators and his humble museum dedicated to a dying
											craft.
										</>
									}
								/>
							</div>
							<div className="mt-8 w-1/2"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TvVideo;
