import React from "react";
import { HiArrowNarrowRight } from "react-icons/hi";
import Logo from "../assets/images/logo-sun.png";
import BouncingBalls from "../processing/BouncingBalls";
import { Link } from "react-scroll";

/**
 *
 * @returns The initial page shown when someone visits https://luke.gallery
 */
const Home = () => {
	return (
		<div name="top" className="w-full h-screen bg-[#15274c] text-[#f5ead9]">
			<div className="mx-auto  flex flex-col justify-end h-full z-0">
				<BouncingBalls />
				<img
					className="absolute top-20 right-10"
					style={{ width: "600px" }}
					src={Logo}
					alt="logo"
				/>
				<div className="absolute z-1 px-8">
					<h1 className="text-[#f36c3d] bg-[#f5ead9] text-4xl sm:text-7xl font-bold">
						Luke Cassady-Dorion
					</h1>
					<h2 className="text-2xl sm:text-5xl">I build things with art + technology</h2>

					<div>
						<Link
							className="hover:bg-[#f36c3d] hover:border-[#f36c3d] border-2 px-4 py-3 my-8 flex items-center"
							to="contact"
							smooth={true}
							duration={500}
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
