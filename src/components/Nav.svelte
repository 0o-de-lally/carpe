<script lang="ts">
  import { link, location } from 'svelte-spa-router'
  import { _ } from '../lang/i18n'
  import { routes } from '../modules/routes'

  // views
  import AccountSwitcher from './wallet/AccountSwitcher.svelte'
  import { signingAccount } from '../modules/accounts'

  // import MakeWholeLink from "./make-whole/MakeWholeLink.svelte";
  // init_preferences()

  const secondaryRoutes = [
    routes.settings,
    routes.about,
    routes.developer,
    routes.keygen,
    routes.accountFromMnem,
    routes.addWatchAccount,
    routes.accountDetails
  ]

  $: watchOnly = $signingAccount?.watch_only
</script>

<main class="uk-margin-top">
  <nav class="uk-navbar-container" uk-navbar>
    {#if secondaryRoutes.includes($location)}
      <a href={routes.wallet} use:link
        ><span class="uk-text-muted" uk-icon="icon: arrow-left; ratio: 2" /></a
      >
    {/if}

    {#if $signingAccount}
      <div class="uk-navbar-center">
        <ul class="uk-navbar-nav uk-flex">
          <li class="uk-padding {$location.includes('wallet') ? 'uk-active' : ''}">
            <a href={routes.wallet} use:link>{$_('nav.wallet')}</a>
          </li>
          <li class="uk-padding {$location.includes('transfer') ? 'uk-active' : ''}">
            <a href={watchOnly ? routes.wallet : routes.transfer} use:link>{$_('nav.transactions')}</a>
          </li>
        </ul>
      </div>
    {/if}
    <div class="uk-navbar-right">
      <ul class="uk-navbar-nav">
        <li>
          <AccountSwitcher />
        </li>
      </ul>
    </div>
  </nav>
</main>
