import React, { useEffect, useState } from "react";
import { doc, onSnapshot, getDoc, collection, updateDoc } from "firebase/firestore";
import { database } from "../../db/firebaseConfig";
import "../../style/MyPage.css";


function MyPage(props) {
    const userID = props.userID;
    const [friendNum, setFriendNum] = useState(0);
    const [chatNum, setChatNum] = useState(0);
    const [friends, setFriends] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showFriendPopup, setShowFriendPopup] = useState(false);
    const [showChatPopup, setShowChatPopup] = useState(false);
    const [allAccounts, setAllAccounts] = useState([]);
    const [allRooms, setAllRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showRemoveFriendPopup, setShowRemoveFriendPopup] = useState(false);
    const [showLeaveChatPopup, setShowLeaveChatPopup] = useState(false);

    useEffect(() => {
        // Fetch user data (friends and rooms)
        const unsubscribe = onSnapshot(doc(database, "UserInfo", userID), (snapshot) => {
            const data = snapshot.data();
            if (data) {
                setFriends(data.friends || []);
                setRooms(data.rooms || []);
                setFriendNum(data.friends?.length || 0);
                setChatNum(data.rooms?.length || 0);
            }
        });

        return () => unsubscribe();
    }, [userID]);

    // 실시간으로 모든 계정 가져오기
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(database, "UserInfo"), (snapshot) => {
            const accounts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAllAccounts(accounts);
        });

        return () => unsubscribe();
    }, []);

    // 실시간으로 모든 채팅방 가져오기
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(database, "ChatRooms"), (snapshot) => {
            const rooms = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAllRooms(rooms);
        });

        return () => unsubscribe();
    }, []);

    const toggleFriendPopup = () => {
        setShowFriendPopup(!showFriendPopup);
        setSearchQuery("");
    };

    const toggleChatPopup = () => {
        setShowChatPopup(!showChatPopup);
        setSearchQuery("");
    };

    const toggleRemoveFriendPopup = () => {
        setShowRemoveFriendPopup(!showRemoveFriendPopup);
    };
    
    const toggleLeaveChatPopup = () => {
        setShowLeaveChatPopup(!showLeaveChatPopup);
    };
    

    const addFriend = async (friendID) => {
        try {
            const userRef = doc(database, "UserInfo", userID);
            const friendRef = doc(database, "UserInfo", friendID);
    
            // 나의 친구 목록 업데이트
            await updateDoc(userRef, {
                friends: [...friends, friendID],
            });
    
            // 상대방 친구 목록 업데이트
            const friendSnapshot = await getDoc(friendRef);
            const friendData = friendSnapshot.data();
    
            await updateDoc(friendRef, {
                friends: [...(friendData?.friends || []), userID],
            });
    
            toggleFriendPopup();
        } catch (error) {
            console.error("Error adding friend:", error);
        }
    };

    const removeFriend = async (friendID) => {
        try {
            const userRef = doc(database, "UserInfo", userID);
            const friendRef = doc(database, "UserInfo", friendID);
    
            // 나의 친구 목록 업데이트
            const updatedFriends = friends.filter((id) => id !== friendID);
            await updateDoc(userRef, { friends: updatedFriends });
    
            // 상대방 친구 목록 업데이트
            const friendSnapshot = await getDoc(friendRef);
            const friendData = friendSnapshot.data();
            const updatedFriendList = (friendData?.friends || []).filter((id) => id !== userID);
            await updateDoc(friendRef, { friends: updatedFriendList });
    
            setFriends(updatedFriends); // 로컬 상태 업데이트
        } catch (error) {
            console.error("Error removing friend:", error);
        }
    };
    
    const joinRoom = async (roomID) => {
        try {
            const userRef = doc(database, "UserInfo", userID);
            const roomRef = doc(database, "ChatRooms", roomID);
    
            // 나의 채팅방 목록 업데이트
            await updateDoc(userRef, {
                rooms: [...rooms, roomID],
            });
    
            // 채팅방의 members 업데이트
            const roomSnapshot = await getDoc(roomRef);
            const roomData = roomSnapshot.data();
    
            await updateDoc(roomRef, {
                members: [...(roomData?.members || []), userID],
            });
    
            toggleChatPopup();
        } catch (error) {
            console.error("Error joining room:", error);
        }
    };

    const leaveRoom = async (roomID) => {
        try {
            const userRef = doc(database, "UserInfo", userID);
            const roomRef = doc(database, "ChatRooms", roomID);
    
            // 나의 채팅방 목록 업데이트
            const updatedRooms = rooms.filter((id) => id !== roomID);
            await updateDoc(userRef, { rooms: updatedRooms });
    
            // 채팅방의 members 업데이트
            const roomSnapshot = await getDoc(roomRef);
            const roomData = roomSnapshot.data();
            const updatedMembers = (roomData?.members || []).filter((id) => id !== userID);
            await updateDoc(roomRef, { members: updatedMembers });
    
            setRooms(updatedRooms); // 로컬 상태 업데이트
        } catch (error) {
            console.error("Error leaving room:", error);
        }
    };

    const filteredAccounts = allAccounts.filter(
        (account) => account.id !== userID && !friends.includes(account.id)
    );

    const removeFilteredAccounts = allAccounts.filter(
        (account) => account.id !== userID && friends.includes(account.id)
    )

    const filteredRooms = allRooms.filter((room) => !rooms.includes(room.id));

    const removeFilteredRooms = allRooms.filter((room) => rooms.includes(room.id));

    return (
        <div className="mypage-wrapper">
            <div className="nums">
                <div className="friends-num">
                    <div className="toolbar">
                        <span>Friends</span>
                        <div className="button-group">
                            <button className="add-friend" onClick={toggleFriendPopup}>+</button>
                            <button className="del-friend" onClick={toggleRemoveFriendPopup}>-</button>
                        </div>
                    </div>
                    <span>{friendNum}</span>
                </div>
                <div className="chats-num">
                    <div className="toolbar">
                        <span>Chats</span>
                        <div className="button-group">
                            <button className="add-chat" onClick={toggleChatPopup}>+</button>
                            <button className="del-chat" onClick={toggleLeaveChatPopup}>-</button>
                        </div>
                    </div>
                    <span>{chatNum}</span>
                </div>
            </div>
            {/* Remove Friend Popup */}
            {showRemoveFriendPopup && (
                <div className="popup">
                    <h3>Remove Friends</h3>
                    <input
                        type="text"
                        placeholder="Search for friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <ul className="popup-list">
                        {removeFilteredAccounts
                            .filter((account) => account.id.includes(searchQuery))
                            .map((account) => (
                                <li key={account.id}>
                                    {account.id}
                                    <button onClick={() => removeFriend(account.id)}>Remove</button>
                                </li>
                            ))}
                    </ul>
                    <button className="close-popup" onClick={toggleRemoveFriendPopup}>Close</button>
                </div>
            )}
    
            {/* Leave Chat Room Popup */}
            {showLeaveChatPopup && (
                <div className="popup">
                    <h3>Leave Chat Rooms</h3>
                    <input
                        type="text"
                        placeholder="Search for friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <ul className="popup-list">
                        {removeFilteredRooms
                            .filter((room) => room.title.includes(searchQuery))
                            .map((room) => (
                                <li key={room.id}>
                                    {room.title}
                                    <button onClick={() => leaveRoom(room.id)}>Leave</button>
                                </li>
                            ))}
                    </ul>
                    <button className="close-popup" onClick={toggleLeaveChatPopup}>Close</button>
                </div>
            )}
            
            {/* Friend Popup */}
            {showFriendPopup && (
                <div className="popup">
                    <h3>Add Friends</h3>
                    <input
                        type="text"
                        placeholder="Search for friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <ul className="popup-list">
                        {filteredAccounts
                            .filter((account) => account.id.includes(searchQuery))
                            .map((account) => (
                                <li key={account.id}>
                                    {account.id}
                                    <button onClick={() => addFriend(account.id)}>Add</button>
                                </li>
                            ))}
                    </ul>
                    <button className="close-popup" onClick={toggleFriendPopup}>Close</button>
                </div>
            )}

            {/* Chat Popup */}
            {showChatPopup && (
                <div className="popup">
                    <h3>Join Chat Room</h3>
                    <input
                        type="text"
                        placeholder="Search for chat rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <ul className="popup-list">
                        {filteredRooms
                            .filter((room) => room.title.includes(searchQuery))
                            .map((room) => (
                                <li key={room.id}>
                                    {room.title}
                                    <button onClick={() => joinRoom(room.id)}>Join</button>
                                </li>
                            ))}
                    </ul>
                    <button className="close-popup" onClick={toggleChatPopup}>Close</button>
                </div>
            )}
        </div>
    )
}

export default MyPage;