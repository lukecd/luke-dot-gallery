"use client";

import React from "react";
import Link from "next/link";

/**
 *
 * @returns A styled list of my social media profiles
 */
const Social: React.FC = () => {
	return (
		<div>
			<Link className="underline" href="/resume/Luke-Cassady-Dorion-Resume.pdf" target="_blank" rel="noreferrer">
				Resume
			</Link>
			{" | "}
			<a className="underline" href="https://goto-grok.hashnode.dev/" target="_blank" rel="noreferrer">
				Blog
			</a>
			{" | "}
			<a className="underline" href="https://www.linkedin.com/in/lukecd/" target="_blank" rel="noreferrer">
				LinkedIn
			</a>
			{" | "}
			<a className="underline" href="https://twitter.com/spaceagente" target="_blank" rel="noreferrer">
				Twitter
			</a>
			{" | "}
			<a className="underline" href="https://www.instagram.com/lukecd/" target="_blank" rel="noreferrer">
				Instagram
			</a>
			{" | "}
			<a className="underline" href="https://github.com/lukecd" target="_blank" rel="noreferrer">
				GitHub
			</a>
			{" | "}
			<a className="underline" href="https://goto-grok.hashnode.dev/" target="_blank" rel="noreferrer">
				Blog
			</a>
		</div>
	);
};

export default Social;
