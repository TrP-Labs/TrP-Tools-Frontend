"use server"
export default async function getUserInfo(userId : string) {
    const userRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const userData = await userRes.json();
  
    const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
    const thumbData = await thumbRes.json();
  
    return {
      username: userData.name,
      displayName: userData.displayName,
      profileImage: thumbData.data[0]?.imageUrl
    };
}