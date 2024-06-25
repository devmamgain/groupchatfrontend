import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const GroupCreation = () => {
    const [name, setName] = useState('');
    const token = localStorage.getItem('token');
    const [groups, setGroups] = useState([]);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [userdata, setUserData] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const navigate = useNavigate()

    const socket = useRef(null);
    const link = import.meta.env.VITE_SERVER

    useEffect(() => {
        socket.current = io(link, {
            query: { token }
        });

        socket.current.on('message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        socket.current.on('getgroups', (groups) => {
            setGroups(groups);
        });

        socket.current.on('groupCreated', (group) => {
            setGroups((prevGroups) => [...prevGroups, group]);
        });

        socket.current.on('groupUpdated', (updatedGroup) => {
            setGroups((prevGroups) => prevGroups.map(group => group._id === updatedGroup._id ? updatedGroup : group));
        });

        socket.current.on('groupMembers', (members) => {
            setGroupMembers(members);
        });

        socket.current.on('userStatus', ({ userId, online }) => {
            setGroupMembers(prevMembers => prevMembers.map(member => 
                member._id === userId ? { ...member, online } : member
            ));
        });

        return () => {
            socket.current.disconnect();
        };
    }, [token]);
    const handleCreateGroup = async () => {
        try {
            await axios.post(link + '/api/groups', { name }, {
                headers: { Authorization: `Bearer ${token}` }
            });
          
        } catch (error) {
            console.error('Group creation failed', error);
        }
    };

    useEffect(() => {
        const fetchGroups = async () => {
            const response = await axios.get(link + '/api/getgroups', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(response.data);
        };
        fetchGroups();

        const fetchUserData = async () => {
            try {
                const response = await axios.get(link+"/api/userinfo", {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                });
                const allUserData = response.data;
                setUserData(allUserData)
            } catch (error) {
                console.error('Error fetching user data:', error);
                setUserData(null)
            }
        };

        if (token) {
            fetchUserData();
        } else {
            console.error('No token found');
            setUserData(null)
        }
    }, [token]);

    const joinGroup = async (groupId) => {
        try {
            await axios.post(`${link}/api/groups/${groupId}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentGroup(groupId);
            socket.current.emit('joinGroup', groupId);
            const response = await axios.get(`${link}/api/groups/${groupId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
            socket.current.emit('getGroupMembers', groupId);
        } catch (error) {
            console.error('Joining group failed', error);
        }
    };

    const sendMessage = async () => {
        if (message.trim()) {
            socket.current.emit('message', { groupId: currentGroup, message });
            setMessage('');
        }
    };

    const openChat = async (groupId) => {
        setCurrentGroup(groupId);
        socket.current.emit('joinGroup', groupId);
        const response = await axios.get(`${link}/api/groups/${groupId}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data);
        socket.current.emit('getGroupMembers', groupId);
    };

    const leaveGroup = async (groupId) => {
        try {
            await axios.post(`${link}/api/groups/${groupId}/leave`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentGroup(null);
            setGroupMembers([]);
        } catch (error) {
            console.error('Leaving group failed', error);
        }
    };
    const logout = (e)=>{
        e.preventDefault()
    
        localStorage.removeItem("token")
   
        navigate("/")
      }
  return (
    <div className='flex divide-x-2 min-h-screen '>
        <div className='flex flex-col p-2 w-[30%] items-center mt-32'>
        <button onClick={logout} className=' rounded-xl bg-red-500 p-2  text-white absolute top-5 left-5'>Logout</button>

            <h1 className='font-bold text-xl'>Create Group or Join from Below</h1>
            <div className='flex mt-5 gap-3'>
      <input
        type="text"
        placeholder="Group Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleCreateGroup} className=' rounded-xl bg-blue-500 p-2  text-white'>Create Group</button>
      </div>
      <h1 className='font-semibold text-xl mt-5'>Groups</h1>
     

        {groups.map(group => (
          <div key={group._id} className='flex gap-5 mt-2'>
            <h1 className='mt-1'>{group.name}</h1>
            {group.members.includes(userdata._id) ?
              <div className='flex gap-5'>
                <button onClick={() => openChat(group._id)} className=' rounded-xl bg-green-600 p-2  text-white'>Open Chat</button>
                <button onClick={() => leaveGroup(group._id)} className=' rounded-xl bg-red-500 p-2  text-white'>Leave Group</button>
              </div>
              : <button onClick={() => joinGroup(group._id)} className=' rounded-xl bg-yellow-500 p-2  text-white'>Join</button>}
          </div>
        ))}
      </div>

      <div className='w-[60%]  '>
      {currentGroup && (
        <div className='flex divide-x-2 min-h-screen '>
            <div className='flex flex-col flex-grow p-5'>
          <h2 className='font-bold text-2xl mb-5'>Group Chat</h2>
       
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.sender}</strong>: {msg.content}
              </div>
            ))}
        
          <div className='flex flex-grow absolute bottom-0 w-[500px]'>
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='flex flex-grow focus:outline-none'
          />
          <button onClick={sendMessage} className='rounded-xl bg-blue-500 p-2  text-white'>Send</button>
          </div>
       </div>
          <div className='p-5'>
          <h3 className='text-lg font-semibold'>Members</h3>
          <div className='mt-2'>
            {groupMembers.map(member => (
              <div key={member._id}>
                {member._id} {member.online ? '(Online)' : '(Offline)'}
              </div>
            ))}
          </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default GroupCreation;
