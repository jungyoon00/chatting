import React, { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { database } from "../../db/firebaseConfig";
import "../../style/UserPage.css";

function UserPage(props) {
    const userID = props.userID;
    const [userData, setUserData] = useState({});
    const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태
    const [editData, setEditData] = useState({}); // 수정할 데이터 상태

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(database, "UserInfo", userID), (snapshot) => {
            const getData = snapshot.data();
            if (getData) {
                let data = {
                    userID: userID,
                    userName: getData.name,
                    userEmail: getData.email,
                    userInsta: getData.instagram,
                    userMore: getData.more,
                };
                setUserData(data);
                if (!isEditing) setEditData(data);
            } else {
                console.log("등록된 정보가 없습니다");
            }
        });
        return () => unsubscribe(); // 구독 해제
    }, [userID, isEditing]);

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Edit 버튼 클릭 핸들러
    const onClickEditInfo = () => {
        setIsEditing(true); // 수정 모드로 전환
    };

    // Save 버튼 클릭 핸들러
    const onClickSaveInfo = async () => {
        setIsEditing(false); // 편집 모드 종료
        const userDocRef = doc(database, "UserInfo", userID);
        try {
            await updateDoc(userDocRef, {
                name: editData.userName,
                email: editData.userEmail,
                instagram: editData.userInsta,
                more: editData.userMore,
            });
            console.log("Document successfully updated!");
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    return (
        <div className="user-wrapper">
            {isEditing ? (
                // 수정 모드일 때 입력 필드 표시
                <>
                    <div>
                        NAME: <input type="text" name="userName" value={editData.userName} onChange={handleChange} />
                    </div>
                    <div>
                        Email: <input type="text" name="userEmail" value={editData.userEmail} onChange={handleChange} />
                    </div>
                    <div>
                        Instagram: <input type="text" name="userInsta" value={editData.userInsta} onChange={handleChange} />
                    </div>
                    <div>
                        More: <input type="text" name="userMore" value={editData.userMore} onChange={handleChange} />
                    </div>
                    <button className="editInfo" onClick={onClickSaveInfo}>Save</button>
                </>
            ) : (
                // 일반 모드일 때 텍스트만 표시
                <>
                    <div>NAME: {userData.userName}</div>
                    <div>Email: {userData.userEmail}</div>
                    <div>Instagram: {userData.userInsta}</div>
                    <div>More: {userData.userMore}</div>
                    <button className="editInfo" onClick={onClickEditInfo}>Edit</button>
                </>
            )}
        </div>
    );
}

export default UserPage;