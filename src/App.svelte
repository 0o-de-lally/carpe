<script lang="ts">
  // CSS
  import Style from './style/Style.svelte'
  // JS
  // import { listen } from '@tauri-apps/api/event'
  // import type { Event } from '@tauri-apps/api/event'
  import { onDestroy, onMount } from 'svelte'
  import router from 'svelte-spa-router'

  // CARPE MODULES
  // import {
  //   backlogInProgress,
  //   backlogListenerReady,
  //   backlogSubmitted,
  //   minerEventReceived,
  // } from './modules/miner'
  // import { raise_error } from './modules/carpeError'
  // import type { CarpeError, CarpeOkReturn } from './modules/carpeError'
  import { debugMode } from './modules/debug'
  import { routes } from './modules/routes'
  import 'uikit/dist/css/uikit.min.css'
  import { init_locale_preferences } from './modules/preferences'
  import { bootUp } from './modules/boot'
  import { isInit } from './modules/accounts'

  // UI COMPONENTS
  import Nav from './components/Nav.svelte'
  import DebugCard from './components/dev/DebugCard.svelte'
  import Wallet from './components/wallet/Wallet.svelte'
  import AccountDetails from './components/wallet/AccountDetails.svelte'
  // import Miner from './components/miner/Miner.svelte'
  import Settings from './components/settings/Settings.svelte'
  import DevMode from './components/dev/DevMode.svelte'
  import AccountCreate from './components/wallet/AccountCreate.svelte'
  import Keygen from './components/wallet/Keygen.svelte'
  import AddWatchAccount from './components/wallet/AddWatchAccount.svelte'
  import Transactions from './components/txs/Transactions.svelte'
  import Events from './components/events/Events.svelte'
  import About from './components/about/About.svelte'
  import SearchingFullnodes from './components/layout/SearchingFullnodes.svelte'
  // import RecoveryMode from './components/layout/RecoveryMode.svelte'
  import MakeWhole from './components/make-whole/MakeWhole.svelte'
  import SpinnerAccount from './components/layout/SpinnerAccount.svelte'
  // import { maybeTowerOnce as maybeTowerOnce } from './modules/miner_invoke'
    import KeyError from './components/layout/KeyError.svelte'
    import UpgradeApp from './components/about/UpgradeApp.svelte'
    import { tryUpdate } from './modules/updater'
    import { isLoading } from 'svelte-i18n'
    import { isBooted } from './modules/boot'
    import SplashScreen from './components/layout/SplashScreen.svelte'

  // black magic with I18n here
  // temporarily set up here otherwise... issues
  init_locale_preferences()

  // Configure routes for svelte-spa-router
  const routesConfig = {
    [routes.wallet]: Wallet,
    [routes.accountDetails]: AccountDetails,
    [routes.accountFromMnem]: AccountCreate,
    [routes.addWatchAccount]: AddWatchAccount,
    [routes.keygen]: Keygen,
    [routes.transfer]: Transactions,
    [routes.events]: Events,
    [routes.settings]: Settings,
    [routes.about]: About,
    [routes.makeWhole]: MakeWhole,
    [routes.developer]: DevMode,
    // Default route
    '/': Wallet
  }

  // let unlistenProofStart
  // let unlistenAck
  // let unlistenBacklogSuccess
  // let unlistenBacklogError

  onMount(async () => {
    tryUpdate()
    bootUp()

    ///// Backlog /////
    // Todo: Should this listener only be started in the miner view?

    // submitted tower txs, which happens with backlog, requires a private key.
    // so that the user does not need to keep authorizing the key,
    // there is a listener service which loads the key once, and then waits for a specific
    // event to trigger the backlog submission.

    // unlistenProofStart = await listen('proof-start', (event: CarpeOkReturn) => {
    //   responses.set(event.payload)
    //   //update the tower stats after we show the backlog being up to date.
    //   minerEventReceived.set(true)
    // })

    // unlistenAck = await listen('ack-backlog-request', () => {
    //   backlogInProgress.set(true)
    //   backlogSubmitted.set(false)

    //   // set listener ready in case
    //   backlogListenerReady.set(true)
    // })

    // unlistenBacklogSuccess = await listen('backlog-success', (event: CarpeOkReturn) => {
    //   responses.set(event.payload)
    //   //update the tower stats after we show the backlog being up to date.
    //   backlogInProgress.set(false)
    //   backlogSubmitted.set(true)

    //   // this is what keeps the loop going
    //   maybeTowerOnce()
    // })

    // unlistenBacklogError = await listen('backlog-error', (event: Event<CarpeError>) => {
    //   // TODO: show an UX in the miner view for this type of error

    //   raise_error(event.payload, true, 'listen(backlog-error)')

    //   backlogInProgress.set(false)
    //   backlogSubmitted.set(false)
    // })
  })

  onDestroy(() => {
    // unlistenProofStart()
    // unlistenAck()
    // unlistenBacklogSuccess()
    // unlistenBacklogError()
  })
</script>
{#if $isLoading}
<main class="uk-background-muted uk-height-viewport uk-flex uk-flex-center uk-flex-middle uk-flex-column" >
  <span class="uk-text-large">Please wait...</span>
</main>
{:else}
<main class="uk-background-muted uk-height-viewport" >
  <Style />
  <UpgradeApp />

  {#if !$isBooted}
    <SplashScreen />
  {/if}

  {#if $isInit}
    <SearchingFullnodes />
    <KeyError/>
    <SpinnerAccount />
    <!-- <RecoveryMode /> -->
  {/if}

  <div class="uk-container">
    <Nav />
    <div class="uk-background-muted uk-margin-large">
      <svelte:component this={router} routes={routesConfig} />
    </div>

    <!-- Show Debug Card Below -->
    {#if $debugMode}
      <DebugCard />
    {/if}
  </div>
</main>
{/if}

