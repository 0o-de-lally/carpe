<script lang="ts">
  import { _ } from '../../lang/i18n'
  import { link } from 'svelte-spa-router'
  import { routes } from '../../modules/routes'
</script>

<main class="uk-margin uk-flex uk-flex-center" uk-grid>
  <div uk-grid class="uk-margin uk-flex uk-flex-center">
    <a href={routes.keygen} use:link>
      <button class="uk-button uk-button-secondary">{$_('wallet.btn_new_account')}</button>
    </a>
    <a href={routes.accountFromMnem} use:link>
      <button class="uk-button uk-button-default">{$_('wallet.btn_restore_account')}</button>
    </a>
    <a href={routes.addWatchAccount} use:link>
      <button class="uk-button uk-button-default">{$_('wallet.btn_add_watch_account')}</button>
    </a>
  </div>
</main>
