"use client";

import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

const About: FC = () => {
	return (
		<div id="me" className="contentContainer min-h-screen mt-[100px]">
			<div className="flex flex-col justify-center items-center w-full h-full">
				<div className="flex flex-col w-full justify-center items-center">
					<div className="md:w-5/6 text-start">
						<p className="text-xl md:text-4xl font-bold inline border-[#f36c3d] border-b-4">me ...</p>
					</div>
					<div className="flex flex-col md:flex-row md:pl-10 w-full md:w-5/6 px-2">
						<div className="w-full md:px-5">
							<p className="text-2xl md:text-4xl my-5 md:px-4">
								I work in Developer Relations & I love making docs.
							</p>
							<p className="my-5 leading-7">
								I&apos;ve worked as a software engineer, I&apos;ve been a CTO, a TV producer, a documentary director, a
								YouTuber. I&apos;ve{" "}
								<a
									className="underline"
									href="https://www.amazon.com/s?k=luke+cassady-dorion&i=stripbooks&crid=287ICLAT11TVR&sprefix=luke+casssady-dorion%2Cstripbooks%2C284&ref=nb_sb_noss"
									rel="noreferrer"
									target="_blank"
								>
									written and contributed
								</a>{" "}
								to multiple books on software development. I&apos;ve taught yoga and I&apos;ve taught Pilates. I have
								half a BS in Computer Science and a BA in Thai Language Studies. <br /> <br />I am the only Westerner
								ever to graduate from{" "}
								<a href="https://www.ru.ac.th/th/" target="_blank" className="underline">
									Ramkhamhaeng University&apos;s
								</a>{" "}
								rigorous Thai Language studies program. I am fluent in English, Thai, and speak B1 level Spanish.
							</p>
						</div>
						<div className="w-full">
							<p className="my-5 leading-7">
								I started coding when I was 10, learned by typing in code from the back of computer magazines in the
								late 80s.
							</p>
							<p className="my-5 leading-7">
								In the Web1 era, I wrote Java applets and server-side processes. In the Web2 era, I helped found a{" "}
								<a className="underline" href="https://youtube.com/picnicly" target="_blank">
									YouTube channel
								</a>{" "}
								dedicated to telling positive, uplifting stories.
							</p>
							<p className="text-2xl md:text-4xl my-5 ">
								And now I obsess over how to inspire devs and make their lives easier.
							</p>
							<p className="my-5">
								There&apos;s lots more info in{" "}
								<Link
									className="underline"
									href="/resume/Luke-Cassady-Dorion-Resume.pdf"
									target="_blank"
									rel="noreferrer"
								>
									my resume,
								</Link>{" "}
								and my{" "}
								<a className="underline" href="https://github.com/lukecd" target="_blank" rel="noreferrer">
									GitHub
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default About;
