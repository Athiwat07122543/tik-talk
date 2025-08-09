'use client'
import './globals.css'
import { useEffect, useState } from 'react';
import { socket } from './socket';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsername] = useState('')
  const [log, setLog] = useState([])
  const [userOnline, setUserOnline] = useState([])
  const [enterUsername, setEnterUsername] = useState(true)

  useEffect(() => {
    if (socket.connected) {
      onConnect()
    }

    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
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

    function userDisconnect(username) {
      setLog((prev) => [...prev, {
        type: 'disconnected',
        username,
        timeStamp: new Date()
      }])
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('chat message', newMessage)
    socket.on('enter username', showUserConnected)
    socket.on('user list', getUserOnline)
    socket.on('disconnected', userDisconnect)

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chat message', newMessage);
      socket.off('enter username', showUserConnected)
      socket.off('user list', getUserOnline)
      socket.off('disconnect', userDisconnect)
    };
  }, [])

  const onSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const text = form.message.value;
    if (text) {
      socket.emit('chat message', text, username);
      form.message.value = ''
    }
  }

  const onSubmitUsername = (username) => {
    username.preventDefault()
    const form = username.target
    const name = form.inputUsername.value
    if (!name) {
      setUsername('User')
      setEnterUsername(false)
      socket.emit('enter username', 'User')
    } else {
      setUsername(name)
      setEnterUsername(false)
      socket.emit('enter username', name)
    }
  }

  return (
    <div className='p-4 h-screen md:overflow-hidden bg-sky-100 relative' >
      {enterUsername && <div className='absolute inset-0 flex items-center justify-center backdrop-blur-xs'>
        <form className='bg-sky-200 shadow-2xl p-4 rounded-xl space-y-2 space-x-4' onSubmit={onSubmitUsername}>
          <p>ใส่ชื่อของคุณ</p>
          <input className='border rounded-xl border-gray-600 bg-white p-2' name='inputUsername' />
          <button className='p-2 rounded-xl  bg-sky-300 hover:cursor-pointer'>บันทึก</button>
        </form>
      </div>}
      <div className='border p-2 flex items-center gap-4 max-w-screen overflow-hidden h-[6vh] md:h-[6vh] rounded-xl bg-white border-gray-300'>
        <label className='flex-shrink-0'>สถานะ: {isConnected ? 'เชื่อมต่อ' : 'ตัดการเชื่อมต่อ'}</label>
        <label className='truncate'>
          ชื่อ: {username}
        </label>
      </div>
      <div className='py-2 md:flex md:justify-between gap-4 md:w-full'>
        <div className='h-[72vh] md:h-[100vh] md:w-full overflow-hidden space-y-2 rounded-xl'>
          <div className='h-[65vh] md:h-[80vh] overflow-y-auto p-1 space-y-2 border bg-white border-gray-300'>
            <div className='md:space-y-4 space-y-2 mt-2'>
              {Array.isArray(log) && log.length >= 1 && log.map((item, index) => {
                const time = new Date(item.timeStamp).toLocaleString()
                if (item.type === 'login') {
                  return <div className='flex justify-between p-2 truncate gap-4 border rounded-md md:ml-4 bg-green-600 border-gray-100' key={index}>
                    <p className='md:w-full overflow-hidden text-white'>ยินดีต้อนรับ {item.username} !</p>
                    <p className='md:mr-2 text-white'>{new Date(item.timeStamp).toLocaleTimeString('th-TH', { hour12: false })}</p>
                  </div>
                } else if (item.type === 'message') {
                  return <div key={index} className='p-2 rounded-md border md:ml-4 text-white bg-sky-400 border-gray-100'>
                    <div className='flex justify-between'>
                      <p className='w-[34vh] md:w-[132vh] overflow-hidden'>{item.username}</p>
                      <p className='md:mr-2'>{new Date(item.timeStamp).toLocaleTimeString('th-TH', { hour12: false })}</p>
                    </div>
                    <p className='w-full break-all md:w-full'>: {item.message}</p>
                  </div>
                } else if (item.type === 'disconnected') {
                  return <div className='flex justify-between p-2 truncate gap-4 border rounded-md md:ml-4 bg-red-600 border-gray-100' key={index}>
                    <p className='md:w-full overflow-hidden text-white'>Good bye {item.username} !</p>
                    <p className='md:mr-2 text-white'>{new Date(item.timeStamp).toLocaleTimeString('th-TH', { hour12: false })}</p>
                  </div>
                }
              })}
            </div>
          </div>
          <form className='flex justify-between gap-2 md:h-[4vh]' onSubmit={onSubmit}>
            <input type='text' name='message' className=' w-full px-4 py-1 border  rounded-xl bg-white border-gray-300' />
            <button className='border w-[18vh] md:hover:cursor-pointer  rounded-xl bg-white border-gray-300 md:hover:bg-gray-200'>ส่งข้อความ</button>
          </form>
        </div>
        <div className='border md:w-[60vh] p-2 space-y-2 md:h-[85vh] md:mt-0 rounded-xl bg-white border-gray-300'>
          <p className='text-center text-xl font-bold md:text-2xl'>ผู้ใช้งาน</p>
          {Array.isArray(userOnline) && userOnline.length >= 1 && userOnline.map((item, index) => {
            return <p key={index} className='w-full md:w-[40vh] overflow-hidden truncate md:text-xl'>• {item}</p>
          })}
        </div>
      </div>
    </div >
  );
}
