import React, { useEffect, useState, useRef } from "react";
import { database } from "../../db/firebaseConfig";
import { collection, doc, onSnapshot, orderBy, query, getDoc, addDoc, serverTimestamp, limit } from "firebase/firestore";
import "../../style/ChatPage.css";

function ChatPage(props) {
    const [rooms, setRooms] = useState([]);
    const [datas, setDatas] = useState([]);
    const [selectedRoomID, setSelectedRoomID] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const bottomRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(database, "UserInfo", props.userID), 
            (snapshot) => {
                const data = snapshot.data();
                if (data && data.rooms) {
                    setRooms(data.rooms);
                } else {
                    setRooms([]);
                }
                if (data && data.friends) {
                    setFriends(data.friends);
                }
            }
        );
        return () => unsubscribe();
    }, [props.userID]);

    async function getRoomInfo(rooms) {
        const datas = await Promise.all(rooms.map(async (room) => {
            const content = await getDoc(doc(database, "ChatRooms", room));
            const get = content.data();
            return {
                title: get.title,
                id: room,
                createdBy: get.createdBy,
                members: get.members,
            };
        }));
        setDatas(datas);
    }

    useEffect(() => {
        if (rooms.length > 0) {
            getRoomInfo(rooms);
        }
    }, [rooms]);

    function fetchMessages(roomID) {
        const docRef = doc(database, "ChatRooms", roomID);
        const messagesRef = collection(docRef, "history");

        const q = query(messagesRef, orderBy("time", "asc"), limit(100)); // 오래된 메시지 순으로 정렬

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMessages(messages.reverse());
        });

        return unsubscribe;
    }

    function handleChatRoom(e) {
        const roomID = e.target.value;
        setSelectedRoomID(roomID);

        if (selectedRoomID) {
            fetchMessages(selectedRoomID)();
        }

        const unsubscribe = fetchMessages(roomID);
        
        return () => unsubscribe();
    }

    async function handleSendMessage() {
        if (!newMessage.trim()) return;
        
        const docRef = doc(database, "ChatRooms", selectedRoomID);
        const messagesRef = collection(docRef, "history");

        await addDoc(messagesRef, {
            userID: props.userID,
            content: newMessage,
            time: serverTimestamp(),
        });

        setNewMessage("");
    }

    function handleKeyPress(e) {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    }

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

    const togglePopup = () => {
        setShowPopup(!showPopup);
        setSelectedFriends([]);
        setRoomName("");
    }

    function handleFriendSelect(friendID) {
        setSelectedFriends((prev) => 
          prev.includes(friendID) ? prev.filter((id) => id !== friendID) : [...prev, friendID]);
    }

    async function createRoom() {
        if (!roomName.trim()) {
            alert("Please enter a room name.");
            return;
        }
    
        const newRoomRef = await addDoc(collection(database, "ChatRooms"), {
          createdBy: props.userID,
          members: [props.userID, ...selectedFriends],
          title: roomName,
          time: serverTimestamp(),
        });
    
        setRooms([...rooms, newRoomRef.id]);
        togglePopup();
    }

    return (
        <div className="chat-wrapper">
            <div className="rooms-view">
                {datas.map((data) => (
                    <div key={data.id}>
                        <button value={data.id} onClick={handleChatRoom}>
                            {data.title}
                        </button>
                    </div>
                ))}
                <div className="create-room">
                    <button onClick={togglePopup}>+</button>
                </div>
            </div>
            <div className="chats-view">
                <div className="chat-output">
                    {selectedRoomID ? (
                        <ul>
                            {messages.map((message) => (
                                <li
                                    key={message.id}
                                    className={message.userID === props.userID ? "sent" : "received"}
                                >
                                    <p><strong>{message.userID}:</strong> {message.content}</p>
                                    <small>
                                        {message.time
                                            ? new Date(message.time.seconds * 1000).toLocaleString()
                                            : "Sending..."}
                                    </small>
                                </li>
                            ))}
                            <div ref={bottomRef}></div>
                        </ul>
                    ) : (
                        <div className="placeholder">Select a chat room to view messages.</div>
                    )}
                </div>
                {selectedRoomID && (
                    <div className="chat-input">
                        <input 
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Message"
                        />
                        <button className="chat-enter" onClick={handleSendMessage}>Enter</button>
                    </div>
                )}
            </div>

            {showPopup && (
                <div className="popup">
                    <h3>Create Chat Room</h3>
                    <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Enter room name"
                        className="room-name-input"
                    />
                    <div className="friend-list-container">
                        <ul>
                            {friends.map((friend) => (
                                <li key={friend}>
                                    <span>{friend}</span>
                                    <input
                                        type="checkbox"
                                        checked={selectedFriends.includes(friend)}
                                        onChange={() => handleFriendSelect(friend)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="button-container">
                        <button onClick={createRoom}>Create Room</button>
                        <button className="close-popup" onClick={togglePopup}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatPage;