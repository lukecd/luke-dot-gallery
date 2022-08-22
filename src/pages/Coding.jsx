import React from 'react'
import AdamsExchange from '../assets/images/42.png';
import InterdimensionalOne from '../assets/images/id-one.png';

/**
 * 
 * @returns A styled grid highlighting recent coding projects
 */
const Coding = () => {
  return (
    <div name='coding' className='contentContainer'>
        <div className='flex flex-col justify-center items-center w-full h-full'>
            <div className='max-w-[1000px] w-full grid grid-cols-1 gap-8'>
                <div className='text-left pb-8 pl-4'>
                    <p className='text-4xl font-bold inline border-b-4 border-[#f36c3d]'>coding ...</p>
                    <p className='text-2xl my-5 px-4'>
                        I've felt at home writing software since I first got my hands on an Apple IIc in 1994. I took a break, but now I'm back at it again. Here's what I've been building.
                        All code is opensource and on <a className="underline" href="https://github.com/lukecd" target="_blank" rel="noreferrer">GitHub</a>
                    </p>
                </div>
                <div>
                </div>
            </div>

            <div className='contentBody'>
                <div className=''>
                    <img src={AdamsExchange} alt="Adams Exchange" />
                    <p className='mt-5 leading-7'>
                        <a href="https://adams.exchange" target="_blank" className="underline">Adams Exchange</a> is a full-stack web3 dApp I built using Solidity, React, JavaScript and Rainbowkit.
                        I first created ADAMS Coin as an ERC20 token with tokenomics that would appeal to people who like games of chance. Each transfer is 
                        taxed 42% and then that tax is randomally given to a holder. 
                    </p>
                    <p className='mt-5 leading-7'>
                        Running on the Goerli testnet, it allows anyone to claim 4200 free tokens, to swap them, to earn tax rewards and to stake them.
                    </p>
                </div>
                <div className=''>
                    <img src={InterdimensionalOne} alt="Interdimensional One" />
                    <p className='mt-5 leading-7'>
                        <a href="https://interdimensional.one" target="_blank" className="underline">Interdimensional One</a> is a generative art and music experience that feeds off NFTs. It's portal from your monkey mind to a place of stillness. It's the first ever NFT marketplace for sound designers. It's a place you go to relax, you can watch the visuals or interact with them.  
                    </p>
                    <p className='mt-5 leading-7'>
                        Currently running on the Mumbai testnet as an MVP, anyone can mint NFTs and create a generative soundtrack perfect for relaxing. 
                    </p>
                </div>
                <div>
                </div>
            </div>

            <div className='contentBody'>
                <div>
                </div>
                <div>
                </div>
            </div>
    </div>
    </div>
  )
}

export default Coding