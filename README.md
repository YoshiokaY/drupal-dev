# Drupal Dev

Drupal 11 + フロントエンド開発環境

## 技術スタック

| カテゴリ       | 技術                             |
| -------------- | -------------------------------- |
| CMS            | Drupal 11                        |
| ローカル環境   | Lando + phpMyAdmin + Xdebug      |
| ビルド         | Webpack + Webpack Dev Server     |
| CSS            | SCSS                             |
| JavaScript     | TypeScript                       |
| テンプレート   | EJS（静的HTML） → Twig（Drupal） |
| リンター       | ESLint + Stylelint + Prettier    |
| Git Hooks      | husky + lint-staged              |

## ディレクトリ構造

```
drupal-dev/
├── .lando.yml              # Lando設定
├── .lando/
│   └── php.ini             # PHP設定（Xdebug含む）
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
- Lando v3.6+
- Node.js 20+
- npm 10+

### 1. フロントエンド環境のセットアップ

```bash
cd frontend
npm install
```

### 2. Drupal環境のセットアップ

```bash
# Lando起動（初回は時間がかかります）
lando start

# Drupal 11をインストール
lando composer create-project drupal/recommended-project:^11 /tmp/drupal --no-interaction
lando ssh -c "cp -r /tmp/drupal/* /app/ && cp -r /tmp/drupal/.[!.]* /app/ 2>/dev/null || true"

# Drushインストール
lando composer require drush/drush

# Drupalサイトインストール
lando drush site:install standard \
  --db-url=mysql://drupal11:drupal11@database/drupal11 \
  --site-name="Drupal Dev" \
  --account-name=admin \
  --account-pass=admin \
  -y

# カスタムテーマを有効化
lando drush theme:enable my_theme
lando drush config:set system.theme default my_theme -y

# キャッシュクリア
lando drush cr
```

### 3. 確認

```bash
lando info
```

| サービス    | URL                                |
| ----------- | ---------------------------------- |
| Drupal      | https://drupal-dev.lndo.site       |
| phpMyAdmin  | https://pma.drupal-dev.lndo.site   |

## 開発ワークフロー

### Phase 1: 静的HTML開発

```bash
cd frontend

# 開発サーバー起動（http://localhost:3000）
npm run dev

# ビルド
npm run build
```

### Phase 2: Drupalテーマ開発

```bash
cd frontend

# Drupalテーマに直接出力（watchモード）
npm run dev:drupal

# 本番ビルド
npm run build:drupal
```

SCSS/TSを編集すると `web/themes/custom/my_theme/css/` と `js/` に自動で出力されます。

## npm scripts

| コマンド            | 説明                                      |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | 静的HTML開発サーバー起動                  |
| `npm run build`     | 静的HTMLビルド（`frontend/dist`）         |
| `npm run dev:drupal`| Drupalテーマに出力（watchモード）         |
| `npm run build:drupal` | Drupalテーマに本番ビルド               |
| `npm run lint`      | ESLint + Stylelint 実行                   |
| `npm run lint:fix`  | Lint エラーを自動修正                     |
| `npm run format`    | Prettier でフォーマット                   |

## Lando コマンド

| コマンド            | 説明                       |
| ------------------- | -------------------------- |
| `lando start`       | 環境起動                   |
| `lando stop`        | 環境停止                   |
| `lando rebuild`     | 環境再構築                 |
| `lando drush <cmd>` | Drushコマンド実行          |
| `lando composer <cmd>` | Composerコマンド実行    |
| `lando ssh`         | appserverにSSH接続         |
| `lando info`        | 接続情報表示               |

## Xdebug

### VSCode設定

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
        "/app": "${workspaceFolder}"
      }
    }
  ]
}
```

## トラブルシューティング

### Lando起動エラー

```bash
lando rebuild -y
```

### キャッシュクリア

```bash
lando drush cr
```

### npm依存関係エラー

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```
