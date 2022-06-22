import React from 'react'

const Contact = () => {
  return (
    <div name='contact' className='w-full h-screen bg-[#15274c] text-[#f5ead9] flex justify-center items-center p-4'>
        <form action='https://getform.io/f/19f5b563-72f2-49a9-a5a0-faa9d50c4b5e' method='post' className='flex flex-col max-w-[600px] w-full'>
            <div className='pb-8'>
               <p className='text-4xl font-bold inline border-b-4 border-[#f36c3d]'>contact ...</p>
               <p className='py-4'>Working on something fun? use the form, or email me Luke AT SPstories.com.</p>
               <p className='py-4'>
                <a className="underline" href="https://www.linkedin.com/in/lukecd/" target="_blank">LinkedIn</a> | 
                <a className="underline" href="https://twitter.com/spaceagente" target="_blank">Twitter</a> | 
                <a className="underline" href="https://www.instagram.com/lukecd/" target="_blank">Instagram</a> | 
                <a className="underline" href="https://github.com/lukecd" target="_blank">GitHub</a>
               </p>
            </div>
            <input className='p-2 text-black' type="text" placeholder='name' name='name' />
            <input className='my-4 p-2 text-black' type="email" placeholder='email' name='email' />
            <textarea className='p-2 text-black' name='message' rows='10' placeholder='message'></textarea>
            <button className='hover:bg-[#f36c3d] hover:border-[#f36c3d] border-2 px-4 py-3 my-8 mx-auto flex items-center'>let's collaborate</button>
        </form>
    </div>
  )
}

export default Contact