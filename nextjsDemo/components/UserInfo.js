import React, { useState } from "react";

function UserInfo(props) {
//   const [createdAt, setCreatedAt] = useState(props.user.createdAt);
//   async function changeFormat() {
//     const moment = await import("moment");
//     setCreatedAt(moment.default(createdAt).fromNow());
//   }
  return (
    <>
      <p>name:{props.user.name}</p>
      {/* <p>创建时间:{createdAt}</p>
      <button onClick={changeFormat}>切换为相对时间</button> */}
    </>
  );
}

export default UserInfo;