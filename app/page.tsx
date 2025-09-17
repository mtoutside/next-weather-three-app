import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Next Weather App</h1>
        <p>このリポジトリは天気アプリのベースです。</p>
        <ol>
          <li>UI/ディレクトリ構成はNext.js App Router準拠</li>
          <li>
            サンプルとして <code>/three</code> にThree.jsデモを配置
          </li>
          <li>APIキーや認証処理は未実装（用途に合わせて追加）</li>
        </ol>
        <div className={styles.ctas}>
          <a className="secondary" href="/three">
            Three.js デモを見る
          </a>
          <a className="secondary" href="/open-meteo">
            Open-Meteo データ確認
          </a>
          <a className="secondary" href="/fbo-example">
            FBO シェーダ例
          </a>
          <a className="secondary" href="https://nextjs.org/docs" target="_blank" rel="noreferrer">
            Next.js ドキュメント
          </a>
        </div>
      </main>
    </div>
  );
}
