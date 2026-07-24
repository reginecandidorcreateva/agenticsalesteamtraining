import SettingsForm from "./SettingsForm";

export default function SettingsPage() {
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
        Settings
      </h1>
      <SettingsForm />
    </div>
  );
}
