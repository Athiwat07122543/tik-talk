'use client'
import './globals.css'
import { useEffect, useState } from 'react';
import { socket } from './socket';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsername] = useState('')
  const [log, setLog] = useState([])
  const [userOnline, setUserOnline] = useState([])

  useEffect(() => {
    if (socket.connected) {
      onConnect()
      setName()
    }

    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    function setName() {
      let enterUsername = prompt('กรุณาใส่ชื่อของคุณ')
      if (!enterUsername) {
        setUsername('Noname')
        socket.emit('enter username', 'Noname')
      } else {
        setUsername(enterUsername)
        socket.emit('enter username', enterUsername)
      }
    }

    function newMessage({ text, username }) {
      setLog((prev) => [...prev, {
        type: 'message',
        message: text,
        username,
        timeStamp: new Date()
      }])
    }

    function showUserConnected({ username }) {
      setLog((prev) => [...prev, { type: 'login', username, timeStamp: new Date() }])
    }

    function getUserOnline(data) {
      setUserOnline(data)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('chat message', newMessage)
    socket.on('enter username', showUserConnected)
    socket.on('user list', getUserOnline)

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chat message', newMessage);
      socket.iff('enter username', showUserConnected)
      socket.off('user list', getUserOnline)
    };
  }, [])

  const onSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const text = form.message.value;

    if (text) {
      socket.emit('chat message', text, username);
    }

    form.message.value = ''
    return
  }

  return (
    <div className='p-4 h-screen md:overflow-hidden'>
      <div className='border p-2 flex items-center gap-4 max-w-screen overflow-hidden h-[6vh] md:h-[6vh]'>
        <label className='flex-shrink-0'>สถานะ: {isConnected ? 'เชื่อมต่อ' : 'ตัดการเชื่อมต่อ'}</label>
        <label className='truncate'>
          ชื่อ: {username}
        </label>
      </div>
      <div className='py-2 md:flex md:justify-between gap-4 md:w-full'>
        <div className='h-[72vh] md:h-[100vh] md:w-full overflow-hidden space-y-2'>
          <div className='h-[65vh] md:h-[80vh] overflow-y-scroll p-1 space-y-2 border'>
            <p className='text-center text-xl font-bold md:text-4xl'>Chatzone</p>
            <div className='md:space-y-4 space-y-2'>
              {Array.isArray(log) && log.length >= 1 && log.map((item, index) => {
                const time = new Date(item.timeStamp).toLocaleString()
                if (item.type === 'login') {
                  return <div className='flex justify-between p-2 truncate gap-4 border rounded-md md:ml-4' key={index}>
                    <p className='md:w-full overflow-hidden'>Welcome {item.username} !</p>
                    <p className='md:mr-2'>{new Date(item.timeStamp).toLocaleTimeString('th-TH', { hour12: false })}</p>
                  </div>
                } else if (item.type === 'message') {
                  return <div key={index} className='p-2 rounded-md border md:ml-4'>
                    <div className='flex justify-between'>
                      <p className='w-[34vh] md:w-[132vh] overflow-hidden'>{item.username}</p>
                      <p className='md:mr-2'>{new Date(item.timeStamp).toLocaleTimeString('th-TH', { hour12: false })}</p>
                    </div>
                    <p className='w-full break-all md:w-full'>Say: {item.message}</p>
                  </div>
                }
              })}
            </div>
          </div>
          <form className='flex justify-between gap-2 md:h-[4vh]' onSubmit={onSubmit}>
            <input type='text' name='message' className=' w-full px-2 border' />
            <button className='border w-[18vh] md:hover:cursor-pointer'>ส่งข้อความ</button>
          </form>
        </div>
        <div className='border md:w-[60vh] p-2 space-y-2 md:h-[85vh] md:mt-0'>
          <p className='text-center text-xl font-bold md:text-4xl'>Online</p>
          {Array.isArray(userOnline) && userOnline.length >= 1 && userOnline.map((item, index) => {
            return <p key={index} className='w-full md:w-[40vh] overflow-hidden truncate'>• {item}</p>
          })}
        </div>
      </div>
    </div >
  );
}
