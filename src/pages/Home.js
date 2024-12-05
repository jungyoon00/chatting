import { useNavigate } from "react-router-dom";
import useGlobalState from "../store/zustandStore";
import React, { useState } from "react";
import { faHouse, faUser, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../style/Home.css";

import MyPage from "./components/Mypage";
import UserPage from "./components/UserPage";
import ChatPage from "./components/ChatPage";

function Home() {
    const navigate = useNavigate();

    const userID = useGlobalState((state) => state.userID);
    const setUserID = useGlobalState((state) => state.setUserID);
    const setActivate = useGlobalState((state) => state.setActivate);

    const onClickLogoutBtn = () => {
        setUserID("Guest");
        setActivate(false);
        navigate("/login");
    };

    const [view, setView] = useState('chat');

    const handleUser = () => {
        setView('user');
    }

    const handleHome = () => {
        setView('mypage');
    }

    const handleChat = () => {
        setView('chat');
    }

    return (
        <div className="wrapper">
            <div className="account-container">
                <span>{userID}</span>
                <button className="logout" onClick={onClickLogoutBtn}>Logout</button>
            </div>
            <div className="view-container">
                {(view === 'user') && <UserPage userID={userID} />}
                {(view === 'mypage') && <MyPage userID={userID} />}
                {(view === 'chat') && <ChatPage userID={userID} />}
            </div>
            <nav className="bottom-container">
                <div className="go-user" onClick={handleUser}>
                    <FontAwesomeIcon icon={faUser} />
                </div>
                <div className="go-home" onClick={handleHome}>
                    <FontAwesomeIcon icon={faHouse} />
                </div>
                <div className="go-chat" onClick={handleChat}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </div>
            </nav>
        </div>
    );
}

export default Home;