import { useAuth } from "@/context/AuthContext";


export default function Home() {
  const { isLoggedIn, accessToken, refreshToken, login, logout } = useAuth();

  return (
    <div>
      <h1>{isLoggedIn ? "Welcome, you're logged in!" : "You are not logged in"}</h1>
      
      {/* ถ้าไม่ล็อกอินจะแสดงปุ่ม Login */}
      {!isLoggedIn ? (
        <button
          onClick={() => {
            login("sampleAccessToken", "sampleRefreshToken");
          }}
        >
          Login
        </button>
      ) : (
        <>
          {/* ถ้าล็อกอินแล้ว แสดงข้อมูลและปุ่ม Logout */}
          <p>Access Token: {accessToken}</p>
          <p>Refresh Token: {refreshToken}</p>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </div>

  );
}
