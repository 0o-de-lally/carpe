<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { link, push } from 'svelte-spa-router'

  import { signingAccount, allAccounts } from '../../modules/accounts'
  import { setAccount } from '../../modules/accountActions'

  import NetworkIcon from './NetworkIcon.svelte'
  import AboutLink from '../about/AboutLink.svelte'
</script>

<main>
  <div>
    <button class="uk-button uk-button-default" type="button">
      <NetworkIcon />
      {#if $allAccounts && $allAccounts.length > 0}
        <span class="uk-margin-small-left">
          {#if $signingAccount}
            {$signingAccount.nickname}
          {:else}
            {$_('wallet.account_switcher.select_account')}
          {/if}
        </span>
      {/if}
    </button>

    <div uk-dropdown>
      <ul class="uk-nav uk-dropdown-nav">
        {#if $signingAccount && $allAccounts && $allAccounts.length > 1}
          <li class="uk-text-muted">
            {$_('wallet.account_switcher.switch_account')}
          </li>
          <li class="uk-nav-divider" />
          {#if !$allAccounts}
            <p>loading...</p>
          {:else}
            {#each $allAccounts.slice().sort((a, b) => a.nickname.localeCompare(b.nickname)) as acc}
              {#if acc.account != 'loading...'}
                <li>
                  <a
                    href={'#'}
                    class={$signingAccount.account == acc.account ? 'uk-text-primary' : ''}
                    on:click={() => {
                      if ($signingAccount.account != acc.account) {
                        if (acc.watch_only) {
                          push('/wallet')
                        }
                        setAccount(acc.account)
                      }
                    }}
                  >
                    {acc.nickname}
                  </a>
                </li>
              {/if}
            {/each}
            <li class="uk-nav-divider" />
          {/if}
        {/if}
        <li>
          <a href="/settings" use:link class="uk-text-muted">
            {$_('wallet.account_switcher.setting')}
          </a>
        </li>
        <li>
          <a href="/dev" use:link class="uk-text-muted">
            {$_('wallet.account_switcher.developers')}
          </a>
        </li>
        <li class="uk-text-muted">
          <AboutLink />
        </li>
      </ul>
    </div>
  </div>
</main>
