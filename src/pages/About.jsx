import React from "react";

/**
 *
 * @returns An About page telling what I've been up to these past 20 years
 */
const About = () => {
	return (
		<div name="me" className="contentContainer">
			<div className="flex flex-col justify-center items-center w-full h-full">
				<div className="max-w-[1000px] w-full grid grid-cols-2 gap-8">
					<div className="text-left pb-8 pl-4">
						<p className="text-4xl font-bold inline border-b-4 border-[#f36c3d]">me ...</p>
					</div>
					<div></div>
				</div>

				<div className="contentBody">
					<div>
						<p className="text-4xl my-5 px-4">
							I'm currently focused on building with web3 technologies.
						</p>
						<p className="my-5 px-2 leading-7">
							I've worked as a software engineer, I've been a CTO, a TV producer, a
							documentary director, a YouTuber. I've{" "}
							<a
								className="underline"
								href="https://www.amazon.com/s?k=luke+cassady-dorion&i=stripbooks&crid=287ICLAT11TVR&sprefix=luke+casssady-dorion%2Cstripbooks%2C284&ref=nb_sb_noss"
								rel="noreferrer"
								target="_blank"
							>
								written and contributed
							</a>{" "}
							to multiple books on software development. I've taught yoga and I've taught
							Pilates. I have half a BS in Computer Science and a BA in Thai Language Studies.
						</p>
					</div>
					<div>
						<p className="my-5 px-2 leading-7">
							I started coding when I was 10, learned by typing in code from the back of
							computer magazines in the late 80s.
						</p>
						<p className="my-5 px-2 leading-7">
							In the web1 era, I wrote Java applets and server-side processes. In the web2
							era, I helped found a{" "}
							<a className="underline" href="https://youtube.com/picnicly" target="_blank">
								YouTube channel
							</a>{" "}
							dedicated to telling positive, uplifting stories.
						</p>
						<p className="text-4xl my-5 px-4">
							And now I'm building using Solidity, JavaScript and React.
						</p>
						<p className="text-2xl my-5 px-4">
							<a
								className="underline"
								href="/resume/Luke-Cassady-Dorion-Resume-Builder.pdf"
								target="_blank"
								rel="noreferrer"
							>
								Lots more info in my resume.
							</a>
						</p>
					</div>
				</div>
				<div className="contentBody">
					<div></div>
					<div></div>
				</div>
			</div>
		</div>
	);
};

export default About;
