#!/bin/bash
#
# Drupal自動セットアップスクリプト
# ddev start時に自動実行される
#

set -e

# 色付きログ出力
log_info() {
  echo -e "\033[0;34m[INFO]\033[0m $1"
}

log_success() {
  echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

log_skip() {
  echo -e "\033[0;33m[SKIP]\033[0m $1"
}

# Drupalがインストール済みかチェック
is_drupal_installed() {
  [ -f /var/www/html/web/sites/default/settings.php ] && \
  drush status bootstrap 2>/dev/null | grep -q "Successful"
}

# Composerプロジェクトが存在するかチェック
has_composer_project() {
  [ -f /var/www/html/composer.json ] && \
  grep -q "drupal/core" /var/www/html/composer.json 2>/dev/null
}

# メイン処理
main() {
  log_info "セットアップを開始します..."

  # 1. Drupalプロジェクトのインストール
  if has_composer_project; then
    log_skip "Composerプロジェクトは既に存在します"
  else
    log_info "Drupal 11をインストール中..."
    composer create-project drupal/recommended-project:^11 /var/www/html/tmp-drupal --no-interaction
    cp -r /var/www/html/tmp-drupal/* /var/www/html/
    cp -r /var/www/html/tmp-drupal/.[!.]* /var/www/html/ 2>/dev/null || true
    rm -rf /var/www/html/tmp-drupal
    log_success "Drupal 11をインストールしました"
  fi

  # 2. Drushのインストール
  if composer show drush/drush 2>/dev/null | grep -q "drush"; then
    log_skip "Drushは既にインストールされています"
  else
    log_info "Drushをインストール中..."
    composer require drush/drush --no-interaction
    log_success "Drushをインストールしました"
  fi

  # 3. Drupalサイトのインストール
  if is_drupal_installed; then
    log_skip "Drupalサイトは既にインストールされています"
  else
    log_info "Drupalサイトをインストール中..."
    drush site:install standard \
      --site-name="Drupal Dev" \
      --account-name=admin \
      --account-pass=admin \
      --locale=ja \
      -y
    log_success "Drupalサイトをインストールしました"

    # 4. 日本語化
    log_info "日本語設定を適用中..."
    drush en locale language -y
    drush language-add ja 2>/dev/null || true
    drush config:set system.site default_langcode ja -y
    drush locale:check
    drush locale:update
    log_success "日本語設定を適用しました"

    # 5. カスタムテーマの有効化
    log_info "カスタムテーマを有効化中..."
    drush theme:enable my_theme -y
    drush config:set system.theme default my_theme -y
    log_success "カスタムテーマを有効化しました"

    # 6. 不要なブロックを非表示
    log_info "不要なブロックを非表示に設定中..."
    drush config:set block.block.my_theme_account_menu status 0 -y 2>/dev/null || true
    drush config:set block.block.my_theme_breadcrumbs status 0 -y 2>/dev/null || true
    drush config:set block.block.my_theme_help status 0 -y 2>/dev/null || true
    drush config:set block.block.my_theme_main_menu status 0 -y 2>/dev/null || true
    drush config:set block.block.my_theme_page_title status 0 -y 2>/dev/null || true
    drush config:set block.block.my_theme_powered status 0 -y 2>/dev/null || true
    drush config:set block.block.my_theme_primary_admin_actions status 0 -y 2>/dev/null || true
    drush config:set block.block.my_theme_primary_local_tasks status 0 -y 2>/dev/null || true
    drush config:set block.block.my_theme_search_form_narrow status 0 -y 2>/dev/null || true
    drush config:set block.block.my_theme_search_form_wide status 0 -y 2>/dev/null || true
    drush config:set block.block.my_theme_secondary_local_tasks status 0 -y 2>/dev/null || true
    drush config:set block.block.my_theme_site_branding status 0 -y 2>/dev/null || true
    log_success "不要なブロックを非表示にしました"
  fi

  # 7. キャッシュクリア
  log_info "キャッシュをクリア中..."
  drush cr
  log_success "キャッシュをクリアしました"

  log_success "セットアップが完了しました！"
  echo ""
  echo "=========================================="
  echo "  Drupal: https://drupal-dev.ddev.site"
  echo "  管理者: admin / admin"
  echo "=========================================="
}

main "$@"
