# Drupal Dev

Drupal 11 + フロントエンド開発環境

## 技術スタック

| カテゴリ     | 技術                              |
| ------------ | --------------------------------- |
| CMS          | Drupal 11                         |
| ローカル環境 | DDEV + phpMyAdmin + Xdebug        |
| ビルド       | Webpack + Webpack Dev Server      |
| CSS          | SCSS                              |
| JavaScript   | TypeScript                        |
| テンプレート | EJS（静的 HTML） → Twig（Drupal） |
| リンター     | ESLint + Stylelint + Prettier     |
| Git Hooks    | husky + lint-staged               |

## ディレクトリ構造

```
drupal-dev/
├── .ddev/                  # DDEV設定
│   ├── config.yaml
│   └── scripts/            # 自動化スクリプト
│       └── setup.sh
├── frontend/               # フロントエンド開発環境
│   ├── src/
│   │   ├── templates/      # EJSテンプレート
│   │   ├── scss/           # SCSSソース
│   │   └── ts/             # TypeScriptソース
│   └── dist/               # 静的HTMLビルド出力
├── web/                    # Drupal webroot
│   └── themes/custom/my_theme/
│       ├── templates/      # Twigテンプレート
│       ├── css/            # ビルド済みCSS（自動出力）
│       └── js/             # ビルド済みJS（自動出力）
└── vendor/                 # Composer依存
```

## セットアップ

### 必要条件

- Docker Desktop
- DDEV v1.24+
- Node.js 20+
- npm 10+

### クイックスタート（自動セットアップ）

```bash
# 1. フロントエンド依存をインストール
cd frontend
npm install
cd ..

# 2. DDEV起動（Drupalが自動でセットアップされます）
ddev start
```

`ddev start` を実行すると、以下が自動で行われます：

- Drupal 11 のインストール
- Drush のインストール
- サイトのインストール（日本語設定込み）
- カスタムテーマの有効化
- 不要なブロックの非表示

### 確認

```bash
ddev describe
```

| サービス   | URL                          |
| ---------- | ---------------------------- |
| Drupal     | https://drupal-dev.ddev.site |
| phpMyAdmin | `ddev phpmyadmin` で起動     |

**管理者アカウント:** `admin` / `admin`

## 開発ワークフロー

### Phase 1: 静的 HTML 開発

```bash
cd frontend

# 開発サーバー起動（http://localhost:3000）
npm run dev

# ビルド
npm run build
```

### Phase 2: Drupal テーマ開発

```bash
cd frontend

# Drupalテーマに直接出力（watchモード）
npm run dev:drupal

# 本番ビルド
npm run build:drupal
```

SCSS/TS を編集すると `web/themes/custom/my_theme/css/` と `js/` に自動で出力されます。

## npm scripts

| コマンド               | 説明                                |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | 静的 HTML 開発サーバー起動          |
| `npm run build`        | 静的 HTML ビルド（`frontend/dist`） |
| `npm run dev:drupal`   | Drupal テーマに出力（watch モード） |
| `npm run build:drupal` | Drupal テーマに本番ビルド           |
| `npm run lint`         | ESLint + Stylelint 実行             |
| `npm run lint:fix`     | Lint エラーを自動修正               |
| `npm run format`       | Prettier でフォーマット             |

## DDEV コマンド

| コマンド              | 説明                    |
| --------------------- | ----------------------- |
| `ddev start`          | 環境起動                |
| `ddev stop`           | 環境停止                |
| `ddev restart`        | 環境再起動              |
| `ddev drush <cmd>`    | Drush コマンド実行      |
| `ddev composer <cmd>` | Composer コマンド実行   |
| `ddev ssh`            | web コンテナに SSH 接続 |
| `ddev describe`       | 接続情報表示            |
| `ddev phpmyadmin`     | phpMyAdmin を開く       |
| `ddev xdebug on`      | Xdebug を有効化         |
| `ddev xdebug off`     | Xdebug を無効化         |

## Xdebug

### 有効化

```bash
ddev xdebug on
```

### VSCode 設定

`.vscode/launch.json` を作成：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for Xdebug",
      "type": "php",
      "request": "launch",
      "port": 9003,
      "pathMappings": {
        "/var/www/html": "${workspaceFolder}"
      }
    }
  ]
}
```

## トラブルシューティング

### DDEV 起動エラー

```bash
ddev restart
```

### キャッシュクリア

```bash
ddev drush cr
```

### npm 依存関係エラー

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### セットアップを最初からやり直す

```bash
# データベースとDrupalファイルを削除して再セットアップ
ddev stop
ddev delete -O
rm -rf web vendor composer.json composer.lock
ddev start
```
