# 実装ロードマップ

このドキュメントは Next Weather Three App の実装ステップをまとめ、開発方針の継続と進捗の把握を助けます。

## 完了済み
- `useGeolocation` フックによる基本的な位置情報取得（テストあり）
- JMA（Open-Meteo JMA）から気温を取得し、`normalizeTempC` で正規化
- 正規化された気温値（`uTemp`）に応じて反応するシェーダ（fbm統合済み）
- fbm シェーダを `WeatherThreeScene` に統合（`app/shaders/fbm.ts`）
- FBO（オフスクリーン）でシェーダをテクスチャ化し、オブジェクトへマッピングする最小実装
  - フック: `useShaderFBOTexture`、例ページ: `/fbo-example`
- Weather（天気）拡張の土台
  - `weathercode` の日本語化（`weathercodeToJa`）
  - JMAの複数パラメータ（`weathercode, precipitation, cloudcover`）の取得とUI表示（`/open-meteo`）
  - APIルートでURL生成を `buildJmaUrlWithFields` に一元化（非破壊リファクタ）
- TDD/テストの整備
  - `normalize`, `useGeolocation`, `jma`（URL/取得/正規化）, `weathercode`, `fbm`（構造）, FBOヘルパ（`createFbmUniforms/smoothFollow/getFboSize`）のテスト

## 今後の予定
1. **天候パラメータの拡充**: 取得済みの `weathercode/precipitation/cloudcover` を shader uniform に接続し表現を拡張（例: 雨粒・雲量によるコントラスト/速度変化、天気コードでカラーパレット切替）
2. **自動更新とキャッシュ**: ポーリング/フォーカス時再検証（SWR等）＋ブラウザ/サーバキャッシュ。APIリクエスト間隔・Stale-While-Revalidate の戦略を決定
3. **API キーと環境変数の管理**: 他プロバイダ（OpenWeatherMap など）導入時に `.env` 管理、サーバ側での秘匿、型付け（`process.env`）
4. **堅牢なエラーハンドリング**: リトライ（指数バックオフ）、オフライン検出とフォールバック、位置情報拒否時の入力補助UIを強化
5. **UI/UX の向上**: デバッグGUI（leva 等）で uniform を操作、`/open-meteo` と FBO 表示の統合、状態表示の整理
6. **テストと CI の整備**: 既存テストを維持拡充し、CI（GitHub Actions）で typecheck/lint/test を自動化
7. **パフォーマンス**: FBO解像度の自動調整、非アクティブ時のレンダ抑制、必要に応じて `LinearMipmapLinearFilter` 等の検証
8. **API設計の方針**: 現状 `/api/jma` は上流の生JSON互換を維持。正規化配列を返す新エンドポイントは要件が固まってから（バージョン/別パス）

## 現在地の天気予報をシェーダに反映する実装方針
1. **位置情報の取得**: `navigator.geolocation` で緯度・経度を取得し、利用不可の場合はIPベースの位置情報APIを検討する。
2. **天気予報APIへのリクエスト**: Open-MeteoやOpenWeatherMapなどのAPIに座標を渡し、気温・降水量・天気コードなどを取得する。
3. **データの正規化**: 取得した値を0〜1などの扱いやすい範囲に変換し、必要なら数値コードにマッピングする。
4. **シェーダへの受け渡し**: 正規化した値を`uniform`としてシェーダに渡し、温度や降水量を表現のパラメータとして利用する。
5. **描画ロジック**: 天候に応じて色合いや動きを変化させる処理を実装する。例: 晴れ→光量増加、雨→パーティクル降下。
6. **更新処理**: 一定間隔でAPIを再取得し、シェーダを再描画して最新の天候を反映する。
7. **エラーハンドリング**: API失敗時のリトライやキャッシュ利用、位置情報拒否時のフォールバックUIを用意する。
8. **開発・デバッグ**: モックデータやGUIを活用してパラメータの確認や調整を行う。

タスクが完了したり新しいアイデアが出てきた場合は、このロードマップを更新してください。
