import { useEffect, useState } from 'react'
import './App.css'
import io from 'socket.io-client'
import Send from './assets/send.svg'

//const socket = io('http://localhost:4000')
const socket = io()

function App() {
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState([])
  const [personTyping, setPersonTyping] = useState([])
  

  const handleChange = (e) => {
    const text = e.target.value
    setMessage(text)
    if(text !== ''){
      socket.emit('istyping', true)
    } else{
      socket.emit('istyping', false)
    }
  }

  const handleSend = (e)=> {
    e.preventDefault()
    if(message.length > 0){
      const date = new Date()
      const date1 = date.toUTCString()
      socket.emit('send:message',message)
      socket.emit('istyping', false)
      setConversation(prev=>[...prev, { user:'Me', message, date1}])
      setMessage('')
    }
  }

  const addToConversation = (data) => {
    setConversation(prev=>[...prev, data])
  }

  const addPersonTyping = (data) => {
    setPersonTyping(prev=>{
      if (!prev.includes(data)){
        return [...prev, data]
      }
      return [...prev]
    })
  }

  const removePersonTyping = (socketExt) => {
    setPersonTyping(prev=> prev.filter(socketD => socketD !== socketExt))
  }


  useEffect(() => {
    socket.on('receive:message', addToConversation)
    socket.on('ext:typing', addPersonTyping)
    socket.on('ext:notTyping', removePersonTyping)

    return () => {
      socket.off('receive:message', addToConversation)
      socket.off('ext:typing', addPersonTyping)
      socket.off('ext:notTyping', removePersonTyping)
    }
  },[])

  return (
    <div className='bg-zinc-700 h-[100dvh] w-screen text-white '>
      
      <section className={`fixed top-0 w-full px-2 py-4 bg-slate-300 transition-all ease-in-out duration-200 ${personTyping.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
        <p className='text-zinc-800 italic'>{personTyping.join(', ')} are typing</p>
      </section>
     
      <section id='chatapp' className='h-full w-full p-4 '>
        
        <section id='messages' className='h-[93%] flex flex-col justify-end '>
          <div className='overflow-y-auto'>
            {conversation.map((msj, index)=>(
              <section 
                key={index} 
                className={`mb-2 py-1 px-4 rounded-xl table ${msj.user==='Me' ? 'bg-sky-800 ml-auto' : 'bg-sky-950 mr-auto'}`}
              >
                <p className='text-xs opacity-60'>
                  {msj.user}
                </p>
                <p>
                  {msj.message}
                </p>
                <p className='text-[0.6rem] opacity-60'>
                  {msj.date1}
                </p>
              </section>
            ))}
          </div>
        </section>
        <section id='input'>
          <form onSubmit={handleSend} className='flex gap-3 h-[7%] items-center'>
            <input onChange={handleChange}
              type="text" 
              className='bg-zinc-600 border-none h-8 flex-1'
              value={message}
            />
            <button className='rounded-full bg-white p-2 max-h-9'><img src={Send} alt="send icon" /></button>
          </form>
        </section>
      </section>
    </div>
  )
}

export default App
