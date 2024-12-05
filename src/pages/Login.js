import { useNavigate } from "react-router-dom";
import useGlobalState from "../store/zustandStore";
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { database } from "../db/firebaseConfig";
import "../style/Login.css";

function Login() {
    const navigate = useNavigate();

    const setGlobalUserID = useGlobalState((state) => state.setUserID);
    const setActivate = useGlobalState((state) => state.setActivate);

    const [userID, setUserID] = useState('');
    const [userPW, setUserPW] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUserID = (e) => {
        setUserID(e.target.value);
        setGlobalUserID(e.target.value);
    }

    const handleUserPW = (e) => {
        setUserPW(e.target.value);
    }

    const [getID, setGetID] = useState('');
    const [getPW, setGetPW] = useState('');
    const [getPWCheck, setGetPWCheck] = useState('');
    
    const handleGetID = (e) => {
        setGetID(e.target.value);
    }

    const handleGetPW = (e) => {
        setGetPW(e.target.value);
    }
    
    const handleGetPWCheck = (e) => {
        setGetPWCheck(e.target.value);
    }

    const onClickConfirmBtn = () => {
        setIsLoading(true);

        const userData = {
            userID: userID,
            userPW: userPW,
        };

        fetch("http://192.168.0.50:3001/login", {
            method: "post",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(userData),
        }).then(
            (res) => res.json()
        ).then((json) => {
            if (json.isLogin === "True") {
                setGlobalUserID(userID);
                setActivate(true);
                navigate("/home");
            } else {
                alert(json.isLogin);
            }
        });
    }

    const userAdder = async (userID) => {
        try {
            // Firestore의 UserInfo 컬렉션에 userID를 문서 ID로 사용하여 저장
            await setDoc(doc(database, "UserInfo", userID), {name: userID});
        } catch (error) {
            console.error("Error creating user: ", error);
        }
    }
    
    const onClickSigninBtn = () => {
        setIsLoading(true);

        const userData = {
            getID: getID,
            getPW: getPW,
            getPWCheck: getPWCheck,
        };

        fetch("http://192.168.0.50:3001/signin", {
            method: "post",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(userData),
        }).then((res) => res.json()).then((json) => {
            if (json.isSuccess === "True") {
                userAdder(getID);
                alert("Your account has been created.");
            } else {
                alert(json.isSuccess);
            }
        });
    }

    const [tab, setTab] = useState("signin");

    const toggleContainers = () => {
        const signinContainer = document.querySelector(".signin-container");
        const signupContainer = document.querySelector(".signup-container");

        if (signinContainer && signupContainer) {
            signinContainer.style.display = tab === 'signin' ? 'block' : 'none';
            signupContainer.style.display = tab === 'signup' ? 'block' : 'none';
        }
    }

    useEffect(() => {
        toggleContainers();
    }, [tab]);

    toggleContainers();

    return (
        <div className="wrapper-login">
            <div className="selector">
                <input id="signin-tab" type="radio" name="tab" className="signin" checked={tab === 'signin'} onChange={() => setTab('signin')} /><label htmlFor="signin-tab" className="tab">Sign In</label>
                <input id="signup-tab" type="radio" name="tab" className="signup" checked={tab === 'signup'} onChange={() => setTab('signup')} /><label htmlFor="signup-tab" className="tab">Sign Up</label>
            </div>
            <div className="main-container">
                <div className="signin-container">
                    <span className="signin-error" id="signin-msg"></span>
                    <div className="box">
                        <h4>Ch<span>aaa</span>tting</h4>
                        <input type="text" name="userID" placeholder="ID" id="id" autoComplete="off" value={userID} onChange={handleUserID} />
                        <input type="password" name="userPW" placeholder="PASSWORD" id="password" autoComplete="off" value={userPW} onChange={handleUserPW} />
                        <button
                            className="confirm"
                            onClick={onClickConfirmBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? <span className="loader"></span> : "Log In"}
                        </button>
                    </div>
                </div>
                <div className="signup-container">
                    <span className="signup-error" id="signup-msg"></span>
                    <div className="box">
                        <h4>Ch<span>aaa</span>tting</h4>
                        <input type="text" name="getID" placeholder="ID" id="id" autoComplete="off" value={getID} onChange={handleGetID} />
                        <input type="password" name="getPW" placeholder="PASSWORD" id="password" autoComplete="off" value={getPW} onChange={handleGetPW} />
                        <input type="password" name="getPWCheck" placeholder="REPEAT" id="password" autoComplete="off" value={getPWCheck} onChange={handleGetPWCheck} />
                        <button
                            className="signin"
                            onClick={onClickSigninBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? <span className="loader"></span> : "Sign In"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;