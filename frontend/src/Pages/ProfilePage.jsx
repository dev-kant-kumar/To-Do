import React from "react";
import { useSelector } from "react-redux";
function ProfilePage() {
  const userInfo = useSelector((state) => state.UserSlice);
  const todoData = useSelector((state) => state.TodoFilterSlice);
  console.log(todoData);
  return (
    <div id="profile-page-main-container">
      <div id="profile-header">
        <section id="profile-header-banner">
          {/* <img src="" alt="profile-banner" /> */}
        </section>
        <section id="profile-header-info">
          <section id="phi-pic">
            {/* <img src="" alt="profile-pic" /> */}
          </section>
          <section id="phi-user-info">
            <h1>{userInfo?.name}</h1>
            <h3>@{userInfo.username}</h3>
          </section>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
