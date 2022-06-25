import '../index.css';

import React, { useState } from 'react';
import Logo from '../assets/images/logo-sun.png';
import {FaBars, FaTimes} from 'react-icons/fa';
import { Link } from 'react-scroll';


/**
 * @returns Top navigation bar
 */
const Navbar = () => {
    const [nav, setNav] = useState(false);
    const handleClick = () => setNav(!nav);

    return (
        <div className='fixed w-full h-[80px] flex justify-between items-center px-4 bg-[#f5ead9] text-[#15274c] z-10'>
            <div>
            <img src={Logo} alt="Sun" style={{width: '50px'}}/>
            </div>
            {/* desktop menu */} 
            <ul className='hidden md:flex'>
                <li>
                    <Link className='hover:bg-[#f36c3d] hover:border-[#f36c3d] border-2 px-4 py-2' to="top" smooth={true} duration={500}>
                        home
                    </Link>
                </li>
                <li>
                    <Link className='hover:bg-[#f36c3d] hover:border-[#f36c3d] border-2 px-4 py-2' to="me" smooth={true} duration={500}>
                        me
                    </Link>
                </li>
                <li>
                    <Link className='hover:bg-[#f36c3d] hover:border-[#f36c3d] border-2 px-4 py-2' to="coding" smooth={true} duration={500}>
                        coding
                    </Link>
                </li>
                <li>
                    <Link className='hover:bg-[#f36c3d] hover:border-[#f36c3d] border-2 px-4 py-2' to="tv-video" smooth={true} duration={500}>
                        tv / video
                    </Link>
                </li>
                <li>
                    <Link className='hover:bg-[#f36c3d] hover:border-[#f36c3d] border-2 px-4 py-2' to="contact" smooth={true} duration={500}>
                        contact
                    </Link>
                </li>

            </ul>
            {/* hamburger */}
            <div onClick={handleClick} className='md:hidden z-10'>
                {!nav ? <FaBars /> : <FaTimes />}
                
            </div>
            {/* mobile menu */}
            <ul className={!nav ? 'hidden' : 'absolute top-0 left-0 w-full h-screen bg-[#f5ead9] text-[#15274c] flex flex-col justify-center items-center' }>
                <li  className='py-6 text-4xl'>
                     <Link onClick={handleClick} to="top" smooth={true} duration={500}>
                        top
                    </Link>
                </li>
                <li className='py-6 text-4xl'>
                     <Link onClick={handleClick} to="me" smooth={true} duration={500}>
                        me
                    </Link>
                </li>
                <li className='py-6 text-4xl'>
                     <Link onClick={handleClick} to="coding" smooth={true} duration={500}>
                        coding
                    </Link>
                </li>
                <li className='py-6 text-4xl'>
                     <Link onClick={handleClick} to="tv-video" smooth={true} duration={500}>
                        tv / video
                    </Link>
                </li>
                <li className='py-6 text-4xl'>
                     <Link onClick={handleClick} to="contact" smooth={true} duration={500}>
                        contact
                    </Link>
                </li>
            </ul>
            {/* social */}
            <div className='hidden'></div>
        </div>
    )
}

export default Navbar