"use client";

import React from "react";
import Image from "next/image";

/**
 * @returns A styled section highlighting recent electronic music projects
 */
const Music: React.FC = () => {
	return (
		<div id="music" className="contentContainer min-h-screen mt-10">
			<div className="flex flex-col justify-center items-center w-full h-full">
				<div className="flex flex-col w-full justify-center items-center">
					<div className="w-5/6 text-start">
						<p className="text-4xl font-bold inline border-[#f36c3d] border-b-4">electronic music ...</p>
					</div>
					<div className="flex flex-col pl-10 w-full md:w-5/6">
						<p className="text-xl my-5 px-4">
							Making electronic music is how I use my tech background to express myself creatively...
						</p>
						<div className="flex flex-row w-full justify-between gap-5">
							<div className="mt-8 w-1/2">
								<Image className="" src="/images/id-one.png" alt="Interdimensional One" width={592} height={592} />

								<p className="mt-5 leading-7">
									<a href="https://interdimensional.one" target="_blank" className="underline" rel="noreferrer">
										Interdimensional One
									</a>{" "}
									is a generative art and music experience that feeds off NFTs. It&apos;s a portal from your monkey mind
									to a place of stillness. It&apos;s the first ever NFT marketplace for sound designers. It&apos;s a
									place you go to relax, you can watch the visuals or interact with them.
								</p>
								<p className="mt-5 leading-7">
									Currently running on the Mumbai testnet as an MVP, anyone can mint NFTs and create a generative
									soundtrack perfect for relaxing.
								</p>
							</div>

							<div className="mt-8 w-1/2">
								<Image
									className=""
									src="/images/travel-back-to-the-now.png"
									alt="Travel Back To The Now"
									width={592}
									height={592}
								/>
								<p className="mt-5 leading-7">
									Travel Back To The Now mixes traditional Thai sounds with psychedelic noises and dance music grooves.
									It&apos;s designed to transport the listener to their flow state, to quiet their minds and return them
									to the now. It is available on{" "}
									<a
										href="https://music.apple.com/us/album/travel-back-to-the-now-ep/1519280723"
										className="underline"
										target="_blank"
										rel="noreferrer"
									>
										Apple Music
									</a>{" "}
									and{" "}
									<a
										href="https://open.spotify.com/artist/2t2qaObfUFyPorEkNyo0jt"
										className="underline"
										target="_blank"
										rel="noreferrer"
									>
										Spotify
									</a>
									.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Music;
