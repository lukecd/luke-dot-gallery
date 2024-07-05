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
					<div className="w-5/6 text-start">
						<p className="text-4xl font-bold inline border-[#f36c3d] border-b-4">developer relations ...</p>
					</div>
					<div className="flex flex-col w-full md:w-5/6">
						<p className="text-xl my-5 px-4">I lie in bed at night thinking about how to make better docs ...</p>

						<div className="flex flex-row w-full justify-between gap-5">
							<div className="w-1/2">
								<Video
									url="https://www.youtube.com/embed/CdWn9clSybM"
									description={<>Everything devs need to know to build with the Irys SDK.</>}
								/>
							</div>
							<div className="w-1/2">
								<Video
									url="https://www.youtube.com/embed/8CuS7aJJShU"
									description={<>An introduction to Irys, our tech and the problems it solves.</>}
								/>
							</div>
						</div>

						<div className="flex flex-row w-full  gap-5 ">
							<div className="mt-8 w-1/2">
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
									SDKs and CLI. There is a protocol overview, API docs, guides, tutorials, and more.
								</p>
							</div>
							<div className="mt-8 w-1/2">
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
									is an open-source UI library for interacting with our protocol. It is designed to both demonstrate
									what can be built with Irys and also kickstart new projects.
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
