"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Video from "../components/Video";

/**
 * @returns DevRel work
 */
const DevRel: React.FC = () => {
	return (
		<div id="devrel" className="contentContainer  text-[#f5ead9] mt-[150px]">
			<div className="flex flex-col justify-center items-center w-full h-full">
				<div className="flex flex-col w-full justify-center items-center">
					<div className="md:w-5/6 text-start">
						<p className="text-xl md:text-4xl font-bold inline border-[#f36c3d] border-b-4">developer relations ...</p>
					</div>
					<div className="flex flex-col md:pl-10 w-full md:w-5/6 px-2">
						<p className="md:text-xl my-5 px-4">I lie in bed at night thinking about how to make better docs ...</p>

						<div className="flex flex-col md:flex-row w-full justify-between gap-5">
							<div className="md:w-1/2 mt-10 md:mt-0">
								<Video
									url="https://www.youtube.com/embed/9Y5rc8OC6yE"
									description={<>Grok DAS in 5 minutes.</>}
								/>
							</div>
							<div className="md:w-1/2 mt-10 md:mt-0">
								<Video
									url="https://www.youtube.com/embed/8gBjhHVw5mE"
									description={<>Make your app verifiable in 5 mintues with Chopin.</>}
								/>
							</div>
						</div>

						<div className="flex flex-col md:mt-10 md:flex-row w-full justify-between gap-5">
							<div className="md:w-1/2 mt-10 md:mt-0">
								<Video
									url="https://www.youtube.com/embed/uNoG2_UzvA8"
									description={<>This is Irys.</>}
								/>
							</div>
							<div className="md:w-1/2 mt-10 md:mt-0">
								<Video
									url="https://www.youtube.com/embed/6dZbV5HFK2M"
									description={<>This is verifiability.</>}
								/>
							</div>
						</div>

						<div className="flex flex-col md:mt-10 md:flex-row w-full justify-between gap-5">
							<div className="md:w-1/2 mt-10 md:mt-0">
								<Image
									className="w-full"
									src="/images/irys-docs.png"
									alt="Irys Docs"
									width={592}
									height={399}
									sizes="(max-width: 768px) 100vw, 50vw"
								/>
								<p className="mt-5 leading-7 self-end">
									<Link href="https://docs.irys.xyz" className="underline" target="_blank" rel="noreferrer">
										Irys docs.
									</Link>{" "} 
								</p>
							</div>
							<div className="md:w-1/2 mt-10 md:mt-0">
								<Image
									className="w-full"
									src="/images/bonding-curve.png"
									alt="Irys Provenance Toolkit"
									width={592}
									height={399}
									sizes="(max-width: 768px) 100vw, 50vw"
								/>
								<p className="mt-5 leading-7">
									The{" "}
									<Link
										href="https://github.com/lukecd/token-examples"
										className="underline"
										target="_blank"
										rel="noreferrer"
									>
										Bonding Curve Tokens
									</Link>{" "}
									repo demonstrates how to create a bonding curve token, and interact with it using Next.js. It was part of a larger project that included a written tutorial and video. 
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DevRel;
