"use client";

import React from "react";
import { HiArrowNarrowRight } from "react-icons/hi";
import Image from "next/image";
import Link from "next/link";
import DynamicBouncingBalls from "../processing/DynamicBouncingBalls";

/**
 *
 * @returns The initial page shown when someone visits https://luke.gallery
 */
const Home: React.FC = () => {
	return (
		<div id="top" className="w-full h-full bg-[#15274c] text-[#f5ead9]">
			<div className="mx-auto h-screen flex flex-col justify-end z-0">
				<DynamicBouncingBalls />
				<div className="absolute top-20 right-10" style={{ width: "600px" }}>
					<Image
						src="/images/logo-sun.png"
						alt="logo"
						width={600}
						height={600}
						sizes="(max-width: 768px) 60vw, 600px"
						style={{ width: "100%", height: "auto" }}
					/>
				</div>
				<div className="absolute z-1 px-8">
					<h1 className="text-[#f36c3d] bg-[#f5ead9] text-4xl sm:text-7xl font-bold">Luke Cassady-Dorion</h1>
					<h2 className="text-2xl sm:text-5xl">I build things with art + technology</h2>

					<div>
						<Link
							scroll={false}
							className="hover:bg-[#f36c3d] hover:border-[#f36c3d] border-2 px-4 py-3 my-8 flex items-center"
							href="/contact"
						>
							contact <HiArrowNarrowRight className="ml-4" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
