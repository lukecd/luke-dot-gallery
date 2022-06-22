import React from 'react'
import AdamsExchange from '../assets/images/42.png';

const Coding = () => {
  return (
    <div name='coding' className='w-full h-screen bg-[#15274c] text-[#f5ead9] overflow-visible mt-10'>
        <div className='flex flex-col justify-center items-center w-full h-full'>
            <div className='max-w-[1000px] w-full grid grid-cols-1 gap-8'>
                <div className='text-left pb-8 pl-4'>
                    <p className='text-4xl font-bold inline border-b-4 border-[#f36c3d]'>software development ...</p>
                </div>
                <div>
                </div>
            </div>

            <div className='max-w-[1000px] w-full grid sm:grid-cols-2 px-5 sm:px-0 gap-8'>
                <div className=''>
                    <img src={AdamsExchange} alt="Adams Exchange" />
                    <p className='mt-5 leading-7'>
                        <a href="https://adams.exchange" target="_blank" className="underline">Adams Exchange</a> is a full-stack web3 app I built using Solidity, React, JavaScript and Rainbowkit.
                        I first created ADAMS Coin as an ERC20 token with tokenomics that would appeal to gamlers. Each transfer is 
                        taxed 42% and then that tax is randomally given to a holder. 
                    </p>
                    <p className='mt-5 leading-7'>
                        Running on the Gerli testnet, it allows anyone to claim 4200 free tokens, to swap them, to earn tax rewards and to stake them.
                    </p>
                    
                </div>
                <div>
                </div>
            </div>

            <div className='mt-10 max-w-[1000px] w-full grid sm:grid-cols-2 gap-8'>
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