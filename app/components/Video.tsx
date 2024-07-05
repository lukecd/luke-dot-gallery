import React, { FC, ReactNode } from "react";

interface VideoProps {
	url: string;
	description: ReactNode;
}

/**
 * Simple component used to render a video responsively
 * Preferred way to call is as follows
 *   <Video
 *      url=""
 *      description={<></>}
 *  />
 *  Note that description should be passed as fragment to allow for display or URLs and other markup
 *
 * @param {VideoProps} props (url, description)
 * @returns A responsive video tag, marked up and ready for display.
 */
const Video: FC<VideoProps> = ({ url, description }) => {
	return (
		<div>
			<div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
				<iframe
					src={url}
					className="absolute top-0 left-0 w-full h-full"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				></iframe>
			</div>
			<p className="mt-5 leading-7">{description}</p>
		</div>
	);
};

export default Video;
