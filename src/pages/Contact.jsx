import React from 'react';
import Social from '../components/Social';

const Contact = () => {
  return (
    <div name='contact' className='mt-20 md:mt-0 w-full h-screen bg-[#15274c] text-[#f5ead9] flex justify-center items-center p-4'>
        <form action='https://getform.io/f/19f5b563-72f2-49a9-a5a0-faa9d50c4b5e' method='post' className='flex flex-col max-w-[600px] w-full'>
            <div className='pb-8'>
               <p className='text-4xl font-bold inline border-b-4 border-[#f36c3d]'>contact ...</p>
               <p className='py-4'>Working on something fun? Use the form, or email me Luke AT SPstories.com.</p>
               <p className='py-4'>
                <Social />
               </p>
            </div>
            <input className='p-2 text-black' type="text" placeholder='name' name='name' required/>
            <input className='my-4 p-2 text-black' type="email" placeholder='email' name='email' required/>
            <textarea className='p-2 text-black' name='message' rows='10' placeholder='message' required></textarea>
            <button className='hover:bg-[#f36c3d] hover:border-[#f36c3d] border-2 px-4 py-3 my-8 mx-auto flex items-center'>let's collaborate</button>
        </form>
    </div>
  )
}

export default Contact