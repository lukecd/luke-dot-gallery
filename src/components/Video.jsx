import React from 'react'

/**
 * Simple coponent used to render a video responsively
 * Preferred way to call is as follows
 *   <Video
 *      url=""
 *      description={<></>}
 *  />     
 *  Note that description should be passed as fragment to allow for display or URLs and other markup
 * 
 * @param {*} props (url, description)
 * @returns A responsive video tag, marked up and ready for display.
 */
const Video = (props) => {
    return (
        <div>
            <div class='aspect-w-16 aspect-h-9'>
                <iframe src={props.url} frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>
            </div>
            <p className='mt-5 leading-7'>{props.description}</p>
        </div>
    )
}

export default Video