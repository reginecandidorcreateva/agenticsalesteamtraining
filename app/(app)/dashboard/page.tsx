import HomeClient from "@/app/HomeClient";

export default function DashboardPage() {
  return (
    <div>
      <h1
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: 28,
          color: "#250835",
          margin: "0 0 20px",
        }}
      >
        Dashboard
      </h1>
      <HomeClient />
    </div>
  );
}
