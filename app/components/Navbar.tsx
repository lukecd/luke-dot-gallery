"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar: React.FC = () => {
	const [nav, setNav] = useState(false);
	const handleClick = () => setNav(!nav);

	const handleScroll = (href: string) => {
		if (typeof window !== "undefined") {
			if (href === "/") {
				window.scrollTo({ top: 0, behavior: "smooth" });
			} else {
				const element = document.querySelector(href);
				if (element) {
					const offset = window.scrollY + element.getBoundingClientRect().top - 80; // Adjust the 80 to match your navbar height
					window.scrollTo({ top: offset, behavior: "smooth" });
				}
			}
			setNav(false); // Close the mobile menu after clicking a link
		}
	};

	const links = [
		{ href: "/", label: "Home" },
		{ href: "#me", label: "Me" },
		{ href: "#devrel", label: "DevRel" },
		{ href: "#music", label: "Electronic Music" },
		{ href: "#tv-video", label: "TV / Video" },
		{ href: "#contact", label: "Contact" },
	];

	return (
		<div className="fixed w-full h-[80px] flex justify-between items-center px-4 bg-[#f5ead9] text-[#15274c] z-10">
			<div>
				<Image src="/images/logo-sun.png" alt="Sun" width={48} height={48} />
			</div>
			{/* Desktop Menu */}
			<ul className="hidden md:flex">
				{links.map(({ href, label }) => (
					<li key={href}>
						<a
							href={href}
							onClick={(e) => {
								e.preventDefault();
								handleScroll(href);
							}}
							className="hover:bg-[#f36c3d] hover:border-[#f36c3d] border-2 px-4 py-2 mx-2 capitalize transition-colors duration-300 cursor-pointer"
						>
							{label}
						</a>
					</li>
				))}
			</ul>
			{/* Hamburger */}
			<div onClick={handleClick} className="md:hidden z-10 cursor-pointer" aria-label="Toggle menu">
				{!nav ? <FaBars /> : <FaTimes />}
			</div>
			{/* Mobile Menu */}
			<ul
				className={`absolute top-0 left-0 w-full h-screen bg-[#f5ead9] text-[#15274c] flex flex-col justify-center items-center transition-transform duration-300 ${
					nav ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{links.map(({ href, label }) => (
					<li key={href} className="py-6 text-4xl">
						<a
							href={href}
							onClick={(e) => {
								e.preventDefault();
								handleScroll(href);
							}}
							className="cursor-pointer"
						>
							{label}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Navbar;
