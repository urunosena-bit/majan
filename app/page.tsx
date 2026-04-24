import Image from "next/image"

export default function Home() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>4人の共有アプリ</h1>
      <p>ここがアプリのトップ画面になります！</p>
      <ul style={{ marginTop: '20px' }}>
        <li>目標1：データを表示する</li>
        <li>目標2：4人で共有する</li>
      </ul>
    </div>
  );
}