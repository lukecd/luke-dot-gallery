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
									layout="responsive"
									width={592}
									height={399}
								/>
								<p className="mt-5 leading-7 self-end">
									The{" "}
									<Link href="https://docs.irys.xyz" className="underline" target="_blank" rel="noreferrer">
										Irys docs
									</Link>{" "}
									cover everything devs need to know about our protocol, including how to interact with it using our
									SDKs and CLI. 
								</p>
							</div>
							<div className="md:w-1/2 mt-10 md:mt-0">
								<Image
									className="w-full"
									src="/images/provenance-toolkit.png"
									alt="Irys Provenance Toolkit"
									layout="responsive"
									width={592}
									height={399}
								/>
								<p className="mt-5 leading-7">
									The{" "}
									<Link
										href="https://provenance-toolkit.irys.xyz"
										className="underline"
										target="_blank"
										rel="noreferrer"
									>
										Irys Provenance Toolkit
									</Link>{" "}
									is an open-source UI library for interacting with our protocol. 
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
